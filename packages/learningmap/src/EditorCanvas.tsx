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
import { getTranslations } from "./translations";
import { NodeData } from "./types";

const nodeTypes = {
  topic: TopicNode,
  task: TaskNode,
  image: ImageNode,
  text: TextNode,
};

const edgeTypes = {
  floating: FloatingEdge
};

interface EditorCanvasProps {
  defaultLanguage?: string;
}

export const EditorCanvas = memo(({ defaultLanguage = "en" }: EditorCanvasProps) => {
  // Get state from store
  const settings = useEditorStore(state => state.settings);
  const nodes = useEditorStore(state => state.nodes);
  const edges = useEditorStore(state => state.edges);
  const showGrid = useEditorStore(state => state.showGrid);
  const selectedNodeIds = useEditorStore(state => state.selectedNodeIds);

  // Get actions from store
  const onNodesChange = useEditorStore(state => state.onNodesChange);
  const onEdgesChange = useEditorStore(state => state.onEdgesChange);
  const onConnect = useEditorStore(state => state.onConnect);
  const setSelectedNodeIds = useEditorStore(state => state.setSelectedNodeIds);
  const setSelectedNodeId = useEditorStore(state => state.setSelectedNodeId);
  const setSelectedEdge = useEditorStore(state => state.setSelectedEdge);
  const setDrawerOpen = useEditorStore(state => state.setDrawerOpen);
  const setEdgeDrawerOpen = useEditorStore(state => state.setEdgeDrawerOpen);
  const setHelpOpen = useEditorStore(state => state.setHelpOpen);
  const setLastMousePosition = useEditorStore(state => state.setLastMousePosition);

  const { setViewport, screenToFlowPosition } = useReactFlow();
  const canvasRef = useRef<HTMLDivElement>(null);

  const language = settings?.language || defaultLanguage;
  const t = getTranslations(language);

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

  const handleNodeClick = useCallback((_: any, node: Node<NodeData>) => {
    setSelectedNodeId(node.id);
    setDrawerOpen(true);
    setSelectedEdge(null);
    setEdgeDrawerOpen(false);
  }, [setSelectedNodeId, setDrawerOpen, setSelectedEdge, setEdgeDrawerOpen]);

  const handleEdgeClick = useCallback((_: any, edge: Edge) => {
    setSelectedEdge(edge);
    setEdgeDrawerOpen(true);
    setSelectedNodeId(null);
    setDrawerOpen(false);
  }, [setSelectedEdge, setEdgeDrawerOpen, setSelectedNodeId, setDrawerOpen]);

  const handleSelectionChange: OnSelectionChangeFunc = useCallback(
    ({ nodes: selectedNodes }) => {
      setSelectedNodeIds(selectedNodes.map(n => n.id));
    },
    [setSelectedNodeIds]
  );

  // Track mouse position for keyboard shortcuts
  const handleMouseMove = useCallback((event: React.MouseEvent) => {
    const position = screenToFlowPosition({ x: event.clientX, y: event.clientY });
    setLastMousePosition(position);
  }, [screenToFlowPosition, setLastMousePosition]);

  const defaultEdgeOptions = {
    animated: false,
    style: {
      stroke: "#94a3b8",
      strokeWidth: 2,
    },
    type: "default",
  };

  return (
    <div
      ref={canvasRef}
      className="editor-canvas"
      style={{
        backgroundColor: settings?.background?.color || "#ffffff",
      }}
      onMouseMove={handleMouseMove}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onEdgesChange={onEdgesChange}
        onNodeDoubleClick={handleNodeClick}
        onEdgeDoubleClick={handleEdgeClick}
        onNodesChange={onNodesChange}
        onConnect={onConnect}
        onSelectionChange={handleSelectionChange}
        nodeTypes={nodeTypes}
        selectionOnDrag={false}
        edgeTypes={edgeTypes}
        proOptions={{ hideAttribution: true }}
        defaultEdgeOptions={defaultEdgeOptions}
        nodesDraggable={true}
        elevateNodesOnSelect={false}
        nodesConnectable={true}
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
      </ReactFlow>
    </div>
  );
});

EditorCanvas.displayName = 'EditorCanvas';
