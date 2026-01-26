import { create } from 'zustand';
import { Node, Edge, applyNodeChanges, NodeChange } from '@xyflow/react';
import { NodeData, RoadmapData, RoadmapState, Settings } from './types';
import { getTranslations, detectBrowserLanguage, Translations } from './translations';

// Note: This is a global store. If you need multiple independent LearningMap instances
// on the same page, consider creating store instances per component or using context.
export interface ViewerState {
  // Core data
  nodes: Node<NodeData>[];
  edges: Edge[];
  settings: Settings;
  
  // Default language (from prop or browser detection)
  defaultLanguage?: string;
  
  // UI state
  selectedNode: Node<NodeData> | null;
  drawerOpen: boolean;
  
  // Actions
  onNodesChange: (changes: NodeChange<Node<NodeData>>[]) => void;
  setNodes: (nodes: Node<NodeData>[]) => void;
  setEdges: (edges: Edge[]) => void;
  setSettings: (settings: Settings) => void;
  setDefaultLanguage: (defaultLanguage: string) => void;
  updateNodeState: (nodeId: string, state: string) => void;
  setSelectedNode: (node: Node<NodeData> | null) => void;
  setDrawerOpen: (drawerOpen: boolean) => void;
  
  // Bulk operations
  loadRoadmapData: (roadmapData: RoadmapData, initialState?: RoadmapState) => void;
  getRoadmapState: (viewport: { x: number; y: number; zoom: number }) => RoadmapState;
  updateNodesStates: () => void;

  // Computed getters
  getLanguage: () => string;
  getTranslations: () => Translations;
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
      
      // Check unlock conditions - ALL conditions must be met to unlock
      const hasUnlockAfter = Boolean(node.data?.unlock?.after);
      const hasUnlockDate = Boolean(node.data?.unlock?.date);
      
      if (hasUnlockAfter || hasUnlockDate) {
        // Check if all unlock conditions are satisfied
        let shouldUnlock = true;
        
        if (hasUnlockAfter) {
          const afterMet = node.data.unlock.after.every((depId: string) =>
            isCompleteState(stateMap[depId])
          );
          shouldUnlock = shouldUnlock && afterMet;
        }
        
        if (hasUnlockDate) {
          const unlockDate = new Date(node.data.unlock.date);
          const now = new Date();
          const dateMet = now >= unlockDate;
          shouldUnlock = shouldUnlock && dateMet;
        }
        
        if (shouldUnlock) {
          if (node.data.state === 'locked') {
            node.data.state = 'unlocked';
          }
        } else {
          if (!isCompleteState(node.data.state)) {
            node.data.state = 'locked';
          }
        }
      } else {
        // No unlock conditions - node is unlocked by default
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

  setDefaultLanguage: (defaultLanguage) => {
    set({ defaultLanguage });
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

  getLanguage: () => {
    const state = get();
    const settingsLang = state.settings?.language;
    if (settingsLang && settingsLang !== "auto") {
      return settingsLang;
    }
    if (state.defaultLanguage) {
      return state.defaultLanguage;
    }
    return detectBrowserLanguage();
  },

  getTranslations: () => {
    return getTranslations(get().getLanguage());
  },
}));
