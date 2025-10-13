import { useCallback, useEffect } from "react";
import {
  ReactFlow,
  Controls,
  ColorMode,
  useReactFlow,
  Node,
  Edge,
  Background,
  ControlButton,
  OnNodesChange,
  OnEdgesChange,
  OnSelectionChangeFunc,
  ReactFlowProvider,
} from "@xyflow/react";
import { EditorDrawer } from "./EditorDrawer";
import { EdgeDrawer } from "./EdgeDrawer";
import { TaskNode } from "./nodes/TaskNode";
import { TopicNode } from "./nodes/TopicNode";
import { ImageNode } from "./nodes/ImageNode";
import { TextNode } from "./nodes/TextNode";
import { RoadmapData, NodeData, ImageNodeData, TextNodeData } from "./types";
import { SettingsDrawer } from "./SettingsDrawer";
import FloatingEdge from "./FloatingEdge";
import { EditorToolbar } from "./EditorToolbar";
import { LearningMap } from "./LearningMap";
import { Info, Redo, Undo, RotateCw, X } from "lucide-react";
import { useEditorStore, useTemporalStore } from "./editorStore";
import { MultiNodePanel } from "./MultiNodePanel";
import { getTranslations } from "./translations";
import { WelcomeMessage } from "./WelcomeMessage";
import { ShareDialog } from "./ShareDialog";
import { LoadExternalDialog } from "./LoadExternalDialog";

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
  jsonStore?: string;
}

