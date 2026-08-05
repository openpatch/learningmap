import React from "react";
import {
  ArrowUpToLine,
  ArrowDownToLine,
  ArrowUp,
  ArrowDown,
  Lock,
  Unlock,
} from "lucide-react";
import { useEditorStore } from "./editorStore";

interface LayerControlsProps {
  nodeIds: string[];
  /** Renders as a compact icon row without labels. */
  compact?: boolean;
}

/**
 * Stacking order and lock controls, shared by the single node editor panel and
 * the multi selection panel.
 */
export const LayerControls: React.FC<LayerControlsProps> = ({
  nodeIds,
  compact = false,
}) => {
  const nodes = useEditorStore((state) => state.nodes);
  const reorderNodes = useEditorStore((state) => state.reorderNodes);
  const setNodesLocked = useEditorStore((state) => state.setNodesLocked);
  const t = useEditorStore((state) => state.getTranslations)();

  if (nodeIds.length === 0) return null;

  const selected = nodes.filter((n) => nodeIds.includes(n.id));
  const allLocked =
    selected.length > 0 && selected.every((n) => Boolean(n.data?.locked));

  const buttons = [
    { title: t.bringToFront, icon: ArrowUpToLine, op: "front" as const },
    { title: t.bringForward, icon: ArrowUp, op: "forward" as const },
    { title: t.sendBackward, icon: ArrowDown, op: "backward" as const },
    { title: t.sendToBack, icon: ArrowDownToLine, op: "back" as const },
  ];

  const LockIcon = allLocked ? Lock : Unlock;
  const lockTitle = allLocked ? t.unlockNode : t.lockNode;

  return (
    <div className={`layer-controls ${compact ? "compact" : ""}`}>
      {buttons.map(({ title, icon: Icon, op }) => (
        <button
          key={op}
          title={title}
          aria-label={title}
          onClick={() => reorderNodes(nodeIds, op)}
        >
          <Icon size={16} />
          {!compact && <span>{title}</span>}
        </button>
      ))}
      <button
        title={lockTitle}
        aria-label={lockTitle}
        aria-pressed={allLocked}
        className={allLocked ? "active" : ""}
        onClick={() => setNodesLocked(nodeIds, !allLocked)}
      >
        <LockIcon size={16} />
        {!compact && <span>{lockTitle}</span>}
      </button>
    </div>
  );
};
