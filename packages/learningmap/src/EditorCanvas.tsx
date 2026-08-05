import { useCallback, memo, useEffect, useRef } from "react";
import { ReactFlow, Controls, Background, ControlButton, OnSelectionChangeFunc, Node, Edge, useReactFlow } from "@xyflow/react";
import { Info, Redo, Undo } from "lucide-react";
import { useEditorStore, useTemporalStore } from "./editorStore";
import { TaskNode } from "./nodes/TaskNode";
import { TopicNode } from "./nodes/TopicNode";
import { ImageNode } from "./nodes/ImageNode";
import { TextNode } from "./nodes/TextNode";
import FloatingEdge from "./FloatingEdge";
import { MultiNodePanel } from "./MultiNodePanel";
import { EditorPanel } from "./EditorPanel";
import { EdgePanel } from "./EdgePanel";
import { SettingsPanel } from "./SettingsPanel";
import { LayersPanel } from "./LayersPanel";
import { NodeData } from "./types";
import { getNodesAtPosition } from "./zIndexHelper";
import { getReadableTextColor } from "./colorHelper";

const nodeTypes = {
  topic: TopicNode,
  task: TaskNode,
  image: ImageNode,
  text: TextNode,
};

const edgeTypes = {
  floating: FloatingEdge
};

