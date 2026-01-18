import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LearningMapEditor, useEditorStore } from '@learningmap/learningmap';
import "@learningmap/learningmap/index.css";
import * as db from './db';
import './TeacherEditor.css';
import { Header } from './Header';

// This component wraps the LearningMapEditor and saves maps to the teacher's collection
// when they are shared or modified
function TeacherEditorInner() {
  const location = useLocation();
  const shareLink = useEditorStore(state => state.shareLink);
  const shareDialogOpen = useEditorStore(state => state.shareDialogOpen);
  const getRoadmapData = useEditorStore(state => state.getRoadmapData);
  const loadRoadmapData = useEditorStore(state => state.loadRoadmapData);
  const reset = useEditorStore(state => state.reset);
  const nodes = useEditorStore(state => state.nodes);
  const edges = useEditorStore(state => state.edges);
  const settings = useEditorStore(state => state.settings);
  const lastSavedRef = useRef<string | null>(null);
  const saveTimeoutRef = useRef<number | null>(null);
  const initializedRef = useRef(false);
  const currentDbIdRef = useRef<string | null>(null); // Track the current database ID

  // Extract id from URL - supports both #id= and #json= for backwards compatibility
  const urlHash = location.hash.slice(1); // Remove the #
  const idMatch = urlHash.match(/id=([^&]+)/);
  const jsonMatch = urlHash.match(/json=([^&]+)/);
  const mapId = idMatch ? idMatch[1] : jsonMatch ? jsonMatch[1] : null;

  // Load map from database when editing an existing map
  useEffect(() => {
    if (!mapId) {
      // No ID in URL - reset for new map creation
      if (!initializedRef.current) {
        reset();
        currentDbIdRef.current = null; // Reset database ID for new map
        initializedRef.current = true;
      }
      return;
    }

    // Load map from database
    const loadMap = async () => {
      try {
        const teacherMap = await db.getTeacherMap(mapId);
        if (teacherMap) {
          loadRoadmapData(teacherMap.roadmapData);
          currentDbIdRef.current = mapId; // Set the database ID
          initializedRef.current = true;
        }
      } catch (err) {
        console.error('Failed to load map:', err);
      }
    };

    if (!initializedRef.current) {
      loadMap();
      initializedRef.current = true;
    }

    // Reset the flag when mapId changes (navigating to a different map)
    return () => {
      initializedRef.current = false;
      currentDbIdRef.current = null;
    };
  }, [mapId, reset, loadRoadmapData]);

  // Auto-save changes with debouncing
  useEffect(() => {
    // Skip auto-save if the map is empty (no nodes)
    if (nodes.length === 0) return;

    // Clear any pending save
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Debounce saves to avoid too many writes
    saveTimeoutRef.current = window.setTimeout(async () => {
      const roadmapData = getRoadmapData();
      
      // Determine the database ID for this map
      let dbId: string;
      
      if (currentDbIdRef.current) {
        // We already have a database ID for this editing session - use it
        dbId = currentDbIdRef.current;
      } else {
        // New map - generate a new database ID and remember it
        dbId = `map-${Date.now()}`;
        currentDbIdRef.current = dbId;
        
        // Ensure settings.id is set
        if (!roadmapData.settings?.id) {
          roadmapData.settings = { ...roadmapData.settings, id: dbId };
        }
      }
      
      try {
        // Get existing map to preserve jsonId
        const existingMap = await db.getTeacherMap(dbId);
        // Save or update the map
        await db.addTeacherMap(dbId, roadmapData, existingMap?.jsonId || undefined);
      } catch (err) {
        console.error('Failed to auto-save map:', err);
      }
    }, 1000); // Save after 1 second of inactivity

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [nodes, edges, settings, getRoadmapData]);

  // When a map is shared, save it to the teacher's collection
  useEffect(() => {
    if (shareLink && shareDialogOpen) {
      // Extract jsonId from shareLink
      const match = shareLink.match(/#json=([^&]+)/);
      if (match) {
        const jsonId = match[1];
        
        // Avoid duplicate saves for the same share
        if (lastSavedRef.current === jsonId) return;
        lastSavedRef.current = jsonId;

        // Get current roadmap data and save to teacher collection
        const saveSharedMap = async () => {
          const roadmapData = getRoadmapData();
          
          // Use the current database ID from this editing session
          let dbId: string;
          if (currentDbIdRef.current) {
            dbId = currentDbIdRef.current;
          } else {
            // New map that hasn't been saved yet - create database ID
            dbId = `map-${Date.now()}`;
            currentDbIdRef.current = dbId;
          }
          
          await db.addTeacherMap(dbId, roadmapData, jsonId);
        };
        
        saveSharedMap();
      }
    }
  }, [shareLink, shareDialogOpen, getRoadmapData]);

  return null;
}

export function TeacherEditor() {
  const navigate = useNavigate();

  return (
    <div className="teacher-editor-container">
      <Header>
        <button onClick={() => navigate('/teach')} className="toolbar-button">
          My Maps
        </button>
      </Header>
      <div className="teacher-editor-content">
        <LearningMapEditor jsonStore="https://json.openpatch.org" />
        <TeacherEditorInner />
      </div>
    </div>
  );
}
