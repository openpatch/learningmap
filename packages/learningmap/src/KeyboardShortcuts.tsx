import { useEffect } from "react";
import { useReactFlow } from "@xyflow/react";
import { useEditorStore, useTemporalStore } from "./editorStore";
import { Node } from "@xyflow/react";
import { NodeData, KeyBindings, KeyBinding } from "./types";

interface KeyboardShortcutsProps {
  jsonStore?: string;
  keyBindings?: Partial<KeyBindings>;
}

// Default keybindings
const defaultKeyBindings: KeyBindings = {
  addTaskNode: { key: '1', ctrl: true },
  addTopicNode: { key: '2', ctrl: true },
  addImageNode: { key: '3', ctrl: true },
  addTextNode: { key: '4', ctrl: true },
  save: { key: 's', ctrl: true },
  undo: { key: 'z', ctrl: true },
  redo: { key: 'y', ctrl: true },
  help: { key: '?', ctrl: true },
  togglePreview: { key: 'p', ctrl: true },
  toggleDebug: { key: 'd', ctrl: true },
  zoomIn: { key: '+', ctrl: true },
  zoomOut: { key: '-', ctrl: true },
  resetZoom: { key: '0', ctrl: true },
  toggleGrid: { key: "'", ctrl: true },
  resetMap: { key: 'Delete', ctrl: true },
  cut: { key: 'x', ctrl: true },
  copy: { key: 'c', ctrl: true },
  paste: { key: 'v', ctrl: true },
  selectAll: { key: 'a', ctrl: true },
  fitView: { key: '!', shift: true },
  zoomToSelection: { key: '@', shift: true },
  deleteSelected: { key: 'Delete' },
};

const matchesKeyBinding = (e: KeyboardEvent, binding: KeyBinding | undefined): boolean => {
  if (!binding) return false;
  
  const keyMatches = e.key.toLowerCase() === binding.key.toLowerCase();
  const ctrlMatches = binding.ctrl ? (e.ctrlKey || e.metaKey) : !(e.ctrlKey || e.metaKey);
  const shiftMatches = binding.shift ? e.shiftKey : !e.shiftKey;
  const altMatches = binding.alt ? e.altKey : !e.altKey;
  
  return keyMatches && ctrlMatches && shiftMatches && altMatches;
};

