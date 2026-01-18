import { Controls, Node, Panel, ReactFlow, ReactFlowProvider, useReactFlow } from "@xyflow/react";
import { ImageNode } from "./nodes/ImageNode";
import { TaskNode } from "./nodes/TaskNode";
import { TextNode } from "./nodes/TextNode";
import { TopicNode } from "./nodes/TopicNode";
import { NodeData, RoadmapData, RoadmapState } from "./types";
import { useCallback, useEffect } from "react";
import { parseRoadmapData } from "./helper";
import { Drawer } from "./Drawer";
import { ProgressTracker } from "./ProgressTracker";
import { useViewerStore } from "./viewerStore";
import { detectBrowserLanguage } from "./translations";

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
  language,
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
  const updateNodeState = useViewerStore(state => state.updateNodeState);
  const setDefaultLanguage = useViewerStore(state => state.setDefaultLanguage);

  const { fitView, getViewport } = useReactFlow();

  const { completed, mastered, total } = countCompletedNodes(nodes);

  const parsedRoadmap = parseRoadmapData(roadmapData);

  // Set default language from prop or browser detection
  useEffect(() => {
    const defaultLang = language && language !== "auto" ? language : detectBrowserLanguage();
    setDefaultLanguage(defaultLang);
  }, [language, setDefaultLanguage]);

  useEffect(() => {
    loadRoadmapData(parsedRoadmap, initialState);

    // Only use fitView if there's no saved state
    if (!initialState) {
      // Use setTimeout to ensure nodes are rendered before fitView
      setTimeout(() => {
        fitView({ duration: 0, padding: 0.2 });
      }, 0);
    }
  }, [roadmapData, initialState, loadRoadmapData, fitView]);

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
  }, [nodes, getViewport, getRoadmapState]);

  const defaultEdgeOptions = {
    animated: false,
    style: {
      stroke: "#94a3b8",
      strokeWidth: 2,
    },
    type: "default",
  };

  // Determine default viewport (only used if no saved state exists)
  const defaultViewport = {
    x: initialState?.x || settings?.viewport?.x || 0,
    y: initialState?.y || settings?.viewport?.y || 0,
    zoom: initialState?.zoom || settings?.viewport?.zoom || 1,
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
        minZoom={0.2}
        nodeTypes={nodeTypes}
        defaultViewport={defaultViewport}
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
          <ProgressTracker completed={completed} total={total} mastered={mastered} />
        </Panel>
        <Controls showInteractive={false} />
      </ReactFlow>
      <Drawer node={selectedNode} open={drawerOpen} onClose={closeDrawer} onUpdate={updateNode} nodes={nodes} onNodeClick={onNodeClick} />
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