export const EditorCanvas = memo(() => {
  // Get state from store
  const nodes = useEditorStore(state => state.nodes);
  const edges = useEditorStore(state => state.edges);
  const showGrid = useEditorStore(state => state.showGrid);
  const selectedNodeIds = useEditorStore(state => state.selectedNodeIds);
  const settings = useEditorStore(state => state.settings);
  const pickerMode = useEditorStore(state => state.pickerMode);

  // Get actions from store
  const onNodesChange = useEditorStore(state => state.onNodesChange);
  const onEdgesChange = useEditorStore(state => state.onEdgesChange);
  const onConnect = useEditorStore(state => state.onConnect);
  const setSelectedNodeIds = useEditorStore(state => state.setSelectedNodeIds);
  const setSelectedNodeId = useEditorStore(state => state.setSelectedNodeId);
  const selectNode = useEditorStore(state => state.selectNode);
  const setSelectedEdge = useEditorStore(state => state.setSelectedEdge);
  const setDrawerOpen = useEditorStore(state => state.setDrawerOpen);
  const setEdgeDrawerOpen = useEditorStore(state => state.setEdgeDrawerOpen);
  const setSettingsDrawerOpen = useEditorStore(state => state.setSettingsDrawerOpen);
  const setHelpOpen = useEditorStore(state => state.setHelpOpen);
  const setLastMousePosition = useEditorStore(state => state.setLastMousePosition);
  const getTranslationsFromStore = useEditorStore(state => state.getTranslations);

  const { setViewport, screenToFlowPosition } = useReactFlow();
  const canvasRef = useRef<HTMLDivElement>(null);

  const t = getTranslationsFromStore();

  // Apply viewport from settings on mount or when settings change
  useEffect(() => {
    if (settings?.viewport) {
      setViewport({
        x: settings.viewport.x,
        y: settings.viewport.y,
        zoom: settings.viewport.zoom,
      });
    }
  }, [settings?.viewport, setViewport]);

  // Temporal store for undo/redo
  const { undo, redo, canUndo, canRedo } = useTemporalStore((state) => ({
    undo: state.undo,
    redo: state.redo,
    canUndo: state.pastStates.length > 0,
    canRedo: state.futureStates.length > 0,
  }));

  /**
   * Picks the next node underneath the cursor, so nodes covered by another one
   * can still be reached. Returns the clicked node when there is nothing to
   * cycle through.
   */
  const cycleStackedNode = useCallback((event: React.MouseEvent, clickedNodeId?: string) => {
    const { nodes: currentNodes, selectedNodeId: currentSelectedNodeId } = useEditorStore.getState();
    const point = screenToFlowPosition({ x: event.clientX, y: event.clientY });
    const stack = getNodesAtPosition(currentNodes, point);

    if (stack.length === 0) return null;

    const activeId = currentSelectedNodeId ?? clickedNodeId;
    const activeIndex = stack.findIndex(n => n.id === activeId);
    return stack[(activeIndex + 1) % stack.length];
  }, [screenToFlowPosition]);

  const handleNodeClick = useCallback((event: React.MouseEvent, node: Node<NodeData>) => {
    // Execute picker callback when in picker mode
    if (pickerMode) {
      const executePickerCallback = useEditorStore.getState().executePickerCallback;
      executePickerCallback(node.id);
      return;
    }

    // Ctrl/Cmd-click adds to the selection and Shift-drag draws a selection
    // box. Both are handled by React Flow, and taking over here would clear
    // the other selected nodes.
    if (event.ctrlKey || event.metaKey || event.shiftKey) {
      return;
    }

    const target = event.altKey ? cycleStackedNode(event, node.id) ?? node : node;

    selectNode(target.id, true);
  }, [selectNode, pickerMode, cycleStackedNode]);

  const handleEdgeClick = useCallback((_: any, edge: Edge) => {
    setSelectedEdge(edge);
    setEdgeDrawerOpen(true);
    setSelectedNodeId(null);
    setDrawerOpen(false);
    setSettingsDrawerOpen(false);
  }, [setSelectedEdge, setEdgeDrawerOpen, setSelectedNodeId, setDrawerOpen, setSettingsDrawerOpen]);

  const handleSelectionChange: OnSelectionChangeFunc = useCallback(
    ({ nodes: selectedNodes }) => {
      // Only select nodes, not edges (as per requirement #6)
      setSelectedNodeIds(selectedNodes.map(n => n.id));

      if (selectedNodes.length > 0) return;

      // Locked nodes are never selected on the canvas but can still be edited
      // through the panel, so keep the panel open for them.
      const state = useEditorStore.getState();
      const activeNode = state.nodes.find(n => n.id === state.selectedNodeId);
      if (activeNode?.data?.locked) return;

      setDrawerOpen(false);
      setSelectedNodeId(null);
    },
    [setSelectedNodeIds, setDrawerOpen, setSelectedNodeId]
  );

  // Track mouse position for keyboard shortcuts
  const handleMouseMove = useCallback((event: React.MouseEvent) => {
    const position = screenToFlowPosition({ x: event.clientX, y: event.clientY });
    setLastMousePosition(position);
  }, [screenToFlowPosition, setLastMousePosition]);

  // Close panels when clicking on empty canvas
  const handlePaneClick = useCallback((event: React.MouseEvent) => {
    // Locked nodes do not receive clicks, so alt-clicking "through" them lands
    // on the pane. Cycle from here as well to keep them reachable.
    if (event.altKey && !pickerMode) {
      const target = cycleStackedNode(event);
      if (target) {
        selectNode(target.id, true);
        return;
      }
    }

    setDrawerOpen(false);
    setSelectedNodeId(null);
    setEdgeDrawerOpen(false);
    setSelectedEdge(null);
    setSettingsDrawerOpen(false);
  }, [setDrawerOpen, setSelectedNodeId, setEdgeDrawerOpen, setSelectedEdge, setSettingsDrawerOpen, cycleStackedNode, selectNode, pickerMode]);

  const defaultEdgeOptions = {
    animated: false,
    style: {
      stroke: settings?.defaultEdgeColor || "#94a3b8",
      strokeWidth: 2,
    },
    type: settings?.defaultEdgeType || "default",
  };

  return (
    <div
      ref={canvasRef}
      className={`editor-canvas ${pickerMode ? "picker-mode" : ""}`}
      style={{
        backgroundColor: settings?.background?.color || "#ffffff",
        cursor: pickerMode ? "crosshair" : "default",
        // Default text colour for text nodes that have none of their own.
        ["--learningmap-text-default" as any]: getReadableTextColor(settings?.background?.color),
      }}
      onMouseMove={handleMouseMove}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        onEdgeClick={handleEdgeClick}
        onNodesChange={onNodesChange}
        onConnect={onConnect}
        onSelectionChange={handleSelectionChange}
        onPaneClick={handlePaneClick}
        nodeTypes={nodeTypes}
        selectionOnDrag={false}
        minZoom={0.2}
        edgeTypes={edgeTypes}
        proOptions={{ hideAttribution: true }}
        defaultEdgeOptions={defaultEdgeOptions}
        nodesDraggable={!pickerMode}
        // Selected nodes are lifted above the stack so their resize handles
        // stay reachable even when the node itself sits in the background.
        elevateNodesOnSelect={true}
        nodesConnectable={!pickerMode}
        selectNodesOnDrag={false}
        elementsSelectable={!pickerMode}
        colorMode="light"
      >
        {showGrid && <Background />}
        <Controls>
          <ControlButton title={t.undo} disabled={!canUndo} onClick={() => undo()}>
            <Undo />
          </ControlButton>
          <ControlButton title={t.redo} disabled={!canRedo} onClick={() => redo()}>
            <Redo />
          </ControlButton>
          <ControlButton title={t.help} onClick={() => setHelpOpen(true)}>
            <Info />
          </ControlButton>
        </Controls>
        {selectedNodeIds.length > 1 && <MultiNodePanel />}
        <LayersPanel />
        <EditorPanel />
        <EdgePanel />
        <SettingsPanel />
      </ReactFlow>
    </div>
  );
});

EditorCanvas.displayName = 'EditorCanvas';
