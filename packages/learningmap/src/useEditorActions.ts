import { useCallback } from "react";
import { useReactFlow } from "@xyflow/react";
import { Node, Edge } from "@xyflow/react";
import { useEditorStore } from "./editorStore";
import { NodeData, ImageNodeData, TextNodeData } from "./types";

export const useEditorActions = (t: any, screenToFlowPosition: any, jsonStore: string) => {
  const { zoomIn, zoomOut, setCenter, fitView } = useReactFlow();
  
  // Get store state
  const nodes = useEditorStore(state => state.nodes);
  const edges = useEditorStore(state => state.edges);
  const selectedNodeId = useEditorStore(state => state.selectedNodeId);
  const selectedNodeIds = useEditorStore(state => state.selectedNodeIds);
  const selectedEdge = useEditorStore(state => state.selectedEdge);
  const clipboard = useEditorStore(state => state.clipboard);
  const nextNodeId = useEditorStore(state => state.nextNodeId);
  const lastMousePosition = useEditorStore(state => state.lastMousePosition);
  const debugMode = useEditorStore(state => state.debugMode);
  const previewMode = useEditorStore(state => state.previewMode);
  const showGrid = useEditorStore(state => state.showGrid);
  
  // Get store actions
  const setSelectedNodeId = useEditorStore(state => state.setSelectedNodeId);
  const setDrawerOpen = useEditorStore(state => state.setDrawerOpen);
  const setSelectedEdge = useEditorStore(state => state.setSelectedEdge);
  const setEdgeDrawerOpen = useEditorStore(state => state.setEdgeDrawerOpen);
  const updateNode = useEditorStore(state => state.updateNode);
  const updateNodes = useEditorStore(state => state.updateNodes);
  const updateEdge = useEditorStore(state => state.updateEdge);
  const deleteNode = useEditorStore(state => state.deleteNode);
  const deleteEdge = useEditorStore(state => state.deleteEdge);
  const addNode = useEditorStore(state => state.addNode);
  const setNextNodeId = useEditorStore(state => state.setNextNodeId);
  const setClipboard = useEditorStore(state => state.setClipboard);
  const setSelectedNodeIds = useEditorStore(state => state.setSelectedNodeIds);
  const setNodes = useEditorStore(state => state.setNodes);
  const setEdges = useEditorStore(state => state.setEdges);
  const getRoadmapData = useEditorStore(state => state.getRoadmapData);
  const loadRoadmapData = useEditorStore(state => state.loadRoadmapData);
  const setShareDialogOpen = useEditorStore(state => state.setShareDialogOpen);
  const setShareLink = useEditorStore(state => state.setShareLink);
  const setLoadExternalDialogOpen = useEditorStore(state => state.setLoadExternalDialogOpen);
  const setPendingExternalId = useEditorStore(state => state.setPendingExternalId);
  const closeAllDrawers = useEditorStore(state => state.closeAllDrawers);
  const setShowGrid = useEditorStore(state => state.setShowGrid);
  const setDebugMode = useEditorStore(state => state.setDebugMode);
  const setPreviewMode = useEditorStore(state => state.setPreviewMode);
  const setSettingsDrawerOpen = useEditorStore(state => state.setSettingsDrawerOpen);
  
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

  const handleSave = useCallback(() => {
    const roadmapData = getRoadmapData();
    return roadmapData;
  }, [getRoadmapData]);

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
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  }, [getRoadmapData]);

  const handleShare = useCallback(() => {
    const roadmapData = getRoadmapData();
    
    if (!roadmapData.nodes || roadmapData.nodes.length === 0) {
      alert(t.emptyMapCannotBeShared);
      return;
    }

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

  const handleOpenSettingsDrawer = useCallback(() => setSettingsDrawerOpen(true), [setSettingsDrawerOpen]);

  const handleCut = useCallback(() => {
    const selectedNodes = nodes.filter(n => selectedNodeIds.includes(n.id));
    if (selectedNodes.length > 0) {
      const selectedNodeIdSet = new Set(selectedNodeIds);
      const relatedEdges = edges.filter(e =>
        selectedNodeIdSet.has(e.source) && selectedNodeIdSet.has(e.target)
      );
      setClipboard({ nodes: selectedNodes, edges: relatedEdges });
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

  const handleDeleteSelected = useCallback(() => {
    if (selectedEdge) {
      handleDeleteEdge();
    } else if (selectedNodeId) {
      handleDeleteNode();
    }
  }, [selectedEdge, selectedNodeId, handleDeleteEdge, handleDeleteNode]);

  return {
    handleNodeClick,
    handleEdgeClick,
    closeDrawer,
    handleUpdateNode,
    handleUpdateNodes,
    handleUpdateEdge,
    handleDeleteEdge,
    handleDeleteNode,
    addNewNode,
    handleSave,
    togglePreviewMode,
    toggleDebugMode,
    handleDownload,
    handleShare,
    loadFromJsonStore,
    handleLoadExternal,
    handleOpen,
    handleOpenSettingsDrawer,
    handleCut,
    handleCopy,
    handlePaste,
    handleZoomIn,
    handleZoomOut,
    handleResetZoom,
    handleFitView,
    handleZoomToSelection,
    handleToggleGrid,
    handleResetMap,
    handleSelectAll,
    handleDeleteSelected,
  };
};

const getDefaultFilename = () => {
  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}`;
};
