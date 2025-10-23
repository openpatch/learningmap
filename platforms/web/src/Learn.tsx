import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LearningMap } from '@learningmap/learningmap';
import type { RoadmapState } from '@learningmap/learningmap';
import '@learningmap/learningmap/index.css';
import { useLearnerStore } from './learnerStore';
import './Learn.css';
import logo from './logo.svg';

function Learn() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newMapUrl, setNewMapUrl] = useState('');
  const updateTimeoutRef = useRef<number | null>(null);
  
  const {
    addLearningMap,
    updateState,
    getLearningMap,
    getAllLearningMaps,
    removeLearningMap,
  } = useLearnerStore();
  
  // Extract json ID from hash
  const getJsonIdFromHash = () => {
    const hash = location.hash;
    if (hash.startsWith('#json=')) {
      return hash.replace('#json=', '');
    }
    return null;
  };
  
  const jsonId = getJsonIdFromHash();
  
  // Load roadmap data from jsonStore if needed
  useEffect(() => {
    if (!jsonId) return;
    
    // First, fetch the roadmap data to check if it has an id
    const existingMap = getLearningMap(jsonId);
    
    if (existingMap) {
      // Check if the roadmap has a storage ID and handle potential conflicts
      const storageId = existingMap.roadmapData.settings?.id;
      if (storageId && storageId !== jsonId) {
        // There's a custom storage ID - check if a different map exists with that ID
        const mapWithStorageId = getLearningMap(storageId);
        if (mapWithStorageId && mapWithStorageId.roadmapData !== existingMap.roadmapData) {
          // Ask user if they want to replace
          const shouldReplace = window.confirm(
            `A learning map with the storage ID "${storageId}" already exists. Would you like to replace it with this map? Your progress will not be removed.`
          );
          if (shouldReplace) {
            // Keep the existing state but update the roadmap data
            const existingState = mapWithStorageId.state;
            addLearningMap(storageId, existingMap.roadmapData);
            if (existingState) {
              updateState(storageId, existingState);
            }
            // Remove the old jsonId entry to avoid duplicates
            if (jsonId !== storageId) {
              removeLearningMap(jsonId);
            }
          }
        } else {
          // No conflict, just update
          addLearningMap(storageId, existingMap.roadmapData);
          // Remove the old jsonId entry if different
          if (jsonId !== storageId) {
            removeLearningMap(jsonId);
          }
        }
      } else {
        // No custom storage ID, just use jsonId
        addLearningMap(jsonId, existingMap.roadmapData);
      }
      return;
    }
    
    // Need to fetch from jsonStore
    setLoading(true);
    setError(null);
    
    fetch(`https://json.openpatch.org/api/v2/${jsonId}`, {
      method: 'GET',
      mode: 'cors',
    })
      .then((r) => r.text())
      .then((text) => {
        const json = JSON.parse(text);
        const storageId = json.settings?.id;
        
        if (storageId && storageId !== jsonId) {
          // Check if a map with this storage ID already exists
          const existingMapWithStorageId = getLearningMap(storageId);
          if (existingMapWithStorageId) {
            // Ask user if they want to replace
            const shouldReplace = window.confirm(
              `A learning map with the storage ID "${storageId}" already exists. Would you like to replace it with this map? Your progress will not be removed.`
            );
            if (shouldReplace) {
              // Keep the existing state but update the roadmap data
              const existingState = existingMapWithStorageId.state;
              addLearningMap(storageId, json);
              if (existingState) {
                updateState(storageId, existingState);
              }
            } else {
              // User chose not to replace, just use jsonId as key
              addLearningMap(jsonId, json);
            }
          } else {
            // No conflict, use storage ID
            addLearningMap(storageId, json);
          }
        } else {
          // No custom storage ID, use jsonId
          addLearningMap(jsonId, json);
        }
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load learning map. Please check the URL and try again.');
        setLoading(false);
      });
  }, [jsonId, getLearningMap, addLearningMap, updateState, removeLearningMap]);
  
  const handleStateChange = useCallback((state: RoadmapState, key: string) => {
    if (key) {
      // Debounce state updates to prevent infinite loops
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
      updateTimeoutRef.current = setTimeout(() => {
        updateState(key, state);
      }, 500);
    }
  }, [updateState]);
  
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
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const json = JSON.parse(content);
        
        // Generate a unique ID for this uploaded map
        const uploadId = `upload-${Date.now()}`;
        const storageId = json.settings?.id || uploadId;
        
        // Check if a map with this storage ID already exists
        const existingMap = getLearningMap(storageId);
        if (existingMap) {
          const shouldReplace = window.confirm(
            `A learning map with this ID already exists. Would you like to replace it? Your progress will not be removed.`
          );
          if (shouldReplace) {
            const existingState = existingMap.state;
            addLearningMap(storageId, json);
            if (existingState) {
              updateState(storageId, existingState);
            }
            navigate(`/learn#json=${storageId}`);
          }
        } else {
          addLearningMap(storageId, json);
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
  
  const handleRemoveMap = (id: string) => {
    if (window.confirm('Are you sure you want to remove this learning map?')) {
      removeLearningMap(id);
    }
  };
  
  // If there's a json ID, show the learning map
  if (jsonId) {
    // First try to get by storage ID if present, otherwise use jsonId
    let learningMap = getLearningMap(jsonId);
    
    // If not found by jsonId, check if there's a storage ID in any map
    if (!learningMap) {
      const allMaps = getAllLearningMaps();
      const mapWithJsonId = allMaps.find(m => m.id === jsonId);
      if (mapWithJsonId) {
        learningMap = mapWithJsonId;
      }
    }
    
    // Try to determine the storage key (either custom id or jsonId)
    const storageKey = learningMap?.roadmapData?.settings?.id || jsonId;
    if (storageKey !== jsonId) {
      learningMap = getLearningMap(storageKey);
    }
    
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
          <div className="toolbar-left">
            <img src={logo} alt="Logo" className="toolbar-logo" />
            <h1 className="toolbar-title">Learningmap</h1>
          </div>
          <div className="toolbar-right">
            <button onClick={() => navigate('/learn')} className="toolbar-button">
              My Learningmaps
            </button>
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
  
  // Show list of all learning maps
  const allMaps = getAllLearningMaps();
  
  return (
    <div className="learn-list-container">
      <div className="learn-toolbar">
        <div className="toolbar-left">
          <img src={logo} alt="Logo" className="toolbar-logo" />
          <h1 className="toolbar-title">Learningmap</h1>
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
              (node) => node.state === 'completed' || node.state === 'mastered'
            ).length;
            const total = map.roadmapData.nodes.filter(
              (node) => node.type === 'task' || node.type === 'topic'
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
