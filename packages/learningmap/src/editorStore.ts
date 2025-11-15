import { create } from "zustand";
import { persist } from "zustand/middleware";
import { temporal } from "zundo";
import { useStoreWithEqualityFn } from "zustand/traditional";
import isDeepEqual from "fast-deep-equal";
import { throttle } from "throttle-debounce";
import type { TemporalState } from "zundo";
import {
  Node,
  Edge,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  NodeChange,
  EdgeChange,
  Connection,
} from "@xyflow/react";
import { NodeData, RoadmapData, Settings } from "./types";
import { getZIndexForNodeType } from "./zIndexHelper";

// Note: This is a global store for the editor. Typically only one editor instance is active at a time.
// If you need multiple independent editor instances, consider creating store instances per component or using context.
export interface EditorState {
  // Core data
  nodes: Node<NodeData>[];
  edges: Edge[];
  settings: Settings;

  jsonStore?: string;
  defaultLanguage?: string;

  // UI state
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
  updateDebugEdges: () => void;
  deleteNode: (nodeId: string) => void;
  deleteEdge: (edgeId: string) => void;
  addNode: (node: Node<NodeData>) => void;

  setJsonStore: (jsonStore: string) => void;
  setDefaultLanguage: (defaultLanguage: string) => void;

  // UI state setters
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
  setClipboard: (
    clipboard: { nodes: Node<NodeData>[]; edges: Edge[] } | null,
  ) => void;
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
  persist(
    temporal(
      (set, get) => ({
        ...initialState,

        // ReactFlow handlers
        onNodesChange: (changes) => {
          set({
            nodes: applyNodeChanges(changes, get().nodes),
          });
        },

        onEdgesChange: (changes) => {
          set({
            edges: applyEdgeChanges(changes, get().edges),
          });
        },

        onConnect: (connection) => {
          set({
            edges: addEdge(connection, get().edges),
          });
        },

        // Node operations
        setNodes: (nodes) => {
          set({ nodes });
        },

        setEdges: (edges) => {
          set({ edges });
        },

        setSettings: (settings) => {
          set({ settings });
        },

        updateDebugEdges: () => {
          const debugMode = get().debugMode;
          const nodes = get().nodes;
          const showCompletionNeeds = get().showCompletionNeeds;
          const showCompletionOptional = get().showCompletionOptional;
          const showUnlockAfter = get().showUnlockAfter;
          // Filter out existing debug edges
          const baseEdges = get().edges.filter(
            (e) => !e.id.startsWith("debug-"),
          );
          const newEdges: Edge[] = [...baseEdges];

          if (debugMode) {
            nodes.forEach((node) => {
              if (
                showCompletionNeeds &&
                node.type === "topic" &&
                node.data?.completion?.needs
              ) {
                node.data.completion.needs.forEach((needId: string) => {
                  const edgeId = `debug-edge-${needId}-to-${node.id}`;
                  newEdges.push({
                    id: edgeId,
                    target: needId,
                    source: node.id,
                    animated: true,
                    style: {
                      stroke: "#f97316",
                      strokeWidth: 2,
                      strokeDasharray: "5,5",
                    },
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
                    style: {
                      stroke: "#eab308",
                      strokeWidth: 2,
                      strokeDasharray: "5,5",
                    },
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
                    style: {
                      stroke: "#10b981",
                      strokeWidth: 2,
                      strokeDasharray: "5,5",
                    },
                    type: "floating",
                  });
                });
              }
            });
          }
          set({ edges: newEdges });
        },

        updateNode: (nodeId, updates) => {
          set({
            nodes: get().nodes.map((n) =>
              n.id === nodeId ? { ...n, ...updates } : n,
            ),
          });
        },

        updateNodeData: (nodeId, dataUpdates) => {
          set({
            nodes: get().nodes.map((n) =>
              n.id === nodeId
                ? { ...n, data: { ...n.data, ...dataUpdates } }
                : n,
            ),
          });
        },

        updateNodes: (updates) => {
          set({
            nodes: get().nodes.map((n) => {
              const updated = updates.find((un) => un.id === n.id);
              return updated ? updated : n;
            }),
          });
        },

        updateEdge: (edgeId, updates) => {
          set({
            edges: get().edges.map((e) =>
              e.id === edgeId ? { ...e, ...updates } : e,
            ),
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
            edges: get().edges.filter(
              (e) => e.source !== nodeId && e.target !== nodeId,
            ),
          });
        },

        deleteEdge: (edgeId) => {
          set({
            edges: get().edges.filter((e) => e.id !== edgeId),
          });
        },

        addNode: (node) => {
          set({
            nodes: [...get().nodes, node],
          });
        },

        setJsonStore: (jsonStore) => {
          set({ jsonStore });
        },

        setDefaultLanguage: (defaultLanguage) => {
          set({ defaultLanguage });
        },

        // UI state setters
        setPreviewMode: (previewMode) => set({ previewMode }),
        setDebugMode: (debugMode) => {
          set({ debugMode });
          get().updateDebugEdges();
        },
        setShowGrid: (showGrid) => set({ showGrid }),
        setHelpOpen: (helpOpen) => set({ helpOpen }),
        setDrawerOpen: (drawerOpen) => set({ drawerOpen }),
        setSettingsDrawerOpen: (settingsDrawerOpen) =>
          set({ settingsDrawerOpen }),
        setEdgeDrawerOpen: (edgeDrawerOpen) => set({ edgeDrawerOpen }),
        setShareDialogOpen: (shareDialogOpen) => set({ shareDialogOpen }),
        setLoadExternalDialogOpen: (loadExternalDialogOpen) =>
          set({ loadExternalDialogOpen }),
        setSelectedNodeId: (selectedNodeId) =>
          set({
            selectedNodeId,
          }),
        setSelectedNodeIds: (selectedNodeIds) =>
          set({
            selectedNodeIds,
          }),
        setSelectedEdge: (selectedEdge) => set({ selectedEdge }),
        setNextNodeId: (nextNodeId) => set({ nextNodeId }),
        setClipboard: (clipboard) => set({ clipboard }),
        setLastMousePosition: (lastMousePosition) => set({ lastMousePosition }),
        setShareLink: (shareLink) => set({ shareLink }),
        setPendingExternalId: (pendingExternalId) => set({ pendingExternalId }),
        setShowCompletionNeeds: (showCompletionNeeds) => {
          set({ showCompletionNeeds });
          get().updateDebugEdges();
        },
        setShowCompletionOptional: (showCompletionOptional) => {
          set({ showCompletionOptional });
          get().updateDebugEdges();
        },
        setShowUnlockAfter: (showUnlockAfter) => {
          set({ showUnlockAfter });
          get().updateDebugEdges();
        },

        // Bulk operations
        loadRoadmapData: (roadmapData) => {
          const nodesArr = Array.isArray(roadmapData?.nodes)
            ? roadmapData.nodes
            : [];
          const edgesArr = Array.isArray(roadmapData?.edges)
            ? roadmapData.edges
            : [];

          const rawNodes = nodesArr.map((n) => ({
            ...n,
            draggable: true,
            className: n.data.color ? n.data.color : n.className,
            // Ensure zIndex is set based on node type if not already present
            zIndex:
              n.zIndex !== undefined ? n.zIndex : getZIndexForNodeType(n.type),
            data: { ...n.data },
          }));

          // Calculate next node ID
          let nextNodeId = 1;
          if (nodesArr.length > 0) {
            const maxId = Math.max(
              ...nodesArr
                .map((n) => parseInt(n.id.replace(/\D/g, ""), 10))
                .filter((id) => !isNaN(id)),
            );
            nextNodeId = maxId + 1;
          }

          set({
            nodes: rawNodes,
            edges: edgesArr,
            settings: roadmapData?.settings || {
              background: { color: "#ffffff" },
            },
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
              zIndex:
                n.zIndex !== undefined
                  ? n.zIndex
                  : getZIndexForNodeType(n.type),
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
            type: "learningmap",
            source: "https://learningmap.app",
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
        // Temporal middleware options - throttle undo history to improve drag performance
        equality: (oldState, newState) => isDeepEqual(oldState, newState),
        handleSet: (handleSet) =>
          throttle<typeof handleSet>(
            500,
            (state) => {
              handleSet(state);
            },
            { noLeading: false, noTrailing: true },
          ),
        partialize: (state): any => {
          const { nodes, edges, settings } = state;
          return { nodes, edges, settings };
        },
      },
    ),
    {
      name: "learningmap-data", // name of the item in storage
      version: 1,
      partialize: (state) => {
        const { nodes, edges, settings } = state;
        return { nodes, edges, settings };
      },
    },
  ),
);

type PartialEditorState = Pick<EditorState, "nodes" | "edges" | "settings">;

// Hook for accessing temporal store (undo/redo)
export function useTemporalStore<T>(
  selector?: (state: TemporalState<PartialEditorState>) => T,
  equality?: (a: T, b: T) => boolean,
) {
  return useStoreWithEqualityFn(useEditorStore.temporal, selector!, equality);
}
