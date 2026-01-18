import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LearningMap } from '@learningmap/learningmap';
import type { RoadmapState } from '@learningmap/learningmap';
import '@learningmap/learningmap/index.css';
import * as db from './db';
import './Learn.css';
import logo from './logo.svg';

function Learn() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newMapUrl, setNewMapUrl] = useState('');
  const [currentMap, setCurrentMap] = useState<any>(null);
  const [allMaps, setAllMaps] = useState<any[]>([]);
  const updateTimeoutRef = useRef<number | null>(null);
  
  // Extract json ID from hash
  const jsonId = location.hash.startsWith('#json=') ? location.hash.replace('#json=', '') : null;
  
  // Load roadmap data from jsonStore if needed
  useEffect(() => {
    if (!jsonId) return;
    
    const loadMap = async () => {
      // First, check if the map exists in IndexedDB
      const existingMap = await db.getLearningMap(jsonId);
      
      if (existingMap) {
        // Check if the roadmap has a storage ID and handle potential conflicts
        const storageId = existingMap.roadmapData.settings?.id;
        if (storageId && storageId !== jsonId) {
          // There's a custom storage ID - check if a different map exists with that ID
          const mapWithStorageId = await db.getLearningMap(storageId);
          if (mapWithStorageId && mapWithStorageId.roadmapData !== existingMap.roadmapData) {
            // Ask user if they want to replace
            const shouldReplace = window.confirm(
              `A learning map with the storage ID "${storageId}" already exists. Would you like to replace it with this map? Your progress will not be removed.`
            );
            if (shouldReplace) {
              // Keep the existing state but update the roadmap data
              const existingState = mapWithStorageId.state;
              await db.addLearningMap(storageId, existingMap.roadmapData, existingState);
              // Remove the old jsonId entry to avoid duplicates
              if (jsonId !== storageId) {
                await db.removeLearningMap(jsonId);
              }
            }
          } else {
            // No conflict, just update
            await db.addLearningMap(storageId, existingMap.roadmapData);
            // Remove the old jsonId entry if different
            if (jsonId !== storageId) {
              await db.removeLearningMap(jsonId);
            }
          }
        } else {
          // No custom storage ID, just use jsonId
          await db.addLearningMap(jsonId, existingMap.roadmapData);
        }
        setCurrentMap(existingMap);
        return;
      }
      
      // Check if jsonId looks like a storage ID (contains . or /) - these can't be fetched
      if (jsonId.includes('.') || jsonId.includes('/')) {
        setError('Learning map not found. It may not have been loaded yet. Please make sure you have accessed the original map first.');
        return;
      }
      
      // Need to fetch from jsonStore
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`https://json.openpatch.org/api/v2/${jsonId}`, {
          method: 'GET',
          mode: 'cors',
        });
        const text = await response.text();
        const json = JSON.parse(text);
        const storageId = json.settings?.id;
        
        if (storageId && storageId !== jsonId) {
          // Check if a map with this storage ID already exists
          const existingMapWithStorageId = await db.getLearningMap(storageId);
          if (existingMapWithStorageId) {
            // Ask user if they want to replace
            const shouldReplace = window.confirm(
              `A learning map with the storage ID "${storageId}" already exists. Would you like to replace it with this map? Your progress will not be removed.`
            );
            if (shouldReplace) {
              // Keep the existing state but update the roadmap data
              const existingState = existingMapWithStorageId.state;
              await db.addLearningMap(storageId, json, existingState);
            } else {
              // User chose not to replace, just use jsonId as key
              await db.addLearningMap(jsonId, json);
            }
          } else {
            // No conflict, use storage ID
            await db.addLearningMap(storageId, json);
          }
        } else {
          // No custom storage ID, use jsonId
          await db.addLearningMap(jsonId, json);
        }
        
        // Reload the map
        const loadedMap = await db.getLearningMap(storageId || jsonId);
        setCurrentMap(loadedMap);
        setLoading(false);
      } catch (err) {
        setError('Failed to load learning map. Please check the URL and try again.');
        setLoading(false);
      }
    };
    
    loadMap();
  }, [jsonId]);
  
  const handleStateChange = useCallback((state: RoadmapState, key: string) => {
    if (key) {
      // Debounce state updates to prevent infinite loops
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
      updateTimeoutRef.current = setTimeout(() => {
        db.updateState(key, state);
      }, 500);
    }
  }, []);
  
  // Load all maps for the list view
  useEffect(() => {
    if (!jsonId) {
      db.getAllLearningMaps().then(setAllMaps);
    }
  }, [jsonId]);
  
  const handleAddMap = () => {
    // Parse URL to extract json ID
    const urlMatch = newMapUrl.match(/#json=([^&]+)/);
    if (urlMatch) {
      const id = urlMatch[1];
      navigate(`/learn#json=${id}`);
      setNewMapUrl('');
    } else {
      setError('Invalid learning map URL. Please paste a valid URL with #json=...');
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        const json = JSON.parse(content);
        
        // Generate a unique ID for this uploaded map
        const uploadId = `upload-${Date.now()}`;
        const storageId = json.settings?.id || uploadId;
        
        // Check if a map with this storage ID already exists
        const existingMap = await db.getLearningMap(storageId);
        if (existingMap) {
          const shouldReplace = window.confirm(
            `A learning map with this ID already exists. Would you like to replace it? Your progress will not be removed.`
          );
          if (shouldReplace) {
            const existingState = existingMap.state;
            await db.addLearningMap(storageId, json, existingState);
            navigate(`/learn#json=${storageId}`);
          }
        } else {
          await db.addLearningMap(storageId, json);
          navigate(`/learn#json=${storageId}`);
        }
      } catch (err) {
        setError('Invalid file format. Please upload a valid LearningMap JSON file.');
      }
    };
    
    reader.onerror = () => {
      setError('Failed to read the file. Please try again.');
    };
    
    reader.readAsText(file);
    
    // Reset the input so the same file can be uploaded again if needed
    event.target.value = '';
  };
  
  const handleRemoveMap = async (id: string) => {
    if (window.confirm('Are you sure you want to remove this learning map?')) {
      await db.removeLearningMap(id);
      // Refresh the list
      const maps = await db.getAllLearningMaps();
      setAllMaps(maps);
    }
  };
  
  // If there's a json ID, show the learning map
  if (jsonId) {
    // First try to get by storage ID if present, otherwise use jsonId
    let learningMap = currentMap;
    
    // Try to determine the storage key (either custom id or jsonId)
    const storageKey = learningMap?.roadmapData?.settings?.id || jsonId;
    
    if (loading) {
      return (
        <div className="learn-loading">
          <div className="learn-spinner"></div>
          <p>Loading learning map...</p>
        </div>
      );
    }
    
    if (error) {
      return (
        <div className="learn-error">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/learn')}>Back to Learning Maps</button>
        </div>
      );
    }
    
    if (!learningMap) {
      return (
        <div className="learn-loading">
          <div className="learn-spinner"></div>
          <p>Loading learning map...</p>
        </div>
      );
    }
    
    
    return (
      <div className="learn-container">
        <div className="learn-toolbar">
          <div className="toolbar-inner">
            <div className="toolbar-left">
              <img 
                src={logo} 
                alt="Logo" 
                className="toolbar-logo" 
                onClick={() => navigate('/')}
                style={{ cursor: 'pointer' }}
              />
              <h1 className="toolbar-title" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>Learningmap</h1>
            </div>
            <div className="toolbar-right">
              <button onClick={() => navigate('/learn')} className="toolbar-button">
                My Learningmaps
              </button>
            </div>
          </div>
        </div>
        <LearningMap
          key={storageKey}
          roadmapData={learningMap.roadmapData}
          initialState={learningMap.state}
          onChange={(state) => handleStateChange(state, storageKey)}
        />
      </div>
    );
  }
  
  return (
    <div className="learn-list-container">
      <div className="learn-toolbar">
        <div className="toolbar-inner">
          <div className="toolbar-left">
            <img 
              src={logo} 
              alt="Logo" 
              className="toolbar-logo" 
              onClick={() => navigate('/')}
              style={{ cursor: 'pointer' }}
            />
            <h1 className="toolbar-title" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>Learningmap</h1>
          </div>
        </div>
      </div>
      
      <div className="learn-list-content">
        <div className="add-map-section">
          <h2>Add a New Learning Map</h2>
          <div className="add-map-form">
            <input
              type="text"
              placeholder="Paste learning map URL (e.g., https://learningmap.app/learn/#json=...)"
              value={newMapUrl}
              onChange={(e) => setNewMapUrl(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleAddMap();
                }
              }}
            />
            <button onClick={handleAddMap}>Add Map</button>
          </div>
          <div className="add-map-divider">
            <span>or</span>
          </div>
          <div className="add-map-upload">
            <label htmlFor="file-upload" className="upload-button">
              Upload Map File
            </label>
            <input
              id="file-upload"
              type="file"
              accept=".json,application/json"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
          </div>
          {error && <p className="error-message">{error}</p>}
        </div>
        
        {allMaps.length === 0 ? (
          <div className="empty-state">
            <p>You haven't added any learning maps yet.</p>
            <p>Paste a learning map URL above to get started!</p>
          </div>
        ) : (
          <div className="maps-grid">
            {allMaps.map((map) => {
            const completed = Object.values(map.state?.nodes || {}).filter(
              (node: any) => node.state === 'completed' || node.state === 'mastered'
            ).length;
            const total = map.roadmapData.nodes.filter(
              (node: any) => node.type === 'task' || node.type === 'topic'
            ).length;
            const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
            
            return (
              <div key={map.id} className="map-card">
                <div className="map-card-header">
                  <h3>{map.roadmapData.settings?.title || 'Untitled Map'}</h3>
                  <button
                    onClick={() => handleRemoveMap(map.id)}
                    className="remove-button"
                    title="Remove this map"
                  >
                    ×
                  </button>
                </div>
                <div className="map-card-body">
                  <div className="progress-section">
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    <span className="progress-text">
                      {completed} / {total} completed ({progress}%)
                    </span>
                  </div>
                  <div className="map-meta">
                    <span>
                      Last accessed:{' '}
                      {new Date(map.lastAccessed).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="map-card-footer">
                  <button
                    onClick={() => navigate(`/learn#json=${map.id}`)}
                    className="continue-button"
                  >
                    Continue Learning
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
      </div>
    </div>
  );
}

export default Learn;
