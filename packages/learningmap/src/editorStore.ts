import { create } from 'zustand';
import { temporal } from 'zundo';
import { Node, Edge, applyNodeChanges, applyEdgeChanges, addEdge, NodeChange, EdgeChange, Connection } from '@xyflow/react';
import { NodeData, RoadmapData, Settings, ImageNodeData, TextNodeData } from './types';

export interface EditorState {
  // Core data
  nodes: Node<NodeData>[];
  edges: Edge[];
  settings: Settings;
  
  // UI state
  saved: boolean;
  previewMode: boolean;
  debugMode: boolean;
  showGrid: boolean;
  helpOpen: boolean;
  drawerOpen: boolean;
  settingsDrawerOpen: boolean;
  edgeDrawerOpen: boolean;
  shareDialogOpen: boolean;
  loadExternalDialogOpen: boolean;
  
  // Selected items
  selectedNodeId: string | null;
  selectedNodeIds: string[];
  selectedEdge: Edge | null;
  
  // Other state
  nextNodeId: number;
  clipboard: { nodes: Node<NodeData>[]; edges: Edge[] } | null;
  lastMousePosition: { x: number; y: number } | null;
  shareLink: string;
  pendingExternalId: string | null;
  
  // Debug settings
  showCompletionNeeds: boolean;
  showCompletionOptional: boolean;
  showUnlockAfter: boolean;
  
  // Actions
  onNodesChange: (changes: NodeChange<Node<NodeData>>[]) => void;
  onEdgesChange: (changes: EdgeChange<Edge>[]) => void;
  onConnect: (connection: Connection) => void;
  setNodes: (nodes: Node<NodeData>[]) => void;
  setEdges: (edges: Edge[]) => void;
  setSettings: (settings: Settings) => void;
  updateNode: (nodeId: string, updates: Partial<Node<NodeData>>) => void;
  updateNodeData: (nodeId: string, dataUpdates: Partial<NodeData>) => void;
  updateNodes: (updates: Node<NodeData>[]) => void;
  updateEdge: (edgeId: string, updates: Partial<Edge>) => void;
  deleteNode: (nodeId: string) => void;
  deleteEdge: (edgeId: string) => void;
  addNode: (node: Node<NodeData>) => void;
  
  // UI state setters
  setSaved: (saved: boolean) => void;
  setPreviewMode: (previewMode: boolean) => void;
  setDebugMode: (debugMode: boolean) => void;
  setShowGrid: (showGrid: boolean) => void;
  setHelpOpen: (helpOpen: boolean) => void;
  setDrawerOpen: (drawerOpen: boolean) => void;
  setSettingsDrawerOpen: (settingsDrawerOpen: boolean) => void;
  setEdgeDrawerOpen: (edgeDrawerOpen: boolean) => void;
  setShareDialogOpen: (shareDialogOpen: boolean) => void;
  setLoadExternalDialogOpen: (loadExternalDialogOpen: boolean) => void;
  setSelectedNodeId: (nodeId: string | null) => void;
  setSelectedNodeIds: (nodeIds: string[]) => void;
  setSelectedEdge: (edge: Edge | null) => void;
  setNextNodeId: (nextNodeId: number) => void;
  setClipboard: (clipboard: { nodes: Node<NodeData>[]; edges: Edge[] } | null) => void;
  setLastMousePosition: (position: { x: number; y: number } | null) => void;
  setShareLink: (shareLink: string) => void;
  setPendingExternalId: (pendingExternalId: string | null) => void;
  setShowCompletionNeeds: (showCompletionNeeds: boolean) => void;
  setShowCompletionOptional: (showCompletionOptional: boolean) => void;
  setShowUnlockAfter: (showUnlockAfter: boolean) => void;
  
  // Bulk operations
  loadRoadmapData: (roadmapData: RoadmapData) => void;
  getRoadmapData: () => RoadmapData;
  closeAllDrawers: () => void;
  reset: () => void;
}

const initialState = {
  nodes: [],
  edges: [],
  settings: { background: { color: "#ffffff" } },
  saved: true,
  previewMode: false,
  debugMode: false,
  showGrid: false,
  helpOpen: false,
  drawerOpen: false,
  settingsDrawerOpen: false,
  edgeDrawerOpen: false,
  shareDialogOpen: false,
  loadExternalDialogOpen: false,
  selectedNodeId: null,
  selectedNodeIds: [],
  selectedEdge: null,
  nextNodeId: 1,
  clipboard: null,
  lastMousePosition: null,
  shareLink: "",
  pendingExternalId: null,
  showCompletionNeeds: true,
  showCompletionOptional: true,
  showUnlockAfter: true,
};

