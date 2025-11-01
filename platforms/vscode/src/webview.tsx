import React, { useEffect, useState, useCallback } from 'react';
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
  const [initialData, setInitialData] = useState<string | null>(null);
  
  // Get store methods
  const getRoadmapData = useEditorStore(state => state.getRoadmapData);
  const loadRoadmapData = useEditorStore(state => state.loadRoadmapData);

  // Handle messages from extension
  useEffect(() => {
    const messageHandler = (event: MessageEvent<VSCodeMessage>) => {
      const message = event.data;
      switch (message.type) {
        case 'update':
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
          break;
      }
    };

    window.addEventListener('message', messageHandler);
    
    // Signal that webview is ready
    vscode.postMessage({ type: 'ready' });
    setIsReady(true);

    return () => {
      window.removeEventListener('message', messageHandler);
    };
  }, [loadRoadmapData]);

  // Auto-save changes to the document
  useEffect(() => {
    if (!isReady) return;

    // Subscribe to store changes
    const unsubscribe = useEditorStore.subscribe((state) => {
      // Save the current roadmap data back to VS Code
      const data = getRoadmapData();
      vscode.postMessage({
        type: 'save',
        content: data,
      });
    });

    return () => {
      unsubscribe();
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
