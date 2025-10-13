import React, { useCallback, memo } from "react";
import { ReactFlow, Controls, Background, ControlButton, Panel, OnNodesChange, OnEdgesChange, OnSelectionChangeFunc } from "@xyflow/react";
import { Info, Redo, Undo, RotateCw, ShieldAlert } from "lucide-react";
import { useEditorStore, useTemporalStore } from "./editorStore";
import { TaskNode } from "./nodes/TaskNode";
import { TopicNode } from "./nodes/TopicNode";
import { ImageNode } from "./nodes/ImageNode";
import { TextNode } from "./nodes/TextNode";
import FloatingEdge from "./FloatingEdge";
import { MultiNodePanel } from "./MultiNodePanel";
import { getTranslations } from "./translations";

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
  onNodeClick: (event: any, node: any) => void;
  onEdgeClick: (event: any, edge: any) => void;
  onSave: () => void;
  language?: string;
}

export const EditorCanvas = memo(({ onNodeClick, onEdgeClick, onSave, language = "en" }: EditorCanvasProps) => {
  const t = getTranslations(language);
  
  // Get state from store
  const nodes = useEditorStore(state => state.nodes);
  const edges = useEditorStore(state => state.edges);
  const settings = useEditorStore(state => state.settings);
  const showGrid = useEditorStore(state => state.showGrid);
  const selectedNodeIds = useEditorStore(state => state.selectedNodeIds);
  
  // Get actions from store
  const onNodesChange = useEditorStore(state => state.onNodesChange);
  const onEdgesChange = useEditorStore(state => state.onEdgesChange);
  const onConnect = useEditorStore(state => state.onConnect);
  const setSelectedNodeIds = useEditorStore(state => state.setSelectedNodeIds);
  const setHelpOpen = useEditorStore(state => state.setHelpOpen);
  const updateNodes = useEditorStore(state => state.updateNodes);
  
  // Temporal store for undo/redo
  const { undo, redo } = useTemporalStore((state) => ({
    undo: state.undo,
    redo: state.redo,
  }));
  const canUndo = useTemporalStore((state) => state.pastStates.length > 0);
  const canRedo = useTemporalStore((state) => state.futureStates.length > 0);

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

  const handleSelectionChange: OnSelectionChangeFunc = useCallback(
    ({ nodes: selectedNodes }) => {
      setSelectedNodeIds(selectedNodes.map(n => n.id));
    },
    [setSelectedNodeIds]
  );
  
  const handleUpdateNodes = useCallback(
    (updatedNodes: any[]) => {
      updateNodes(updatedNodes);
    },
    [updateNodes]
  );

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
      className="editor-canvas"
      style={{
        backgroundColor: settings?.background?.color || "#ffffff",
      }}
    >
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
        {selectedNodeIds.length > 1 && <MultiNodePanel onUpdate={handleUpdateNodes} />}
      </ReactFlow>
    </div>
  );
});

EditorCanvas.displayName = 'EditorCanvas';
