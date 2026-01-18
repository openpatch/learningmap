import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as db from './db';
import type { TeacherMapEntry } from './db';
import './Teach.css';
import { Header } from './Header';
import { Footer } from './Footer';

function Teach() {
  const navigate = useNavigate();
  const [allMaps, setAllMaps] = useState<TeacherMapEntry[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [newMapUrl, setNewMapUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showConflictDialog, setShowConflictDialog] = useState(false);
  const [conflictData, setConflictData] = useState<{
    storageId: string;
    roadmapData: any;
    jsonId?: string;
    existingMap: TeacherMapEntry;
  } | null>(null);

  useEffect(() => {
    db.getAllTeacherMaps().then(setAllMaps);
  }, []);

  const handleRemoveMap = async (id: string) => {
    if (window.confirm('Are you sure you want to remove this learning map from your collection?')) {
      await db.removeTeacherMap(id);
      const maps = await db.getAllTeacherMaps();
      setAllMaps(maps);
    }
  };

  const handleCopyShareLink = async (map: TeacherMapEntry) => {
    const shareUrl = map.jsonId 
      ? `${window.location.origin}/learn#json=${map.jsonId}`
      : null;
    
    if (shareUrl) {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedId(map.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleEditMap = (map: TeacherMapEntry) => {
    if (map.jsonId) {
      navigate(`/create#json=${map.jsonId}`);
    } else {
      // For maps without jsonId, we'd need to pass data differently
      // For now, prompt to publish first
      alert('Please publish this map first to get a shareable link, then you can edit it.');
    }
  };

  const handleAddMapFromUrl = async () => {
    setError(null);
    const trimmedUrl = newMapUrl.trim();
    
    if (!trimmedUrl) {
      setError('Please enter a URL');
      return;
    }

    // Extract jsonId from URL
    const match = trimmedUrl.match(/#json=([^&]+)/);
    if (match) {
      const jsonId = match[1];
      
      // Check if it looks like a storage ID (contains . or /)
      if (jsonId.includes('.') || jsonId.includes('/')) {
        setError('Cannot import maps with custom storage IDs. Please use a published map URL.');
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(`https://json.openpatch.org/api/v2/${jsonId}`, {
          method: 'GET',
          mode: 'cors',
        });

        if (!response.ok) {
          throw new Error('Failed to fetch learning map');
        }

        const roadmapData = await response.json();
        const storageId = roadmapData.settings?.id || jsonId;
        
        // Check if map already exists
        const existingMap = await db.getTeacherMap(storageId);
        if (existingMap) {
          // Show conflict dialog
          setConflictData({ storageId, roadmapData, jsonId, existingMap });
          setShowConflictDialog(true);
          setLoading(false);
          return;
        }
        
        await db.addTeacherMap(storageId, roadmapData, jsonId);
        const maps = await db.getAllTeacherMaps();
        setAllMaps(maps);
        setNewMapUrl('');
        setShowAddDialog(false);
      } catch (err) {
        setError('Failed to load learning map. Please check the URL and try again.');
      } finally {
        setLoading(false);
      }
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
        
        // Check if map already exists
        const existingMap = await db.getTeacherMap(storageId);
        if (existingMap) {
          // Show conflict dialog
          setConflictData({ storageId, roadmapData: json, existingMap });
          setShowConflictDialog(true);
          return;
        }
        
        await db.addTeacherMap(storageId, json, undefined);
        const maps = await db.getAllTeacherMaps();
        setAllMaps(maps);
        setShowAddDialog(false);
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

  const handleConflictOverwrite = async () => {
    if (!conflictData) return;
    
    await db.addTeacherMap(conflictData.storageId, conflictData.roadmapData, conflictData.jsonId);
    const maps = await db.getAllTeacherMaps();
    setAllMaps(maps);
    setNewMapUrl('');
    setShowAddDialog(false);
    setShowConflictDialog(false);
    setConflictData(null);
  };

  const handleConflictNewId = async () => {
    if (!conflictData) return;
    
    // Generate a new unique ID
    const newId = `${conflictData.storageId}-${Date.now()}`;
    await db.addTeacherMap(newId, conflictData.roadmapData, conflictData.jsonId);
    const maps = await db.getAllTeacherMaps();
    setAllMaps(maps);
    setNewMapUrl('');
    setShowAddDialog(false);
    setShowConflictDialog(false);
    setConflictData(null);
  };

  const handleConflictCancel = () => {
    setShowConflictDialog(false);
    setConflictData(null);
  };

  return (
    <div className="teach-container">
      <Header>
        <button onClick={() => setShowAddDialog(true)} className="toolbar-button">
          Add Map
        </button>
        <button onClick={() => navigate('/create')} className="toolbar-button toolbar-button-primary">
          + Create New Map
        </button>
      </Header>
      
      {showAddDialog && (
        <div className="dialog-overlay" onClick={() => setShowAddDialog(false)}>
          <div className="dialog-content" onClick={(e) => e.stopPropagation()}>
            <div className="dialog-header">
              <h2>Add an Existing Learning Map</h2>
              <button 
                className="dialog-close" 
                onClick={() => setShowAddDialog(false)}
                aria-label="Close dialog"
              >
                ×
              </button>
            </div>
            <div className="dialog-body">
              <div className="add-map-form">
                <input
                  type="text"
                  placeholder="Paste learning map URL (e.g., https://learningmap.app/learn#json=...)"
                  value={newMapUrl}
                  onChange={(e) => setNewMapUrl(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleAddMapFromUrl();
                    }
                  }}
                />
                <button onClick={handleAddMapFromUrl} disabled={loading}>
                  {loading ? 'Adding...' : 'Add Map'}
                </button>
              </div>
              {error && <p className="error-message">{error}</p>}
              <div className="add-map-divider">
                <span>or</span>
              </div>
              <div className="add-map-upload">
                <label htmlFor="file-upload" className="upload-button">
                  📁 Upload JSON File
                </label>
                <input
                  id="file-upload"
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
      
      {showConflictDialog && conflictData && (
        <div className="dialog-overlay" onClick={handleConflictCancel}>
          <div className="dialog-content conflict-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="dialog-header">
              <h2>⚠️ Map Already Exists</h2>
              <button 
                className="dialog-close" 
                onClick={handleConflictCancel}
                aria-label="Close dialog"
              >
                ×
              </button>
            </div>
            <div className="dialog-body">
              <p>
                A learning map with ID <strong>{conflictData.storageId}</strong> already exists in your collection.
              </p>
              <div className="conflict-info">
                <div className="conflict-map-info">
                  <h4>Existing Map:</h4>
                  <p><strong>{conflictData.existingMap.roadmapData.settings?.title || 'Untitled'}</strong></p>
                  <p className="text-small">Last modified: {new Date(conflictData.existingMap.lastModified).toLocaleString()}</p>
                </div>
                <div className="conflict-map-info">
                  <h4>New Map:</h4>
                  <p><strong>{conflictData.roadmapData.settings?.title || 'Untitled'}</strong></p>
                </div>
              </div>
              <p>What would you like to do?</p>
              <div className="conflict-actions">
                <button 
                  onClick={handleConflictOverwrite} 
                  className="conflict-button conflict-button-danger"
                >
                  Overwrite Existing
                </button>
                <button 
                  onClick={handleConflictNewId} 
                  className="conflict-button conflict-button-primary"
                >
                  Keep Both (New ID)
                </button>
                <button 
                  onClick={handleConflictCancel} 
                  className="conflict-button conflict-button-secondary"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="teach-content">
        <div className="teach-header">
          <h2>My Created Maps</h2>
          <p className="teach-description">
            Manage your learning maps. Edit, share with students, or create new ones.
          </p>
        </div>

        {allMaps.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📚</div>
            <h3>No learning maps yet</h3>
            <p>Create your first learning map and share it with your students.</p>
            <button onClick={() => navigate('/create')} className="create-first-button">
              Create Your First Map
            </button>
          </div>
        ) : (
          <div className="maps-grid">
            {allMaps.map((map) => (
              <div key={map.id} className="map-card">
                <div className="map-card-header">
                  <h3>{map.roadmapData.settings?.title || 'Untitled Map'}</h3>
                  <button
                    onClick={() => handleRemoveMap(map.id)}
                    className="remove-button"
                    title="Remove from collection"
                  >
                    ×
                  </button>
                </div>
                <div className="map-card-body">
                  <div className="map-stats">
                    <span className="stat">
                      📍 {map.roadmapData.nodes?.filter(n => n.type === 'task' || n.type === 'topic').length || 0} tasks
                    </span>
                  </div>
                  <div className="map-meta">
                    <span>Created: {new Date(map.createdAt).toLocaleDateString()}</span>
                    <span>Modified: {new Date(map.lastModified).toLocaleDateString()}</span>
                  </div>
                  {map.jsonId && (
                    <div className="share-section">
                      <span className="published-badge">✓ Published</span>
                    </div>
                  )}
                </div>
                <div className="map-card-footer">
                  <button
                    onClick={() => handleEditMap(map)}
                    className="action-button edit-button"
                  >
                    Edit
                  </button>
                  {map.jsonId ? (
                    <button
                      onClick={() => handleCopyShareLink(map)}
                      className="action-button share-button"
                    >
                      {copiedId === map.id ? '✓ Copied!' : 'Copy Share Link'}
                    </button>
                  ) : (
                    <span className="unpublished-hint">Publish to share</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

export default Teach;
