import React, { useEffect, useState, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { LearningMapEditor, useEditorStore, RoadmapData } from '@learningmap/learningmap';
import '@learningmap/learningmap/index.css';

// VS Code API
declare const acquireVsCodeApi: any;
const vscode = acquireVsCodeApi();

interface VSCodeMessage {
  type: string;
  content?: string;
}

/**
 * Main webview component that wraps the LearningMapEditor.
 * Handles communication with the VS Code extension.
 */
function WebviewEditor() {
  const [isReady, setIsReady] = useState(false);
  const isLoadingFromFile = useRef(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Get store methods
  const getRoadmapData = useEditorStore(state => state.getRoadmapData);
  const loadRoadmapData = useEditorStore(state => state.loadRoadmapData);

  // Handle messages from extension
  useEffect(() => {
    const messageHandler = (event: MessageEvent<VSCodeMessage>) => {
      const message = event.data;
      switch (message.type) {
        case 'update':
          // Set flag to prevent saving during load
          isLoadingFromFile.current = true;
          
          // Load the content from the file
          try {
            if (message.content) {
              const data = JSON.parse(message.content);
              loadRoadmapData(data);
            } else {
              // Empty file - load empty structure
              loadRoadmapData({
                nodes: [],
                edges: [],
                settings: { background: { color: '#ffffff' } },
                version: 1,
                type: 'learningmap',
              } as RoadmapData);
            }
          } catch (e) {
            console.error('Failed to parse learningmap content', e);
            // If parsing fails, initialize with empty structure
            loadRoadmapData({
              nodes: [],
              edges: [],
              settings: { background: { color: '#ffffff' } },
              version: 1,
              type: 'learningmap',
            } as RoadmapData);
          }
          
          // Clear the flag after a short delay to allow store to settle
          setTimeout(() => {
            isLoadingFromFile.current = false;
          }, 100);
          break;
      }
    };

    window.addEventListener('message', messageHandler);
    
    // Signal that webview is ready
    vscode.postMessage({ type: 'ready' });
    setIsReady(true);

    return () => {
      window.removeEventListener('message', messageHandler);
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [loadRoadmapData]);

  // Auto-save changes to the document (debounced)
  useEffect(() => {
    if (!isReady) return;

    // Subscribe to store changes
    const unsubscribe = useEditorStore.subscribe(() => {
      // Don't save if we're loading from file
      if (isLoadingFromFile.current) {
        return;
      }

      // Debounce saves to avoid too many updates
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(() => {
        const data = getRoadmapData();
        vscode.postMessage({
          type: 'save',
          content: data,
        });
      }, 500); // Wait 500ms after last change before saving
    });

    return () => {
      unsubscribe();
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [isReady, getRoadmapData]);

  if (!isReady) {
    return <div style={{ padding: '20px' }}>Loading editor...</div>;
  }

  return <LearningMapEditor />;
}

// Mount the React component
const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<WebviewEditor />);
}