const getDefaultFilename = () => {
  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}`;
};

export function LearningMapEditor({
  language = "en",
  jsonStore = "https://json.openpatch.org",
}: LearningMapEditorProps) {
  const { screenToFlowPosition, zoomIn, zoomOut, setCenter, fitView } = useReactFlow();

  // Only get minimal state needed in this component
  const nodes = useEditorStore(state => state.nodes);
  const edges = useEditorStore(state => state.edges);
  const settings = useEditorStore(state => state.settings);
  const previewMode = useEditorStore(state => state.previewMode);
  const debugMode = useEditorStore(state => state.debugMode);
  const showGrid = useEditorStore(state => state.showGrid);
  const helpOpen = useEditorStore(state => state.helpOpen);
  const selectedNodeId = useEditorStore(state => state.selectedNodeId);
  const selectedNodeIds = useEditorStore(state => state.selectedNodeIds);
  const selectedEdge = useEditorStore(state => state.selectedEdge);
  const showCompletionNeeds = useEditorStore(state => state.showCompletionNeeds);
  const showCompletionOptional = useEditorStore(state => state.showCompletionOptional);
  const showUnlockAfter = useEditorStore(state => state.showUnlockAfter);
  const lastMousePosition = useEditorStore(state => state.lastMousePosition);
  const nextNodeId = useEditorStore(state => state.nextNodeId);
  const clipboard = useEditorStore(state => state.clipboard);
  const pendingExternalId = useEditorStore(state => state.pendingExternalId);

  // Store actions
  const onNodesChange = useEditorStore(state => state.onNodesChange);
  const onEdgesChange = useEditorStore(state => state.onEdgesChange);
  const onConnect = useEditorStore(state => state.onConnect);
  const setHelpOpen = useEditorStore(state => state.setHelpOpen);
  const setShowGrid = useEditorStore(state => state.setShowGrid);
  const setSelectedNodeId = useEditorStore(state => state.setSelectedNodeId);
  const setSelectedNodeIds = useEditorStore(state => state.setSelectedNodeIds);
  const setDrawerOpen = useEditorStore(state => state.setDrawerOpen);
  const setSettingsDrawerOpen = useEditorStore(state => state.setSettingsDrawerOpen);
  const setEdgeDrawerOpen = useEditorStore(state => state.setEdgeDrawerOpen);
  const setSelectedEdge = useEditorStore(state => state.setSelectedEdge);
  const setNextNodeId = useEditorStore(state => state.setNextNodeId);
  const setClipboard = useEditorStore(state => state.setClipboard);
  const setLastMousePosition = useEditorStore(state => state.setLastMousePosition);
  const setShareDialogOpen = useEditorStore(state => state.setShareDialogOpen);
  const setLoadExternalDialogOpen = useEditorStore(state => state.setLoadExternalDialogOpen);
  const setPendingExternalId = useEditorStore(state => state.setPendingExternalId);
  const setShareLink = useEditorStore(state => state.setShareLink);
  const setDebugMode = useEditorStore(state => state.setDebugMode);
  const setPreviewMode = useEditorStore(state => state.setPreviewMode);
  const updateNode = useEditorStore(state => state.updateNode);
  const updateNodes = useEditorStore(state => state.updateNodes);
  const updateEdge = useEditorStore(state => state.updateEdge);
  const deleteNode = useEditorStore(state => state.deleteNode);
  const deleteEdge = useEditorStore(state => state.deleteEdge);
  const addNode = useEditorStore(state => state.addNode);
  const loadRoadmapData = useEditorStore(state => state.loadRoadmapData);
  const getRoadmapData = useEditorStore(state => state.getRoadmapData);
  const closeAllDrawers = useEditorStore(state => state.closeAllDrawers);
  const setNodes = useEditorStore(state => state.setNodes);
  const setEdges = useEditorStore(state => state.setEdges);
  const setSettings = useEditorStore(state => state.setSettings);

  // Temporal store for undo/redo
  const { undo, redo, canUndo, canRedo } = useTemporalStore();

  const colorMode: ColorMode = "light";

  // Use language from settings if available, otherwise use prop
  const effectiveLanguage = settings?.language || language;
  const t = getTranslations(effectiveLanguage);

  const keyboardShortcuts = [
    { action: t.shortcuts.undo, shortcut: "Ctrl+Z" },
    { action: t.shortcuts.redo, shortcut: "Ctrl+Y or Ctrl+Shift+Z" },
    { action: t.shortcuts.addTaskNode, shortcut: "Ctrl+1" },
    { action: t.shortcuts.addTopicNode, shortcut: "Ctrl+2" },
    { action: t.shortcuts.addImageNode, shortcut: "Ctrl+3" },
    { action: t.shortcuts.addTextNode, shortcut: "Ctrl+4" },
    { action: t.shortcuts.deleteNodeEdge, shortcut: "Delete" },
    { action: t.shortcuts.togglePreviewMode, shortcut: "Ctrl+P" },
    { action: t.shortcuts.toggleDebugMode, shortcut: "Ctrl+D" },
    { action: t.shortcuts.selectMultipleNodes, shortcut: "Ctrl+Click or Shift+Drag" },
    { action: t.shortcuts.selectAllNodes, shortcut: "Ctrl+A" },
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

  useEffect(() => {
    // Filter out existing debug edges, but use the store's edges directly to avoid dependency loop
    const baseEdges = useEditorStore.getState().edges.filter((e) => !e.id.startsWith("debug-"));
    const newEdges: Edge[] = [...baseEdges];

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
  }, [nodes, debugMode, showCompletionNeeds, showCompletionOptional, showUnlockAfter, setEdges]);

  // Event handlers
  const handleNodeClick = useCallback((_: any, node: Node) => {
    setSelectedNodeId(node.id);
    setDrawerOpen(true);
  }, [setSelectedNodeId, setDrawerOpen]);

  const handleEdgeClick = useCallback((_: any, edge: Edge) => {
    setSelectedEdge(edge);
    setEdgeDrawerOpen(true);
  }, [setSelectedEdge, setEdgeDrawerOpen]);

  const closeDrawer = useCallback(() => {
    closeAllDrawers();
  }, [closeAllDrawers]);

  const handleUpdateNode = useCallback(
    (updatedNode: Node) => {
      updateNode(updatedNode.id, updatedNode);
    },
    [updateNode]
  );

  const handleUpdateNodes = useCallback(
    (updatedNodes: Node[]) => {
      updateNodes(updatedNodes);
    },
    [updateNodes]
  );

  const handleUpdateEdge = useCallback(
    (updatedEdge: Edge) => {
      updateEdge(updatedEdge.id, updatedEdge);
    },
    [updateEdge]
  );

  // Delete selected edge
  const handleDeleteEdge = useCallback(() => {
    if (!selectedEdge) return;
    deleteEdge(selectedEdge.id);
    closeAllDrawers();
  }, [selectedEdge, deleteEdge, closeAllDrawers]);

  const handleDeleteNode = useCallback(() => {
    if (!selectedNodeId) return;
    deleteNode(selectedNodeId);
    closeAllDrawers();
  }, [selectedNodeId, deleteNode, closeAllDrawers]);

  const addNewNode = useCallback(
    (type: "task" | "topic" | "image" | "text") => {
      // Use last mouse position if available, otherwise use center of screen
      const position = lastMousePosition
        ? screenToFlowPosition(lastMousePosition)
        : screenToFlowPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 });

      if (type === "task") {
        const newNode: Node<NodeData> = {
          id: `node${nextNodeId}`,
          type,
          position,
          data: {
            label: t.newTask,
            summary: "",
            description: "",
          },
        };
        addNode(newNode);
        setNextNodeId(nextNodeId + 1);
      } else if (type === "topic") {
        const newNode: Node<NodeData> = {
          id: `node${nextNodeId}`,
          type,
          position,
          data: {
            label: t.newTopic,
            summary: "",
            description: "",
          },
        };
        addNode(newNode);
        setNextNodeId(nextNodeId + 1);
      }
      else if (type === "image") {
        const newNode: Node<ImageNodeData> = {
          id: `background-node${nextNodeId}`,
          type,
          zIndex: -2,
          position,
          data: {
            src: "",
          },
        };
        addNode(newNode);
        setNextNodeId(nextNodeId + 1);
      } else if (type === "text") {
        const newNode: Node<TextNodeData> = {
          id: `background-node${nextNodeId}`,
          type,
          position,
          zIndex: -1,
          data: {
            text: t.backgroundTextDefault,
            fontSize: 32,
            color: "#e5e7eb",
          },
        };
        addNode(newNode);
        setNextNodeId(nextNodeId + 1);
      }
    },
    [nextNodeId, lastMousePosition, screenToFlowPosition, addNode, setNextNodeId, t]
  );

  const togglePreviewMode = useCallback(() => {
    const newMode = !previewMode;
    setPreviewMode(newMode);
    if (newMode) {
      setDebugMode(false);
      closeDrawer();
    }
  }, [previewMode, setPreviewMode, setDebugMode, closeDrawer]);

  const toggleDebugMode = useCallback(() => {
    setDebugMode(!debugMode);
  }, [debugMode, setDebugMode]);

  const handleDownload = useCallback(() => {
    const roadmapData = getRoadmapData();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(roadmapData, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `${roadmapData.settings.title?.trim() ?? getDefaultFilename()}.learningmap`);
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  }, [getRoadmapData]);

  const handleShare = useCallback(() => {
    const roadmapData = getRoadmapData();

    // Check if map is empty (no nodes)
    if (!roadmapData.nodes || roadmapData.nodes.length === 0) {
      alert(t.emptyMapCannotBeShared);
      return;
    }

    // Upload to JSON store
    fetch(`${jsonStore}/api/v2/post`, {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(roadmapData),
    })
      .then((r) => r.json())
      .then((json) => {
        const link = window.location.origin + window.location.pathname + "#json=" + json.id;
        setShareLink(link);
        setShareDialogOpen(true);
      })
      .catch(() => {
        alert(t.uploadFailed);
      });
  }, [getRoadmapData, jsonStore, t, setShareLink, setShareDialogOpen]);

  const loadFromJsonStore = useCallback((id: string) => {
    fetch(`${jsonStore}/api/v2/${id}`, {
      method: "GET",
      mode: "cors",
    })
      .then((r) => r.text())
      .then((text) => {
        const json = JSON.parse(text);
        loadRoadmapData(json);
        setLoadExternalDialogOpen(false);
        setPendingExternalId(null);
      })
      .catch(() => {
        alert(t.loadFailed);
      });
  }, [jsonStore, t, loadRoadmapData, setLoadExternalDialogOpen, setPendingExternalId]);

  const handleLoadExternal = useCallback((id: string) => {
    setPendingExternalId(id);
    setLoadExternalDialogOpen(true);
  }, [setPendingExternalId, setLoadExternalDialogOpen]);

  // Check for external JSON in URL hash on mount
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.startsWith("#json=")) {
      const id = hash.substring(6);
      handleLoadExternal(id);
    }
  }, [handleLoadExternal]);


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
            loadRoadmapData(json);
          }
        } catch (err) {
          alert(t.failedToLoadFile);
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }, [loadRoadmapData, t]);

  // Toolbar handler wrappers for EditorToolbar props
  const handleOpenSettingsDrawer = useCallback(() => setSettingsDrawerOpen(true), [setSettingsDrawerOpen]);

  const handleNodesChange: OnNodesChange = useCallback(
    (changes) => {
      onNodesChange(changes);
    },
    [onNodesChange]
  );

  const handleEdgesChange: OnEdgesChange = useCallback(
    (changes) => {
      onEdgesChange(changes);
    },
    [onEdgesChange]
  );

  const handleUndo = useCallback(() => {
    if (canUndo) {
      undo();
    }
  }, [canUndo, undo]);

  const handleRedo = useCallback(() => {
    if (canRedo) {
      redo();
    }
  }, [canRedo, redo]);

  const handleCut = useCallback(() => {
    const selectedNodes = nodes.filter(n => selectedNodeIds.includes(n.id));
    if (selectedNodes.length > 0) {
      const selectedNodeIdSet = new Set(selectedNodeIds);
      const relatedEdges = edges.filter(e =>
        selectedNodeIdSet.has(e.source) && selectedNodeIdSet.has(e.target)
      );
      setClipboard({ nodes: selectedNodes, edges: relatedEdges });
      // Delete the selected nodes
      selectedNodeIds.forEach(id => deleteNode(id));
      setSelectedNodeIds([]);
    }
  }, [nodes, edges, selectedNodeIds, deleteNode, setSelectedNodeIds, setClipboard]);

  const handleCopy = useCallback(() => {
    const selectedNodes = nodes.filter(n => selectedNodeIds.includes(n.id));
    if (selectedNodes.length > 0) {
      const selectedNodeIdSet = new Set(selectedNodeIds);
      const relatedEdges = edges.filter(e =>
        selectedNodeIdSet.has(e.source) && selectedNodeIdSet.has(e.target)
      );
      setClipboard({ nodes: selectedNodes, edges: relatedEdges });
    }
  }, [nodes, edges, selectedNodeIds, setClipboard]);

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

    newNodes.forEach(node => addNode(node));
    setEdges([...edges, ...newEdges]);
    setNextNodeId(newNextNodeId);
    setSelectedNodeIds(newNodes.map(n => n.id));
  }, [clipboard, nextNodeId, edges, addNode, setEdges, setNextNodeId, setSelectedNodeIds]);

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
      fitView({ nodes: selectedNodeIds.map(s => ({ id: s })), duration: 300, padding: 0.2 });
    }
  }, [selectedNodeIds, fitView]);

  const handleToggleGrid = useCallback(() => {
    setShowGrid(!showGrid);
  }, [showGrid, setShowGrid]);

  const handleResetMap = useCallback(() => {
    if (confirm(t.resetMapWarning)) {
      setNodes([]);
      setEdges([]);
      setNextNodeId(1);
    }
  }, [setNodes, setEdges, setNextNodeId, t]);

  const handleSelectAll = useCallback(() => {
    setSelectedNodeIds(nodes.map(n => n.id));
  }, [nodes, setSelectedNodeIds]);

  const handleSelectionChange: OnSelectionChangeFunc = useCallback(
    ({ nodes: selectedNodes }) => {
      setSelectedNodeIds(selectedNodes.map(n => n.id));
    },
    [setSelectedNodeIds]
  );

  // Track mouse position for node placement
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setLastMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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
      if ((e.ctrlKey || e.metaKey) && e.key === '1' && !e.shiftKey) {
        e.preventDefault();
        addNewNode("task");
      }
      // add topic node shortcut
      if ((e.ctrlKey || e.metaKey) && e.key === '2' && !e.shiftKey) {
        e.preventDefault();
        addNewNode("topic");
      }
      // add image node shortcut
      if ((e.ctrlKey || e.metaKey) && e.key === '3' && !e.shiftKey) {
        e.preventDefault();
        addNewNode("image");
      }
      if ((e.ctrlKey || e.metaKey) && e.key === '4' && !e.shiftKey) {
        e.preventDefault();
        addNewNode("text");
      }

      if ((e.ctrlKey || e.metaKey) && (e.key === '?' || (e.shiftKey && e.key === '/'))) {
        e.preventDefault();
        setHelpOpen(!helpOpen);
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
      if (e.shiftKey && e.code === 'Digit1' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        handleFitView();
      }
      // Zoom to selection shortcut
      if (e.shiftKey && e.code === 'Digit2' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        handleZoomToSelection();
      }

      // Toggle grid shortcut
      if ((e.ctrlKey || e.metaKey) && e.code === "Backslash") {
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
      // Select all shortcut
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'a' && !e.shiftKey) {
        e.preventDefault();
        handleSelectAll();
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
  }, [handleUndo, handleRedo, addNewNode, helpOpen, setHelpOpen, togglePreviewMode, toggleDebugMode,
    handleZoomIn, handleZoomOut, handleResetZoom, handleFitView, handleZoomToSelection, handleToggleGrid,
    handleResetMap, handleCut, handleCopy, handlePaste, handleSelectAll]);

  return (
    <>
      <EditorToolbar
        onAddNewNode={addNewNode}
        onOpenSettingsDrawer={handleOpenSettingsDrawer}
        onDownlad={handleDownload}
        onOpen={handleOpen}
        onShare={handleShare}
        onReset={handleResetMap}
        language={effectiveLanguage}
      />
      {previewMode && <LearningMap roadmapData={getRoadmapData()} language={effectiveLanguage} />}
      {!previewMode && <>
        <div
          className="editor-canvas"
          style={{
            backgroundColor: settings?.background?.color || "#ffffff",
          }}
        >
          {nodes.length === 0 && edges.length === 0 && <WelcomeMessage
            onOpenFile={handleOpen}
            onAddTopic={() => addNewNode("topic")}
            onShowHelp={() => setHelpOpen(true)}
            language={effectiveLanguage}
          />}
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onEdgesChange={handleEdgesChange}
            onNodeDoubleClick={handleNodeClick}
            onEdgeDoubleClick={handleEdgeClick}
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
              <ControlButton title={t.shortcuts.resetMap} onClick={handleResetMap}>
                <RotateCw />
              </ControlButton>
              <ControlButton title={t.help} onClick={() => setHelpOpen(true)}>
                <Info />
              </ControlButton>
            </Controls>
            {selectedNodeIds.length > 1 && <MultiNodePanel onUpdate={handleUpdateNodes} />}
          </ReactFlow>
        </div>
        <EditorDrawer
          isOpen={true}
          onClose={closeDrawer}
          onUpdate={handleUpdateNode}
          onDelete={handleDeleteNode}
          language={effectiveLanguage}
        />
        <EdgeDrawer
          onClose={closeDrawer}
          onUpdate={handleUpdateEdge}
          onDelete={handleDeleteEdge}
          language={effectiveLanguage}
        />
        <SettingsDrawer
          onClose={closeDrawer}
          onUpdate={setSettings}
          language={effectiveLanguage}
        />
        <dialog
          className="help"
          open={helpOpen}
          onClose={() => setHelpOpen(false)}
        >
          <header className="help-header">
            <h2>{t.keyboardShortcuts}</h2>
            <button className="close-button" onClick={() => setHelpOpen(false)} aria-label={t.close}>
              <X size={20} />
            </button>
          </header>
          <div className="help-content">
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
          </div>
          <div className="help-footer">
            <button className="primary-button" onClick={() => setHelpOpen(false)}>{t.close}</button>
          </div>
        </dialog>
        <ShareDialog
          onClose={() => setShareDialogOpen(false)}
          language={effectiveLanguage}
        />
        <LoadExternalDialog
          onClose={() => {
            setLoadExternalDialogOpen(false);
            setPendingExternalId(null);
          }}
          onDownloadCurrent={handleDownload}
          onReplace={() => {
            if (pendingExternalId) {
              loadFromJsonStore(pendingExternalId);
            }
          }}
          language={effectiveLanguage}
        />
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