export const useEditorStore = create<EditorState>()(
  temporal(
    (set, get) => ({
      ...initialState,

      // ReactFlow handlers
      onNodesChange: (changes) => {
        set({
          nodes: applyNodeChanges(changes, get().nodes),
          saved: false,
        });
      },

      onEdgesChange: (changes) => {
        set({
          edges: applyEdgeChanges(changes, get().edges),
          saved: false,
        });
      },

      onConnect: (connection) => {
        set({
          edges: addEdge(connection, get().edges),
          saved: false,
        });
      },

      // Node operations
      setNodes: (nodes) => {
        set({ nodes, saved: false });
      },

      setEdges: (edges) => {
        set({ edges, saved: false });
      },

      setSettings: (settings) => {
        set({ settings, saved: false });
      },

      updateNode: (nodeId, updates) => {
        set({
          nodes: get().nodes.map((n) =>
            n.id === nodeId ? { ...n, ...updates } : n
          ),
          saved: false,
        });
      },

      updateNodeData: (nodeId, dataUpdates) => {
        set({
          nodes: get().nodes.map((n) =>
            n.id === nodeId ? { ...n, data: { ...n.data, ...dataUpdates } } : n
          ),
          saved: false,
        });
      },

      updateNodes: (updates) => {
        set({
          nodes: get().nodes.map((n) => {
            const updated = updates.find((un) => un.id === n.id);
            return updated ? updated : n;
          }),
          saved: false,
        });
      },

      updateEdge: (edgeId, updates) => {
        set({
          edges: get().edges.map((e) =>
            e.id === edgeId ? { ...e, ...updates } : e
          ),
          saved: false,
        });
        // Update selected edge if it's the one being updated
        const selectedEdge = get().selectedEdge;
        if (selectedEdge && selectedEdge.id === edgeId) {
          set({ selectedEdge: { ...selectedEdge, ...updates } });
        }
      },

      deleteNode: (nodeId) => {
        set({
          nodes: get().nodes.filter((n) => n.id !== nodeId),
          edges: get().edges.filter((e) => e.source !== nodeId && e.target !== nodeId),
          saved: false,
        });
      },

      deleteEdge: (edgeId) => {
        set({
          edges: get().edges.filter((e) => e.id !== edgeId),
          saved: false,
        });
      },

      addNode: (node) => {
        set({
          nodes: [...get().nodes, node],
          saved: false,
        });
      },

      // UI state setters
      setSaved: (saved) => set({ saved }),
      setPreviewMode: (previewMode) => set({ previewMode }),
      setDebugMode: (debugMode) => set({ debugMode }),
      setShowGrid: (showGrid) => set({ showGrid }),
      setHelpOpen: (helpOpen) => set({ helpOpen }),
      setDrawerOpen: (drawerOpen) => set({ drawerOpen }),
      setSettingsDrawerOpen: (settingsDrawerOpen) => set({ settingsDrawerOpen }),
      setEdgeDrawerOpen: (edgeDrawerOpen) => set({ edgeDrawerOpen }),
      setShareDialogOpen: (shareDialogOpen) => set({ shareDialogOpen }),
      setLoadExternalDialogOpen: (loadExternalDialogOpen) => set({ loadExternalDialogOpen }),
      setSelectedNodeId: (selectedNodeId) => set({ selectedNodeId }),
      setSelectedNodeIds: (selectedNodeIds) => set({ selectedNodeIds }),
      setSelectedEdge: (selectedEdge) => set({ selectedEdge }),
      setNextNodeId: (nextNodeId) => set({ nextNodeId }),
      setClipboard: (clipboard) => set({ clipboard }),
      setLastMousePosition: (lastMousePosition) => set({ lastMousePosition }),
      setShareLink: (shareLink) => set({ shareLink }),
      setPendingExternalId: (pendingExternalId) => set({ pendingExternalId }),
      setShowCompletionNeeds: (showCompletionNeeds) => set({ showCompletionNeeds }),
      setShowCompletionOptional: (showCompletionOptional) => set({ showCompletionOptional }),
      setShowUnlockAfter: (showUnlockAfter) => set({ showUnlockAfter }),

      // Bulk operations
      loadRoadmapData: (roadmapData) => {
        const nodesArr = Array.isArray(roadmapData?.nodes) ? roadmapData.nodes : [];
        const edgesArr = Array.isArray(roadmapData?.edges) ? roadmapData.edges : [];

        const rawNodes = nodesArr.map((n) => ({
          ...n,
          draggable: true,
          className: n.data.color ? n.data.color : n.className,
          data: { ...n.data },
        }));

        // Calculate next node ID
        let nextNodeId = 1;
        if (nodesArr.length > 0) {
          const maxId = Math.max(
            ...nodesArr
              .map((n) => parseInt(n.id.replace(/\D/g, ""), 10))
              .filter((id) => !isNaN(id))
          );
          nextNodeId = maxId + 1;
        }

        set({
          nodes: rawNodes,
          edges: edgesArr,
          settings: roadmapData?.settings || { background: { color: "#ffffff" } },
          nextNodeId,
        });
      },

      getRoadmapData: () => {
        const state = get();
        return {
          nodes: state.nodes.map((n) => ({
            id: n.id,
            type: n.type,
            position: n.position,
            width: n.width,
            height: n.height,
            zIndex: n.zIndex,
            data: n.data,
          })),
          edges: state.edges
            .filter((e) => !e.id.startsWith("debug-"))
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
          settings: state.settings,
          version: 1,
        };
      },

      closeAllDrawers: () => {
        set({
          drawerOpen: false,
          selectedNodeId: null,
          edgeDrawerOpen: false,
          selectedEdge: null,
          settingsDrawerOpen: false,
        });
      },

      reset: () => {
        set(initialState);
      },
    }),
    {
      // Zundo options
      limit: 100,
      equality: (a, b) => a === b,
    }
  )
);

// Temporal store selector for accessing undo/redo state
export const useTemporalStore = useEditorStore.temporal;
