import React, { useEffect, useState, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { LearningMapEditor, useEditorStore, RoadmapData, KeyBindings } from '@learningmap/learningmap';
import '@learningmap/learningmap/index.css';

// VS Code API type
interface VSCodeApi {
  postMessage(message: any): void;
  setState(state: any): void;
  getState(): any;
}

// VS Code API - this is provided by VS Code in webview context
declare function acquireVsCodeApi(): VSCodeApi;
const vscode = acquireVsCodeApi();

interface VSCodeMessage {
  type: string;
  content?: string;
  command?: string;
}

/**
 * Main webview component that wraps the LearningMapEditor.
 * Handles communication with the VS Code extension.
 */
function WebviewEditor() {
  const [isReady, setIsReady] = useState(false);
  const isLoadingFromFile = useRef(false);
  
  // Get store methods
  const getRoadmapData = useEditorStore(state => state.getRoadmapData);
  const loadRoadmapData = useEditorStore(state => state.loadRoadmapData);

  // Handle commands from VS Code extension
  const handleVSCodeCommand = (command: string) => {
    // Simulate keyboard event to trigger the corresponding action
    const event = new KeyboardEvent('keydown', {
      key: getKeyForCommand(command),
      ctrlKey: needsCtrl(command),
      shiftKey: needsShift(command),
      metaKey: needsCtrl(command),
      bubbles: true,
      cancelable: true,
    });
    window.dispatchEvent(event);
  };

  const getKeyForCommand = (command: string): string => {
    const keyMap: Record<string, string> = {
      addTaskNode: '1',
      addTopicNode: '2',
      addImageNode: '3',
      addTextNode: '4',
      undo: 'z',
      redo: 'y',
      togglePreview: 'p',
      toggleDebug: 'd',
      zoomIn: '+',
      zoomOut: '-',
      resetZoom: '0',
      toggleGrid: "'",
      resetMap: 'Delete',
      cut: 'x',
      copy: 'c',
      paste: 'v',
      selectAll: 'a',
      fitView: '!',
      zoomToSelection: '@',
      deleteSelected: 'Delete',
      help: '?',
    };
    return keyMap[command] || '';
  };

  const needsCtrl = (command: string): boolean => {
    const ctrlCommands = [
      'addTaskNode', 'addTopicNode', 'addImageNode', 'addTextNode',
      'undo', 'redo', 'togglePreview', 'toggleDebug',
      'zoomIn', 'zoomOut', 'resetZoom', 'toggleGrid', 'resetMap',
      'cut', 'copy', 'paste', 'selectAll', 'help',
    ];
    return ctrlCommands.includes(command);
  };

  const needsShift = (command: string): boolean => {
    const shiftCommands = ['fitView', 'zoomToSelection'];
    return shiftCommands.includes(command);
  };

  // Handle explicit save command
  const handleSave = () => {
    if (!isLoadingFromFile.current) {
      const data = getRoadmapData();
      vscode.postMessage({
        type: 'save',
        content: data,
      });
    }
  };

  // Handle messages from extension
  useEffect(() => {
    const messageHandler = (event: MessageEvent<VSCodeMessage>) => {
      const message = event.data;
      switch (message.type) {
        case 'command':
          // Handle command from VS Code
          if (message.command) {
            if (message.command === 'save') {
              handleSave();
            } else {
              handleVSCodeCommand(message.command);
            }
          }
          break;
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
    };
  }, [loadRoadmapData, getRoadmapData]);

  if (!isReady) {
    return <div style={{ padding: '20px' }}>Loading editor...</div>;
  }

  // Custom keybindings for VS Code - only disable save since VS Code handles it
  const vscodeKeyBindings: Partial<KeyBindings> = {
    save: undefined, // Disable save shortcut - VS Code handles this
  };

  return <LearningMapEditor 
    disableSharing={true} 
    disableFileOperations={true} 
    keyBindings={vscodeKeyBindings}
  />;
}

// Mount the React component
const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<WebviewEditor />);
}
