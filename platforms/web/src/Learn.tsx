import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LearningMap } from '@learningmap/learningmap';
import type { RoadmapState } from '@learningmap/learningmap';
import '@learningmap/learningmap/index.css';
import { useLearnerStore } from './learnerStore';
import './Learn.css';

function Learn() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newMapUrl, setNewMapUrl] = useState('');
  
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
    
    const existingMap = getLearningMap(jsonId);
    
    if (existingMap) {
      // Already have the data, just update last accessed
      addLearningMap(jsonId, existingMap.roadmapData);
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
        addLearningMap(jsonId, json);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load learning map. Please check the URL and try again.');
        setLoading(false);
      });
  }, [jsonId, getLearningMap, addLearningMap]);
  
  const handleStateChange = (state: RoadmapState) => {
    if (jsonId) {
      updateState(jsonId, state);
    }
  };
  
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
  
  const handleRemoveMap = (id: string) => {
    if (window.confirm('Are you sure you want to remove this learning map?')) {
      removeLearningMap(id);
    }
  };
  
  // If there's a json ID, show the learning map
  if (jsonId) {
    const learningMap = getLearningMap(jsonId);
    
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
        <div className="learn-header">
          <button onClick={() => navigate('/learn')} className="back-button">
            ← Back to Learning Maps
          </button>
          <h1>{learningMap.roadmapData.settings?.title || 'Learning Map'}</h1>
        </div>
        <LearningMap
          roadmapData={learningMap.roadmapData}
          initialState={learningMap.state}
          onChange={handleStateChange}
        />
      </div>
    );
  }
  
  // Show list of all learning maps
  const allMaps = getAllLearningMaps();
  
  return (
    <div className="learn-list-container">
      <div className="learn-list-header">
        <h1>My Learning Maps</h1>
        <button onClick={() => navigate('/')} className="editor-link">
          Go to Editor
        </button>
      </div>
      
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
  );
}

export default Learn;
