import { useEffect } from "react";
import { useReactFlow } from "@xyflow/react";
import { useEditorStore, useTemporalStore } from "./editorStore";
import { Node } from "@xyflow/react";
import { NodeData } from "./types";
import { getTranslations } from "./translations";

interface KeyboardShortcutsProps {
  jsonStore?: string;
}

export const KeyboardShortcuts = ({ jsonStore = "https://json.openpatch.org" }: KeyboardShortcutsProps) => {
  const { zoomIn, zoomOut, setCenter, fitView, screenToFlowPosition } = useReactFlow();
  
  // Get store state
  const helpOpen = useEditorStore(state => state.helpOpen);
  const selectedNodeIds = useEditorStore(state => state.selectedNodeIds);
  const nodes = useEditorStore(state => state.nodes);
  const lastMousePosition = useEditorStore(state => state.lastMousePosition);
  const settings = useEditorStore(state => state.settings);
  
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
  
  const language = settings?.language || "en";
  const t = getTranslations(language);
  
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
      if (e.ctrlKey || e.metaKey) {
        if (e.key === '1') {
          e.preventDefault();
          onAddNode("task");
        } else if (e.key === '2') {
          e.preventDefault();
          onAddNode("topic");
        } else if (e.key === '3') {
          e.preventDefault();
          onAddNode("image");
        } else if (e.key === '4') {
          e.preventDefault();
          onAddNode("text");
        } else if (e.key === 's') {
          e.preventDefault();
          onSave();
        } else if (e.key === 'z' && !e.shiftKey) {
          e.preventDefault();
          undo();
        } else if ((e.key === 'y') || (e.key === 'z' && e.shiftKey)) {
          e.preventDefault();
          redo();
        } else if ((e.key === '?' || (e.shiftKey && e.key === '/'))) {
          e.preventDefault();
          setHelpOpen(!helpOpen);
        } else if (e.key.toLowerCase() === 'p' && !e.shiftKey) {
          e.preventDefault();
          onTogglePreview();
        } else if (e.key.toLowerCase() === 'd' && !e.shiftKey) {
          e.preventDefault();
          onToggleDebug();
        } else if (e.key === '+' || e.key === '=') {
          e.preventDefault();
          onZoomIn();
        } else if (e.key === '-') {
          e.preventDefault();
          onZoomOut();
        } else if (e.key === '0') {
          e.preventDefault();
          onResetZoom();
        } else if (e.key === "'") {
          e.preventDefault();
          onToggleGrid();
        } else if (e.key === 'Delete') {
          e.preventDefault();
          onResetMap();
        } else if (e.key.toLowerCase() === 'x') {
          e.preventDefault();
          onCut();
        } else if (e.key.toLowerCase() === 'c') {
          e.preventDefault();
          onCopy();
        } else if (e.key.toLowerCase() === 'v') {
          e.preventDefault();
          onPaste();
        } else if (e.key.toLowerCase() === 'a') {
          e.preventDefault();
          onSelectAll();
        }
      } else if (e.shiftKey) {
        if (e.key === '!') {
          e.preventDefault();
          onFitView();
        } else if (e.key === '@') {
          e.preventDefault();
          onZoomToSelection();
        }
      } else if (e.key === 'Delete') {
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
    onResetMap, onCut, onCopy, onPaste, onSelectAll]);

  return null;
};
