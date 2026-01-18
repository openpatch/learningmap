import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as db from './db';
import type { TeacherMapEntry } from './db';
import './Teach.css';
import logo from './logo.svg';

function Teach() {
  const navigate = useNavigate();
  const [allMaps, setAllMaps] = useState<TeacherMapEntry[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

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

  return (
    <div className="teach-container">
      <div className="teach-toolbar">
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
            <button onClick={() => navigate('/create')} className="toolbar-button toolbar-button-primary">
              + Create New Map
            </button>
          </div>
        </div>
      </div>
      
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
    </div>
  );
}

export default Teach;
