import { useState, useCallback, useEffect } from "react";
import {
  ReactFlow,
  Controls,
  useNodesState,
  useEdgesState,
  ColorMode,
  useReactFlow,
  Node,
  addEdge,
  Connection,
  Edge,
  Background,
  ControlButton,
  OnNodesChange,
  OnEdgesChange,
  Panel,
  OnSelectionChangeFunc,
  ReactFlowProvider,
} from "@xyflow/react";
import { EditorDrawer } from "./EditorDrawer";
import { EdgeDrawer } from "./EdgeDrawer";
import { TaskNode } from "./nodes/TaskNode";
import { TopicNode } from "./nodes/TopicNode";
import { ImageNode } from "./nodes/ImageNode";
import { TextNode } from "./nodes/TextNode";
import { RoadmapData, NodeData, ImageNodeData, TextNodeData, Settings } from "./types";
import { SettingsDrawer } from "./SettingsDrawer";
import FloatingEdge from "./FloatingEdge";
import { EditorToolbar } from "./EditorToolbar";
import { parseRoadmapData } from "./helper";
import { LearningMap } from "./LearningMap";
import { Info, Redo, Undo, RotateCw, ShieldAlert } from "lucide-react";
import useUndoable from "./useUndoable";
import { MultiNodePanel } from "./MultiNodePanel";
import { getTranslations } from "./translations";
import { WelcomeMessage } from "./WelcomeMessage";

const nodeTypes = {
  topic: TopicNode,
  task: TaskNode,
  image: ImageNode,
  text: TextNode,
};

const edgeTypes = {
  floating: FloatingEdge
};

export interface LearningMapEditorProps {
  roadmapData?: string | RoadmapData;
  language?: string;
  onChange?: (data: RoadmapData) => void;
}

