import { Controls, Edge, Node, Panel, ReactFlow, ReactFlowProvider, useReactFlow } from "@xyflow/react";
import { ImageNode } from "./nodes/ImageNode";
import { TaskNode } from "./nodes/TaskNode";
import { TextNode } from "./nodes/TextNode";
import { TopicNode } from "./nodes/TopicNode";
import { NodeData, RoadmapData, RoadmapState, Settings } from "./types";
import { useCallback, useEffect } from "react";
import { parseRoadmapData } from "./helper";
import { Drawer } from "./Drawer";
import { ProgressTracker } from "./ProgressTracker";
import { getTranslations } from "./translations";
import { useViewerStore } from "./viewerStore";

const nodeTypes = {
  topic: TopicNode,
  task: TaskNode,
  image: ImageNode,
  text: TextNode,
};

const isInteractableNode = (node: Node) => {
  return node.type === "task" || node.type === "topic";
}

const countCompletedNodes = (nodes: Node<NodeData>[]) => {
  let completed = 0;
  let mastered = 0;
  let total = 0;
  nodes.forEach(n => {
    if (n.type === "task" || n.type === "topic") {
      total++;
      if (n.data?.state === 'completed') {
        completed++;
      }
      else if (n.data?.state === 'mastered') {
        completed++;
        mastered++;
      }
    }
  });
  return { completed, mastered, total };
}

export interface LearningMapProps {
  roadmapData: string | RoadmapData;
  language?: string;
  onChange?: (state: RoadmapState) => void;
  initialState?: RoadmapState;
}

export function LearningMap({
  roadmapData,
  onChange,
  language = "en",
  initialState
}: LearningMapProps) {
  // Use Zustand store
  const nodes = useViewerStore(state => state.nodes);
  const edges = useViewerStore(state => state.edges);
  const settings = useViewerStore(state => state.settings);
  const selectedNode = useViewerStore(state => state.selectedNode);
  const drawerOpen = useViewerStore(state => state.drawerOpen);
  const onNodesChange = useViewerStore(state => state.onNodesChange);
  const setSelectedNode = useViewerStore(state => state.setSelectedNode);
  const setDrawerOpen = useViewerStore(state => state.setDrawerOpen);
  const loadRoadmapData = useViewerStore(state => state.loadRoadmapData);
  const getRoadmapState = useViewerStore(state => state.getRoadmapState);
  const updateNodesStates = useViewerStore(state => state.updateNodesStates);
  const updateNodeState = useViewerStore(state => state.updateNodeState);
  
  const { fitView, getViewport, setViewport } = useReactFlow();

  // Use language from settings if available, otherwise use prop
  const effectiveLanguage = settings?.language || language;
  const t = getTranslations(effectiveLanguage);

  const { completed, mastered, total } = countCompletedNodes(nodes);

  const parsedRoadmap = parseRoadmapData(roadmapData);

  useEffect(() => {
    loadRoadmapData(parsedRoadmap, initialState);
    setViewport({
      x: initialState?.x || 0,
      y: initialState?.y || 0,
      zoom: initialState?.zoom || 1,
    });
  }, [roadmapData, initialState]);

  const onNodeClick = useCallback((_: any, node: Node, focus: boolean = false) => {
    if (!isInteractableNode(node)) return;
    setSelectedNode(node);
    setDrawerOpen(true);

    if (focus) {
      fitView({ nodes: [node], duration: 150 });
    }
  }, [fitView, setSelectedNode, setDrawerOpen]);

  const closeDrawer = useCallback(() => {
    setDrawerOpen(false);
    setSelectedNode(null);
  }, [setDrawerOpen, setSelectedNode]);

  const updateNode = useCallback(
    (updatedNode: Node) => {
      if (updatedNode.data.state) {
        updateNodeState(updatedNode.id, updatedNode.data.state);
      }
      setSelectedNode(updatedNode);
    },
    [updateNodeState, setSelectedNode]
  );

  useEffect(() => {
    const viewport = getViewport();
    const minimalState = getRoadmapState(viewport);
    
    if (onChange) {
      onChange(minimalState);
    } else {
      const root = document.querySelector("hyperbook-learningmap");
      if (root) {
        root.dispatchEvent(new CustomEvent("change", { detail: minimalState }));
      }
    }
  }, [nodes, onChange]);

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
        nodes={nodes.map(n => {
          const className = [];
          if (n.data?.color) {
            className.push(n.data.color);
          }
          className.push(n.data?.state);
          return {
            ...n,
            selected: selectedNode?.id === n.id,
            className: className.join(" "),
          };
        })}
        edges={edges}
        onNodeClick={onNodeClick}
        onNodesChange={onNodesChange}
        nodeTypes={nodeTypes}
        fitView
        proOptions={{ hideAttribution: true }}
        defaultEdgeOptions={defaultEdgeOptions}
        nodesDraggable={false}
        nodesConnectable={false}
      >
        {settings?.title && (
          <Panel position="bottom-right">
            <div className="map-title">
              {settings.title}
            </div>
          </Panel>
        )}
        <Panel position="top-center" className="progress-panel">
          <ProgressTracker completed={completed} total={total} mastered={mastered} language={effectiveLanguage} />
        </Panel>
        <Controls showInteractive={false} />
      </ReactFlow>
      <Drawer node={selectedNode} open={drawerOpen} onClose={closeDrawer} onUpdate={updateNode} nodes={nodes} onNodeClick={onNodeClick} language={effectiveLanguage} />
    </div>
  )
}

export default (props: LearningMapProps) => {
  return <div className="hyperbook-learningmap-container">
    <ReactFlowProvider>
      <LearningMap
        {...props}
      />
    </ReactFlowProvider>
  </div>
}