export const KeyboardShortcuts = ({ 
  jsonStore = "https://json.openpatch.org",
  keyBindings: customKeyBindings = {}
}: KeyboardShortcutsProps) => {
  // Merge custom keybindings with defaults
  const keyBindings = { ...defaultKeyBindings, ...customKeyBindings };
  
  const { zoomIn, zoomOut, setCenter, fitView, screenToFlowPosition } = useReactFlow();

  // Get store state
  const helpOpen = useEditorStore(state => state.helpOpen);
  const selectedNodeIds = useEditorStore(state => state.selectedNodeIds);
  const selectedEdge = useEditorStore(state => state.selectedEdge);
  const nodes = useEditorStore(state => state.nodes);
  const lastMousePosition = useEditorStore(state => state.lastMousePosition);

  // Get store actions
  const setHelpOpen = useEditorStore(state => state.setHelpOpen);
  const addNode = useEditorStore(state => state.addNode);
  const getRoadmapData = useEditorStore(state => state.getRoadmapData);
  const setPreviewMode = useEditorStore(state => state.setPreviewMode);
  const setDebugMode = useEditorStore(state => state.setDebugMode);
  const setClipboard = useEditorStore(state => state.setClipboard);
  const clipboard = useEditorStore(state => state.clipboard);
  const setNodes = useEditorStore(state => state.setNodes);
  const setEdges = useEditorStore(state => state.setEdges);
  const setSelectedNodeIds = useEditorStore(state => state.setSelectedNodeIds);
  const showGrid = useEditorStore(state => state.showGrid);
  const setShowGrid = useEditorStore(state => state.setShowGrid);
  const deleteNode = useEditorStore(state => state.deleteNode);
  const deleteEdge = useEditorStore(state => state.deleteEdge);
  const setSelectedEdge = useEditorStore(state => state.setSelectedEdge);
  const setEdgeDrawerOpen = useEditorStore(state => state.setEdgeDrawerOpen);
  const drawerOpen = useEditorStore(state => state.drawerOpen);
  const edgeDrawerOpen = useEditorStore(state => state.edgeDrawerOpen);
  const settingsDrawerOpen = useEditorStore(state => state.settingsDrawerOpen);
  const getTranslationsFromStore = useEditorStore(state => state.getTranslations);

  const t = getTranslationsFromStore();

  // Temporal store for undo/redo
  const { undo, redo } = useTemporalStore((state) => ({
    undo: state.undo,
    redo: state.redo,
  }));

  const onAddNode = (type: "task" | "topic" | "image" | "text") => {
    const position = lastMousePosition || screenToFlowPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
    const newNode: Node<NodeData> = {
      id: `node-${Date.now()}`,
      type,
      position,
      data: {
        label: type === "task" ? t.newTask : type === "topic" ? t.newTopic : type,
        state: "unlocked",
      },
    };
    addNode(newNode);
  };

  const onDeleteSelected = () => {
    // Delete selected edge if any
    if (selectedEdge) {
      deleteEdge(selectedEdge.id);
      setSelectedEdge(null);
      setEdgeDrawerOpen(false);
      return;
    }
    
    // Otherwise delete selected nodes
    if (selectedNodeIds.length > 0) {
      // Delete all selected nodes
      selectedNodeIds.forEach(nodeId => {
        deleteNode(nodeId);
      });
      setSelectedNodeIds([]);
    }
  };

  const onSave = () => {
    const roadmapData = getRoadmapData();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(roadmapData, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "learningmap.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const onTogglePreview = () => {
    const currentPreviewMode = useEditorStore.getState().previewMode;
    setPreviewMode(!currentPreviewMode);
  };

  const onToggleDebug = () => {
    const currentDebugMode = useEditorStore.getState().debugMode;
    setDebugMode(!currentDebugMode);
  };

  const onResetMap = () => {
    if (confirm(t.resetMapWarning)) {
      setNodes([]);
      setEdges([]);
    }
  };

  const onCut = () => {
    const selectedNodes = nodes.filter(n => selectedNodeIds.includes(n.id));
    if (selectedNodes.length > 0) {
      setClipboard({ nodes: selectedNodes, edges: [] });
      // Delete all selected nodes
      selectedNodeIds.forEach(nodeId => {
        deleteNode(nodeId);
      });
      setSelectedNodeIds([]);
    }
  };

  const onCopy = () => {
    const selectedNodes = nodes.filter(n => selectedNodeIds.includes(n.id));
    if (selectedNodes.length > 0) {
      setClipboard({ nodes: selectedNodes, edges: [] });
    }
  };

  const onPaste = () => {
    if (clipboard && clipboard.nodes.length > 0) {
      const newNodes = clipboard.nodes.map(n => ({
        ...n,
        id: `node-${Date.now()}-${Math.random()}`,
        position: { x: n.position.x + 50, y: n.position.y + 50 },
      }));
      setNodes([...nodes, ...newNodes]);
      setSelectedNodeIds(newNodes.map(n => n.id));
    }
  };

  const onSelectAll = () => {
    setSelectedNodeIds(nodes.map(n => n.id));
  };

  const onZoomIn = () => zoomIn();
  const onZoomOut = () => zoomOut();
  const onResetZoom = () => setCenter(0, 0, { zoom: 1 });
  const onFitView = () => fitView();

  const onZoomToSelection = () => {
    if (selectedNodeIds.length > 0) {
      const selectedNodes = nodes.filter(n => selectedNodeIds.includes(n.id));
      if (selectedNodes.length > 0) {
        fitView({ nodes: selectedNodes, duration: 300 });
      }
    }
  };

  const onToggleGrid = () => setShowGrid(!showGrid);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (drawerOpen || edgeDrawerOpen || settingsDrawerOpen) {
        return; // Ignore shortcuts when any drawer is open
      }
      
      // Check each keybinding
      if (matchesKeyBinding(e, keyBindings.addTaskNode)) {
        e.preventDefault();
        onAddNode("task");
      } else if (matchesKeyBinding(e, keyBindings.addTopicNode)) {
        e.preventDefault();
        onAddNode("topic");
      } else if (matchesKeyBinding(e, keyBindings.addImageNode)) {
        e.preventDefault();
        onAddNode("image");
      } else if (matchesKeyBinding(e, keyBindings.addTextNode)) {
        e.preventDefault();
        onAddNode("text");
      } else if (matchesKeyBinding(e, keyBindings.save)) {
        e.preventDefault();
        onSave();
      } else if (matchesKeyBinding(e, keyBindings.undo)) {
        e.preventDefault();
        undo();
      } else if (matchesKeyBinding(e, keyBindings.redo)) {
        e.preventDefault();
        redo();
      } else if (matchesKeyBinding(e, keyBindings.help)) {
        e.preventDefault();
        setHelpOpen(!helpOpen);
      } else if (matchesKeyBinding(e, keyBindings.togglePreview)) {
        e.preventDefault();
        onTogglePreview();
      } else if (matchesKeyBinding(e, keyBindings.toggleDebug)) {
        e.preventDefault();
        onToggleDebug();
      } else if (matchesKeyBinding(e, keyBindings.zoomIn)) {
        e.preventDefault();
        onZoomIn();
      } else if (matchesKeyBinding(e, keyBindings.zoomOut)) {
        e.preventDefault();
        onZoomOut();
      } else if (matchesKeyBinding(e, keyBindings.resetZoom)) {
        e.preventDefault();
        onResetZoom();
      } else if (matchesKeyBinding(e, keyBindings.toggleGrid)) {
        e.preventDefault();
        onToggleGrid();
      } else if (matchesKeyBinding(e, keyBindings.resetMap)) {
        e.preventDefault();
        onResetMap();
      } else if (matchesKeyBinding(e, keyBindings.cut)) {
        e.preventDefault();
        onCut();
      } else if (matchesKeyBinding(e, keyBindings.copy)) {
        e.preventDefault();
        onCopy();
      } else if (matchesKeyBinding(e, keyBindings.paste)) {
        e.preventDefault();
        onPaste();
      } else if (matchesKeyBinding(e, keyBindings.selectAll)) {
        e.preventDefault();
        onSelectAll();
      } else if (matchesKeyBinding(e, keyBindings.fitView)) {
        e.preventDefault();
        onFitView();
      } else if (matchesKeyBinding(e, keyBindings.zoomToSelection)) {
        e.preventDefault();
        onZoomToSelection();
      } else if (matchesKeyBinding(e, keyBindings.deleteSelected)) {
        e.preventDefault();
        onDeleteSelected();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onAddNode, onDeleteSelected, onSave, undo, redo, helpOpen, setHelpOpen, onTogglePreview, onToggleDebug,
    onZoomIn, onZoomOut, onResetZoom, onFitView, onZoomToSelection, onToggleGrid,
    onResetMap, onCut, onCopy, onPaste, onSelectAll, drawerOpen, edgeDrawerOpen, settingsDrawerOpen, keyBindings]);

  return null;
};