const getDefaultFilename = () => {
  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}`;
};

export function LearningMapEditor({
  roadmapData,
  language = "en",
  onChange,
}: LearningMapEditorProps) {
  const { screenToFlowPosition, zoomIn, zoomOut, setCenter, fitView, getNodes, getEdges } = useReactFlow();
  const [roadmapState, setRoadmapState, { undo, redo, canUndo, canRedo, reset, resetInitialState }] = useUndoable<RoadmapData>({
    settings: {},
    version: 1,
  });

  const [saved, setSaved] = useState(true);
  const [didUndoRedo, setDidUndoRedo] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [debugMode, setDebugMode] = useState(false);
  const [nodes, setNodes, onNodesChange] = useNodesState<NodeData>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [settings, setSettings] = useState<Settings>({ background: { color: "#ffffff" } });
  const [showGrid, setShowGrid] = useState(true);
  const [clipboard, setClipboard] = useState<{ nodes: Node<NodeData>[]; edges: Edge[] } | null>(null);

  // Use language from settings if available, otherwise use prop
  const effectiveLanguage = settings?.language || language;
  const t = getTranslations(effectiveLanguage);

  const keyboardShortcuts = [
    { action: t.shortcuts.save, shortcut: "Ctrl+S" },
    { action: t.shortcuts.undo, shortcut: "Ctrl+Z" },
    { action: t.shortcuts.redo, shortcut: "Ctrl+Y or Ctrl+Shift+Z" },
    { action: t.shortcuts.addTaskNode, shortcut: "Ctrl+A" },
    { action: t.shortcuts.addTopicNode, shortcut: "Ctrl+O" },
    { action: t.shortcuts.addImageNode, shortcut: "Ctrl+I" },
    { action: t.shortcuts.addTextNode, shortcut: "Ctrl+T" },
    { action: t.shortcuts.deleteNodeEdge, shortcut: "Delete" },
    { action: t.shortcuts.togglePreviewMode, shortcut: "Ctrl+P" },
    { action: t.shortcuts.toggleDebugMode, shortcut: "Ctrl+D" },
    { action: t.shortcuts.selectMultipleNodes, shortcut: "Ctrl+Click or Shift+Drag" },
    { action: t.shortcuts.showHelp, shortcut: "Ctrl+? or Help Button" },
    { action: t.shortcuts.zoomIn, shortcut: "Ctrl++" },
    { action: t.shortcuts.zoomOut, shortcut: "Ctrl+-" },
    { action: t.shortcuts.resetZoom, shortcut: "Ctrl+0" },
    { action: t.shortcuts.fitView, shortcut: "Shift+1" },
    { action: t.shortcuts.zoomToSelection, shortcut: "Shift+2" },
    { action: t.shortcuts.toggleGrid, shortcut: "Ctrl+'" },
    { action: t.shortcuts.resetMap, shortcut: "Ctrl+Delete" },
    { action: t.shortcuts.cut, shortcut: "Ctrl+X" },
    { action: t.shortcuts.copy, shortcut: "Ctrl+C" },
    { action: t.shortcuts.paste, shortcut: "Ctrl+V" },
  ];

  const [helpOpen, setHelpOpen] = useState(false);
  const [colorMode] = useState<ColorMode>("light");
  const [selectedNodeId, setSelectedNodeId] = useState<Node<NodeData> | null>(null);
  const [selectedNodeIds, setSelectedNodeIds] = useState<string[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [settingsDrawerOpen, setSettingsDrawerOpen] = useState(false);
  const [nextNodeId, setNextNodeId] = useState(1);

  // Debug settings state
  const [showCompletionNeeds, setShowCompletionNeeds] = useState(true);
  const [showCompletionOptional, setShowCompletionOptional] = useState(true);
  const [showUnlockAfter, setShowUnlockAfter] = useState(true);

  // Edge drawer state
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);
  const [edgeDrawerOpen, setEdgeDrawerOpen] = useState(false);

  useEffect(() => {
    const parsedRoadmap = parseRoadmapData(roadmapData || "");
    loadRoadmapStateIntoReactFlowState(parsedRoadmap);
    resetInitialState(parsedRoadmap);
  }, [roadmapData])

  const loadRoadmapStateIntoReactFlowState = useCallback((roadmapState: RoadmapData) => {
    const nodesArr = Array.isArray(roadmapState?.nodes) ? roadmapState.nodes : [];
    const edgesArr = Array.isArray(roadmapState?.edges) ? roadmapState.edges : [];

    setSettings(roadmapState?.settings || { background: { color: "#ffffff" } });

    const rawNodes = nodesArr.map((n) => ({
      ...n,
      draggable: true,
      className: n.data.color ? n.data.color : n.className,
      data: { ...n.data },
    }));

    setEdges(edgesArr);
    setNodes(rawNodes);

    // Calculate next node ID
    if (nodesArr.length > 0) {
      const maxId = Math.max(
        ...nodesArr
          .map((n) => parseInt(n.id.replace(/\D/g, ""), 10))
          .filter((id) => !isNaN(id))
      );
      setNextNodeId(maxId + 1);
    }
  }, [setNodes, setEdges, setSettings]);

  useEffect(() => {
    if (didUndoRedo) {
      setDidUndoRedo(false);
      loadRoadmapStateIntoReactFlowState(roadmapState);
    }
  }, [roadmapState, didUndoRedo, loadRoadmapStateIntoReactFlowState]);

  useEffect(() => {
    const newEdges: Edge[] = edges.filter((e) => !e.id.startsWith("debug-"));
    if (debugMode) {
      nodes.forEach((node) => {
        if (showCompletionNeeds && node.type === "topic" && node.data?.completion?.needs) {
          node.data.completion.needs.forEach((needId: string) => {
            const edgeId = `debug-edge-${needId}-to-${node.id}`;
            newEdges.push({
              id: edgeId,
              target: needId,
              source: node.id,
              animated: true,
              style: { stroke: "#f97316", strokeWidth: 2, strokeDasharray: "5,5" },
              type: "floating",
            });
          });
        }
        if (showCompletionOptional && node.data?.completion?.optional) {
          node.data.completion.optional.forEach((optionalId: string) => {
            const edgeId = `debug-edge-optional-${optionalId}-to-${node.id}`;
            newEdges.push({
              id: edgeId,
              target: optionalId,
              source: node.id,
              animated: true,
              style: { stroke: "#eab308", strokeWidth: 2, strokeDasharray: "5,5" },
              type: "floating",
            });
          });
        }
      });
      nodes.forEach((node) => {
        if (showUnlockAfter && node.data.unlock?.after) {
          node.data.unlock.after.forEach((unlockId: string) => {
            const edgeId = `debug-edge-${unlockId}-to-${node.id}`;
            newEdges.push({
              id: edgeId,
              target: unlockId,
              source: node.id,
              animated: true,
              style: { stroke: "#10b981", strokeWidth: 2, strokeDasharray: "5,5" },
              type: "floating",
            });
          });
        }
      });
    }
    setEdges(newEdges);
  }, [nodes, setEdges, debugMode, showCompletionNeeds, showCompletionOptional, showUnlockAfter]);

  // Event handlers
  const onNodeClick = useCallback((_: any, node: Node) => {
    setSelectedNodeId(node.id);
    setDrawerOpen(true);
  }, []);

  const onEdgeClick = useCallback((_: any, edge: Edge) => {
    setSelectedEdge(edge);
    setEdgeDrawerOpen(true);
  }, []);

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) => addEdge(connection, eds));
      setSaved(false);
    },
    [setEdges, setSaved]
  );

  const toggleDebugMode = useCallback(() => {
    setDebugMode((mode) => !mode);
  }, [setDebugMode]);

  const closeDrawer = useCallback(() => {
    setDrawerOpen(false);
    setSelectedNodeId(null);
    setEdgeDrawerOpen(false);
    setSelectedEdge(null);
    setSettingsDrawerOpen(false)
  }, []);

  const updateNode = useCallback(
    (updatedNode: Node) => {
      setNodes((nds) =>
        nds.map((n) => (n.id === updatedNode.id ? updatedNode : n))
      );
      setSaved(false);
    },
    [setNodes, setSaved]
  );

  const updateNodes = useCallback(
    (updatedNodes: Node[]) => {
      setNodes((nds) => nds.map(n => {
        const updated = updatedNodes.find(un => un.id === n.id);
        return updated ? updated : n;
      }));
      setSaved(false);
    },
    [setNodes, setSaved]
  );

  const updateEdge = useCallback(
    (updatedEdge: Edge) => {
      setEdges((eds) =>
        eds.map((e) => (e.id === updatedEdge.id ? { ...e, ...updatedEdge } : e))
      );
      setSelectedEdge(updatedEdge);
      setSaved(false);
    },
    [setEdges, setSelectedEdge, setSaved]
  );

  // Delete selected edge
  const deleteEdge = useCallback(() => {
    if (!selectedEdge) return;
    setEdges((eds) => eds.filter((e) => e.id !== selectedEdge.id));
    setSaved(false);
    closeDrawer();
  }, [selectedEdge, setEdges, closeDrawer]);

  const deleteNode = useCallback(() => {
    if (!selectedNodeId) return;
    setNodes((nds) => nds.filter((n) => n.id !== selectedNodeId));
    setEdges((eds) =>
      eds.filter((e) => e.source !== selectedNodeId && e.target !== selectedNodeId)
    );
    setSaved(false);
    closeDrawer();
  }, [selectedNodeId, setNodes, setEdges, closeDrawer, setSaved]);

  const addNewNode = useCallback(
    (type: "task" | "topic" | "image" | "text") => {
      const centerPos = screenToFlowPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
      if (type === "task") {
        const newNode: Node<NodeData> = {
          id: `node${nextNodeId}`,
          type,
          position: centerPos,
          data: {
            label: t.newTask,
            summary: "",
            description: "",
          },
        };
        setNodes((nds) => [...nds, newNode]);
        setNextNodeId((id) => id + 1);
      } else if (type === "topic") {
        const newNode: Node<NodeData> = {
          id: `node${nextNodeId}`,
          type,
          position: centerPos,
          data: {
            label: t.newTopic,
            summary: "",
            description: "",
          },
        };
        setNodes((nds) => [...nds, newNode]);
        setNextNodeId((id) => id + 1);
      }
      else if (type === "image") {
        const newNode: Node<ImageNodeData> = {
          id: `background-node${nextNodeId}`,
          type,
          zIndex: -2,
          position: centerPos,
          data: {
            src: "",
          },
        };
        setNodes((nds) => [...nds, newNode]);
        setNextNodeId((id) => id + 1);
      } else if (type === "text") {
        const newNode: Node<TextNodeData> = {
          id: `background-node${nextNodeId}`,
          type,
          position: centerPos,
          zIndex: -1,
          data: {
            text: t.backgroundTextDefault,
            fontSize: 32,
            color: "#e5e7eb",
          },
        };
        setNodes((nds) => [...nds, newNode]);
        setNextNodeId((id) => id + 1);
      }
      setSaved(false);
    },
    [nextNodeId, screenToFlowPosition, setNodes, setSaved, t]
  );

  const handleSave = useCallback(() => {
    const roadmapData: RoadmapData = {
      nodes: nodes.map((n) => ({
        id: n.id,
        type: n.type,
        position: n.position,
        width: n.width,
        height: n.height,
        zIndex: n.zIndex,
        data: n.data,
      })),
      edges: edges.filter((e) => !e.id.startsWith("debug-"))
        .map((e) => ({
          id: e.id,
          source: e.source,
          target: e.target,
          sourceHandle: e.sourceHandle,
          targetHandle: e.targetHandle,
          animated: e.animated,
          type: e.type,
          style: e.style,
        })),
      settings,
      version: 1
    };

    setRoadmapState(roadmapData);
    setSaved(true);

    if (onChange) {
      onChange(roadmapData);
      return;
    } else {
      const root = document.querySelector("hyperbook-learningmap-editor");
      if (root) {
        root.dispatchEvent(new CustomEvent("change", { detail: roadmapData }));
      }
    }
  }, [nodes, edges, settings]);

  // Auto-save when changes are made
  useEffect(() => {
    if (!saved) {
      const timeoutId = setTimeout(() => {
        handleSave();
      }, 1000); // Auto-save after 1 second of inactivity

      return () => clearTimeout(timeoutId);
    }
  }, [saved, handleSave]);

  const togglePreviewMode = useCallback(() => {
    handleSave();
    setPreviewMode((mode) => {
      const newMode = !mode;
      if (newMode) {
        setDebugMode(false);
        closeDrawer();
      }
      return newMode;
    });
  }, [setPreviewMode, handleSave]);

  const handleDownload = useCallback(() => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(roadmapState, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `${roadmapState.settings.title?.trim() ?? getDefaultFilename()}.learningmap`);
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  }, [roadmapState]);

  const defaultEdgeOptions = {
    animated: false,
    style: {
      stroke: "#94a3b8",
      strokeWidth: 2,
    },
    type: "default",
  };

  const handleOpen = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.learningmap,application/json';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (!file) return;

      if (!window.confirm(t.openFileWarning)) {
        return;
      }

      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const content = evt.target?.result;
          if (typeof content === 'string') {
            const json = JSON.parse(content);
            setRoadmapState(json);
            loadRoadmapStateIntoReactFlowState(json);
          }
        } catch (err) {
          alert(t.failedToLoadFile);
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }, [setRoadmapState, setDidUndoRedo, t]);

  // Toolbar handler wrappers for EditorToolbar props
  const handleOpenSettingsDrawer = useCallback(() => setSettingsDrawerOpen(true), []);
  const handleSetShowCompletionNeeds = useCallback((checked: boolean) => setShowCompletionNeeds(checked), []);
  const handleSetShowCompletionOptional = useCallback((checked: boolean) => setShowCompletionOptional(checked), []);
  const handleSetShowUnlockAfter = useCallback((checked: boolean) => setShowUnlockAfter(checked), []);

  const handleNodesChange: OnNodesChange = useCallback(
    (changes) => {
      setSaved(false);
      onNodesChange(changes);
    },
    [onNodesChange, setSaved]
  );

  const handleEdgesChange: OnEdgesChange = useCallback(
    (changes) => {
      setSaved(false);
      onEdgesChange(changes);
    },
    [onEdgesChange, setSaved]
  );

  const handleUndo = useCallback(() => {
    if (canUndo) {
      undo();
      setDidUndoRedo(true);
    }
  }, [canUndo, undo]);

  const handleRedo = useCallback(() => {
    if (canRedo) {
      redo();
      setDidUndoRedo(true);
    }
  }, [canRedo, redo]);

  const handleReset = useCallback(() => {
    reset();
    setDidUndoRedo(true);
  }, [reset]);

  const handleCut = useCallback(() => {
    const selectedNodes = nodes.filter(n => selectedNodeIds.includes(n.id));
    if (selectedNodes.length > 0) {
      const selectedNodeIdSet = new Set(selectedNodeIds);
      const relatedEdges = edges.filter(e => 
        selectedNodeIdSet.has(e.source) && selectedNodeIdSet.has(e.target)
      );
      setClipboard({ nodes: selectedNodes, edges: relatedEdges });
      // Delete the selected nodes
      setNodes(nds => nds.filter(n => !selectedNodeIdSet.has(n.id)));
      setEdges(eds => eds.filter(e => 
        !selectedNodeIdSet.has(e.source) && !selectedNodeIdSet.has(e.target)
      ));
      setSelectedNodeIds([]);
      setSaved(false);
    }
  }, [nodes, edges, selectedNodeIds, setNodes, setEdges, setSelectedNodeIds, setSaved]);

  const handleCopy = useCallback(() => {
    const selectedNodes = nodes.filter(n => selectedNodeIds.includes(n.id));
    if (selectedNodes.length > 0) {
      const selectedNodeIdSet = new Set(selectedNodeIds);
      const relatedEdges = edges.filter(e => 
        selectedNodeIdSet.has(e.source) && selectedNodeIdSet.has(e.target)
      );
      setClipboard({ nodes: selectedNodes, edges: relatedEdges });
    }
  }, [nodes, edges, selectedNodeIds]);

  const handlePaste = useCallback(() => {
    if (!clipboard) return;
    
    // Create a mapping from old node IDs to new node IDs
    const idMapping: Record<string, string> = {};
    let newNextNodeId = nextNodeId;
    
    const newNodes = clipboard.nodes.map(node => {
      const newId = node.id.startsWith('background-node') 
        ? `background-node${newNextNodeId}` 
        : `node${newNextNodeId}`;
      idMapping[node.id] = newId;
      newNextNodeId++;
      
      return {
        ...node,
        id: newId,
        position: {
          x: node.position.x + 50,
          y: node.position.y + 50,
        },
      };
    });
    
    const newEdges = clipboard.edges.map((edge, idx) => ({
      ...edge,
      id: `e${Date.now()}-${idx}`,
      source: idMapping[edge.source] || edge.source,
      target: idMapping[edge.target] || edge.target,
    }));
    
    setNodes(nds => [...nds, ...newNodes]);
    setEdges(eds => [...eds, ...newEdges]);
    setNextNodeId(newNextNodeId);
    setSelectedNodeIds(newNodes.map(n => n.id));
    setSaved(false);
  }, [clipboard, nextNodeId, setNodes, setEdges, setNextNodeId, setSelectedNodeIds, setSaved]);

  const handleZoomIn = useCallback(() => {
    zoomIn();
  }, [zoomIn]);

  const handleZoomOut = useCallback(() => {
    zoomOut();
  }, [zoomOut]);

  const handleResetZoom = useCallback(() => {
    setCenter(0, 0, { zoom: 1, duration: 300 });
  }, [setCenter]);

  const handleFitView = useCallback(() => {
    fitView({ duration: 300 });
  }, [fitView]);

  const handleZoomToSelection = useCallback(() => {
    if (selectedNodeIds.length > 0) {
      fitView({ nodes: selectedNodeIds, duration: 300, padding: 0.2 });
    }
  }, [selectedNodeIds, fitView]);

  const handleToggleGrid = useCallback(() => {
    setShowGrid(prev => !prev);
  }, []);

  const handleResetMap = useCallback(() => {
    if (confirm(t.openFileWarning)) {
      setNodes([]);
      setEdges([]);
      setNextNodeId(1);
      setSaved(false);
    }
  }, [setNodes, setEdges, setNextNodeId, setSaved, t]);

  const handleSelectionChange: OnSelectionChangeFunc = useCallback(
    ({ nodes: selectedNodes }) => {
      if (selectedNodes.length > 1) {
        setSelectedNodeIds(selectedNodes.map(n => n.id));
      } else {
        setSelectedNodeIds([]);
      }
    },
    [setSelectedNodeIds]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      //save shortcut
      if ((e.ctrlKey || e.metaKey) && e.key === 's' && !e.shiftKey) {
        e.preventDefault();
        handleSave();
      }
      // undo shortcut
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }
      // redo shortcut
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'Z'))) {
        e.preventDefault();
        handleRedo();
      }
      // add task node shortcut
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'a' && !e.shiftKey) {
        e.preventDefault();
        addNewNode("task");
      }
      // add topic node shortcut
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'o' && !e.shiftKey) {
        e.preventDefault();
        addNewNode("topic");
      }
      // add image node shortcut
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'i' && !e.shiftKey) {
        e.preventDefault();
        addNewNode("image");
      }
      // add text node shortcut - changed to Ctrl+T
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 't' && !e.shiftKey) {
        e.preventDefault();
        addNewNode("text");
      }

      if ((e.ctrlKey || e.metaKey) && (e.key === '?' || (e.shiftKey && e.key === '/'))) {
        e.preventDefault();
        setHelpOpen(h => !h);
      }
      //preview toggle shortcut
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p' && !e.shiftKey) {
        e.preventDefault();
        togglePreviewMode();
      }
      //debug toggle shortcut
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd' && !e.shiftKey) {
        e.preventDefault();
        toggleDebugMode();
      }
      
      // Zoom in shortcut
      if ((e.ctrlKey || e.metaKey) && (e.key === '+' || e.key === '=') && !e.shiftKey) {
        e.preventDefault();
        handleZoomIn();
      }
      // Zoom out shortcut
      if ((e.ctrlKey || e.metaKey) && (e.key === '-' || e.key === '_') && !e.shiftKey) {
        e.preventDefault();
        handleZoomOut();
      }
      // Reset zoom shortcut
      if ((e.ctrlKey || e.metaKey) && e.key === '0' && !e.shiftKey) {
        e.preventDefault();
        handleResetZoom();
      }
      // Fit view shortcut
      if (e.shiftKey && e.key === '1' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        handleFitView();
      }
      // Zoom to selection shortcut
      if (e.shiftKey && e.key === '2' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        handleZoomToSelection();
      }
      // Toggle grid shortcut
      if ((e.ctrlKey || e.metaKey) && e.key === "'" && !e.shiftKey) {
        e.preventDefault();
        handleToggleGrid();
      }
      // Reset map shortcut
      if ((e.ctrlKey || e.metaKey) && e.key === 'Delete') {
        e.preventDefault();
        handleResetMap();
      }
      // Cut shortcut
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'x' && !e.shiftKey) {
        e.preventDefault();
        handleCut();
      }
      // Copy shortcut
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c' && !e.shiftKey) {
        e.preventDefault();
        handleCopy();
      }
      // Paste shortcut
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'v' && !e.shiftKey) {
        e.preventDefault();
        handlePaste();
      }
      
      // Dismiss with Escape
      if (helpOpen && e.key === 'Escape') {
        setHelpOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleSave, handleUndo, handleRedo, addNewNode, helpOpen, setHelpOpen, togglePreviewMode, toggleDebugMode, 
      handleZoomIn, handleZoomOut, handleResetZoom, handleFitView, handleZoomToSelection, handleToggleGrid, 
      handleResetMap, handleCut, handleCopy, handlePaste]);

  return (
    <>
      <EditorToolbar
        debugMode={debugMode}
        previewMode={previewMode}
        showCompletionNeeds={showCompletionNeeds}
        showCompletionOptional={showCompletionOptional}
        showUnlockAfter={showUnlockAfter}
        onToggleDebugMode={toggleDebugMode}
        onTogglePreviewMode={togglePreviewMode}
        onSetShowCompletionNeeds={handleSetShowCompletionNeeds}
        onSetShowCompletionOptional={handleSetShowCompletionOptional}
        onSetShowUnlockAfter={handleSetShowUnlockAfter}
        onAddNewNode={addNewNode}
        onOpenSettingsDrawer={handleOpenSettingsDrawer}
        onDownlad={handleDownload}
        onOpen={handleOpen}
        language={effectiveLanguage}
      />
      {previewMode && <LearningMap roadmapData={roadmapState} language={effectiveLanguage} />}
      {!previewMode && <>
        <div
          className="editor-canvas"
          style={{
            backgroundColor: settings?.background?.color || "#ffffff",
          }}
        >
          {nodes.length === 0 && edges.filter(e => !e.id.startsWith("debug-")).length === 0 && (
            <WelcomeMessage
              onOpenFile={handleOpen}
              onAddTopic={() => addNewNode("topic")}
              onShowHelp={() => setHelpOpen(true)}
              language={effectiveLanguage}
            />
          )}
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onEdgesChange={handleEdgesChange}
            onNodeDoubleClick={onNodeClick}
            onEdgeDoubleClick={onEdgeClick}
            onNodesChange={handleNodesChange}
            onConnect={onConnect}
            onSelectionChange={handleSelectionChange}
            nodeTypes={nodeTypes}
            selectionOnDrag={false}
            edgeTypes={edgeTypes}
            fitView
            proOptions={{ hideAttribution: true }}
            defaultEdgeOptions={defaultEdgeOptions}
            nodesDraggable={true}
            elevateNodesOnSelect={false}
            nodesConnectable={true}
            colorMode={colorMode}
          >
            {showGrid && <Background />}
            <Controls>
              <ControlButton title={t.undo} disabled={!canUndo} onClick={handleUndo}>
                <Undo />
              </ControlButton>
              <ControlButton title={t.redo} disabled={!canRedo} onClick={handleRedo}>
                <Redo />
              </ControlButton>
              <ControlButton title={t.reset} onClick={handleReset}>
                <RotateCw />
              </ControlButton>
              <ControlButton title={t.help} onClick={() => setHelpOpen(true)}>
                <Info />
              </ControlButton>
            </Controls>
            {!saved && <Panel position="bottom-right" title={t.unsavedChanges} onClick={() => { handleSave(); }}>
              <ShieldAlert size={32} color="var(--learningmap-color-coal)" />
            </Panel>}
            {selectedNodeIds.length > 1 && <MultiNodePanel nodes={nodes.filter(n => selectedNodeIds.includes(n.id))} onUpdate={updateNodes} />}
          </ReactFlow>
        </div>
        <EditorDrawer
          node={nodes.find(n => n.id === selectedNodeId)}
          isOpen={drawerOpen}
          onClose={closeDrawer}
          onUpdate={updateNode}
          onDelete={deleteNode}
          language={effectiveLanguage}
        />
        <EdgeDrawer
          edge={selectedEdge}
          isOpen={edgeDrawerOpen}
          onClose={closeDrawer}
          onUpdate={updateEdge}
          onDelete={deleteEdge}
          language={effectiveLanguage}
        />
        <SettingsDrawer
          isOpen={settingsDrawerOpen}
          onClose={closeDrawer}
          settings={settings}
          onUpdate={setSettings}
          language={effectiveLanguage}
        />
        <dialog
          className="help"
          open={helpOpen}
          onClose={() => setHelpOpen(false)}
        >
          <h2>{t.keyboardShortcuts}</h2>
          <table>
            <thead>
              <tr>
                <th>{t.action}</th>
                <th>{t.shortcut}</th>
              </tr>
            </thead>
            <tbody>
              {keyboardShortcuts.map((item) => (
                <tr key={item.action}>
                  <td>{item.action}</td>
                  <td>{item.shortcut}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <button className="primary-button" onClick={() => setHelpOpen(false)}>{t.close}</button>
        </dialog>
      </>
      }
    </>
  );
}

export default (props: LearningMapEditorProps) => {
  return (
    <div className="hyperbook-learningmap-container">
      <ReactFlowProvider>
        <LearningMapEditor
          {...props}
        />
      </ReactFlowProvider>
    </div>
  )
}
