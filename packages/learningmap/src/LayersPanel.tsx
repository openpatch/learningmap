import React from "react";
import { Node, Panel, useReactFlow } from "@xyflow/react";
import {
  X,
  Lock,
  Unlock,
  Image as ImageIcon,
  Type,
  CircleCheck,
  Circle,
  ArrowUpToLine,
  ArrowDownToLine,
  ArrowUp,
  ArrowDown,
  Crosshair,
} from "lucide-react";
import { useEditorStore } from "./editorStore";
import { NodeData } from "./types";
import { getEffectiveZIndex } from "./zIndexHelper";
import { Translations } from "./translations";

const TYPE_ICONS: Record<string, React.ComponentType<{ size?: number }>> = {
  task: CircleCheck,
  topic: Circle,
  image: ImageIcon,
  text: Type,
};

/**
 * Display name for a node. Only task and topic nodes carry a label, so image
 * and text nodes fall back to their own content.
 */
export function getNodeDisplayName(
  node: Node<NodeData>,
  t: Translations,
): string {
  if (node.type === "image") {
    return node.data?.caption || t.image;
  }
  if (node.type === "text") {
    return node.data?.text || t.text;
  }
  return node.data?.label || t.untitled;
}

export const LayersPanel: React.FC = () => {
  const isOpen = useEditorStore((state) => state.layersPanelOpen);
  const nodes = useEditorStore((state) => state.nodes);
  const selectedNodeId = useEditorStore((state) => state.selectedNodeId);
  const selectedNodeIds = useEditorStore((state) => state.selectedNodeIds);

  const setLayersPanelOpen = useEditorStore((state) => state.setLayersPanelOpen);
  const selectNode = useEditorStore((state) => state.selectNode);
  const setNodeLocked = useEditorStore((state) => state.setNodeLocked);
  const reorderNodes = useEditorStore((state) => state.reorderNodes);
  const t = useEditorStore((state) => state.getTranslations)();

  const { fitView } = useReactFlow();

  if (!isOpen) return null;

  // Top-most first, matching how the nodes are stacked on the canvas.
  const ordered = [...nodes].sort(
    (a, b) => getEffectiveZIndex(b) - getEffectiveZIndex(a),
  );

  const isActive = (nodeId: string) =>
    nodeId === selectedNodeId || selectedNodeIds.includes(nodeId);

  const activeIds = () => {
    if (selectedNodeIds.length > 0) return selectedNodeIds;
    return selectedNodeId ? [selectedNodeId] : [];
  };

  const onReorder = (operation: Parameters<typeof reorderNodes>[1]) => {
    const ids = activeIds();
    if (ids.length > 0) {
      reorderNodes(ids, operation);
    }
  };

  const onRevealNode = (node: Node<NodeData>) => {
    selectNode(node.id, true);
    fitView({ nodes: [{ id: node.id }], duration: 300, maxZoom: 1.5 });
  };

  const hasSelection = activeIds().length > 0;

  return (
    <Panel position="top-left" className="layers-panel">
      <div className="layers-panel-header">
        <h2 className="layers-panel-title">{t.layers}</h2>
        <button
          onClick={() => setLayersPanelOpen(false)}
          className="close-button"
          aria-label={t.close}
        >
          <X size={18} />
        </button>
      </div>

      <div className="layers-panel-actions">
        <button
          title={t.bringToFront}
          disabled={!hasSelection}
          onClick={() => onReorder("front")}
        >
          <ArrowUpToLine size={16} />
        </button>
        <button
          title={t.bringForward}
          disabled={!hasSelection}
          onClick={() => onReorder("forward")}
        >
          <ArrowUp size={16} />
        </button>
        <button
          title={t.sendBackward}
          disabled={!hasSelection}
          onClick={() => onReorder("backward")}
        >
          <ArrowDown size={16} />
        </button>
        <button
          title={t.sendToBack}
          disabled={!hasSelection}
          onClick={() => onReorder("back")}
        >
          <ArrowDownToLine size={16} />
        </button>
      </div>

      {ordered.length === 0 ? (
        <p className="layers-panel-empty">{t.layersEmpty}</p>
      ) : (
        <ul className="layers-list">
          {ordered.map((node) => {
            const Icon = TYPE_ICONS[node.type || "task"] || Circle;
            const locked = Boolean(node.data?.locked);
            return (
              <li
                key={node.id}
                className={`layers-list-item ${isActive(node.id) ? "active" : ""} ${locked ? "locked" : ""}`}
              >
                <button
                  className="layers-list-select"
                  onClick={() => selectNode(node.id, true)}
                  title={getNodeDisplayName(node, t)}
                >
                  <Icon size={14} />
                  <span className="layers-list-label">
                    {getNodeDisplayName(node, t)}
                  </span>
                </button>
                <button
                  className="layers-list-action"
                  title={t.zoomToNode}
                  aria-label={t.zoomToNode}
                  onClick={() => onRevealNode(node)}
                >
                  <Crosshair size={14} />
                </button>
                <button
                  className="layers-list-action"
                  title={locked ? t.unlockNode : t.lockNode}
                  aria-label={locked ? t.unlockNode : t.lockNode}
                  aria-pressed={locked}
                  onClick={() => setNodeLocked(node.id, !locked)}
                >
                  {locked ? <Lock size={14} /> : <Unlock size={14} />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </Panel>
  );
};
