import { create } from 'zustand';
import { Node, Edge, applyNodeChanges, NodeChange } from '@xyflow/react';
import { NodeData, RoadmapData, RoadmapState, Settings } from './types';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface ViewerState {
  // Core data
  nodes: Node<NodeData>[];
  edges: Edge[];
  settings: Settings;
  
  // UI state
  selectedNode: Node<NodeData> | null;
  drawerOpen: boolean;
  
  // Actions
  onNodesChange: (changes: NodeChange<Node<NodeData>>[]) => void;
  setNodes: (nodes: Node<NodeData>[]) => void;
  setEdges: (edges: Edge[]) => void;
  setSettings: (settings: Settings) => void;
  updateNodeState: (nodeId: string, state: string) => void;
  setSelectedNode: (node: Node<NodeData> | null) => void;
  setDrawerOpen: (drawerOpen: boolean) => void;
  
  // Bulk operations
  loadRoadmapData: (roadmapData: RoadmapData, initialState?: RoadmapState) => void;
  getRoadmapState: (viewport: { x: number; y: number; zoom: number }) => RoadmapState;
  updateNodesStates: () => void;
}

const getStateMap = (nodes: Node<NodeData>[]) => {
  const stateMap: Record<string, string> = {};
  nodes.forEach((n) => {
    if (n.data?.state) {
      stateMap[n.id] = n.data.state;
    }
  });
  return stateMap;
};

const isCompleteState = (state: string) =>
  state === 'completed' || state === 'mastered';

const isInteractableNode = (node: Node) => {
  return node.type === 'task' || node.type === 'topic';
};

const calculateNodesStates = (nodes: Node<NodeData>[]) => {
  const updatedNodes = [...nodes];
  
  // Run twice to ensure all dependencies are resolved
  for (let i = 0; i < 2; i++) {
    const stateMap = getStateMap(updatedNodes);
    
    for (const node of updatedNodes) {
      node.data.state = node.data?.state || 'locked';
      
      // Check unlock conditions
      if (node.data?.unlock?.after) {
        const unlocked = node.data.unlock.after.every((depId: string) =>
          isCompleteState(stateMap[depId])
        );
        if (unlocked) {
          if (node.data.state === 'locked') {
            node.data.state = 'unlocked';
          }
        } else {
          node.data.state = 'locked';
        }
      }
      
      if (node.data?.unlock?.date) {
        const unlockDate = new Date(node.data.unlock.date);
        const now = new Date();
        if (now >= unlockDate) {
          if (node.data.state === 'locked') {
            node.data.state = 'unlocked';
          }
        } else {
          node.data.state = 'locked';
        }
      }
      
      if (!node.data?.unlock?.after && !node.data?.unlock?.date) {
        if (node.data.state === 'locked') {
          node.data.state = 'unlocked';
        }
      }
      
      // Handle topic completion
      if (node.type !== 'topic') continue;
      
      if (node.data?.completion?.needs) {
        const noNeeds = node.data.completion.needs.every((need: string) =>
          isCompleteState(stateMap[need])
        );
        if (node.data.state === 'unlocked' && noNeeds) {
          node.data.state = 'completed';
        }
      } else if (!node.data?.completion?.needs && node.data.state === 'unlocked') {
        node.data.state = 'completed';
      }
      
      if (node.data?.completion?.optional) {
        const noOptional = node.data.completion.optional.every((opt: string) =>
          isCompleteState(stateMap[opt])
        );
        if (node.data.state === 'completed' && noOptional) {
          node.data.state = 'mastered';
        }
      } else if (!node.data?.completion?.optional && node.data.state === 'completed') {
        node.data.state = 'mastered';
      }
    }
  }
  
  return updatedNodes;
};

export const useViewerStore = create<ViewerState>()((set, get) => ({
  // Initial state
  nodes: [],
  edges: [],
  settings: {},
  selectedNode: null,
  drawerOpen: false,

  // ReactFlow handlers
  onNodesChange: (changes) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    });
  },

  // Basic setters
  setNodes: (nodes) => {
    set({ nodes });
  },

  setEdges: (edges) => {
    set({ edges });
  },

  setSettings: (settings) => {
    set({ settings });
  },

  updateNodeState: (nodeId, state) => {
    const updatedNodes = get().nodes.map((n) =>
      n.id === nodeId ? { ...n, data: { ...n.data, state } } : n
    );
    
    // Recalculate all node states
    const recalculatedNodes = calculateNodesStates(updatedNodes);
    set({ nodes: recalculatedNodes });
  },

  setSelectedNode: (selectedNode) => {
    set({ selectedNode });
  },

  setDrawerOpen: (drawerOpen) => {
    set({ drawerOpen });
  },

  // Bulk operations
  loadRoadmapData: (roadmapData, initialState) => {
    const nodesArr = Array.isArray(roadmapData?.nodes) ? roadmapData.nodes : [];
    const edgesArr = Array.isArray(roadmapData?.edges) ? roadmapData.edges : [];

    let rawNodes = nodesArr.map((n) => ({
      ...n,
      draggable: false,
      connectable: false,
      selectable: isInteractableNode(n),
      focusable: isInteractableNode(n),
      data: {
        ...n.data,
        state: initialState?.nodes?.[n.id]?.state || n.data?.state,
      },
    }));

    // Calculate node states
    rawNodes = calculateNodesStates(rawNodes);

    set({
      nodes: rawNodes,
      edges: edgesArr,
      settings: roadmapData?.settings || {},
    });
  },

  getRoadmapState: (viewport) => {
    const minimalState: RoadmapState = {
      nodes: {},
      x: viewport.x,
      y: viewport.y,
      zoom: viewport.zoom,
    };
    
    get().nodes.forEach((n) => {
      if (n.data.state && n.type === 'task') {
        minimalState.nodes[n.id] = { state: n.data.state };
      }
    });
    
    return minimalState;
  },

  updateNodesStates: () => {
    const updatedNodes = calculateNodesStates(get().nodes);
    set({ nodes: updatedNodes });
  },
}));
