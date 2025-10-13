import { useEffect } from "react";
import { Edge } from "@xyflow/react";
import { useEditorStore } from "./editorStore";

export const DebugModeEdges = () => {
  const nodes = useEditorStore(state => state.nodes);
  const debugMode = useEditorStore(state => state.debugMode);
  const showCompletionNeeds = useEditorStore(state => state.showCompletionNeeds);
  const showCompletionOptional = useEditorStore(state => state.showCompletionOptional);
  const showUnlockAfter = useEditorStore(state => state.showUnlockAfter);
  const setEdges = useEditorStore(state => state.setEdges);

  useEffect(() => {
    // Filter out existing debug edges, but use the store's edges directly to avoid dependency loop
    const baseEdges = useEditorStore.getState().edges.filter((e) => !e.id.startsWith("debug-"));
    const newEdges: Edge[] = [...baseEdges];
    
    if (debugMode) {
      nodes.forEach((node) => {
        if (showCompletionNeeds && node.type === "topic" && node.data?.completion?.needs) {
          node.data.completion.needs.forEach((needId: string) => {
            const edgeId = `debug-edge-${needId}-to-${node.id}`;
            newEdges.push({
              id: edgeId,
              target: needId,
              source: node.id,
              animated: true,
              style: { stroke: "#f97316", strokeWidth: 2, strokeDasharray: "5,5" },
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
              style: { stroke: "#eab308", strokeWidth: 2, strokeDasharray: "5,5" },
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
              style: { stroke: "#10b981", strokeWidth: 2, strokeDasharray: "5,5" },
              type: "floating",
            });
          });
        }
      });
    }
    setEdges(newEdges);
  }, [nodes, debugMode, showCompletionNeeds, showCompletionOptional, showUnlockAfter, setEdges]);

  return null;
};
