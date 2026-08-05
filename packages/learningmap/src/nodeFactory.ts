import { Node, XYPosition } from "@xyflow/react";
import { NodeData } from "./types";
import { getZIndexForNewNode } from "./zIndexHelper";
import { Translations } from "./translations";

export type CreatableNodeType = "task" | "topic" | "image" | "text";

/** Initial size for nodes that would otherwise render as a tiny empty box. */
const INITIAL_SIZE: Partial<
  Record<CreatableNodeType, { width: number; height: number }>
> = {
  image: { width: 220, height: 160 },
};

/** Distance at which a new node is considered to overlap an existing one. */
const OCCUPIED_THRESHOLD = 24;
const CASCADE_OFFSET = 28;
const MAX_CASCADE_STEPS = 40;

type ScreenToFlowPosition = (position: XYPosition) => XYPosition;

/**
 * Center of the visible canvas in flow coordinates.
 *
 * Uses the canvas element instead of the window so the toolbar is accounted
 * for, and shrinks the usable area by an open side panel so new nodes never
 * land underneath it.
 */
export function getCanvasCenterPosition(
  screenToFlowPosition: ScreenToFlowPosition,
): XYPosition {
  if (typeof document === "undefined") {
    return screenToFlowPosition({ x: 0, y: 0 });
  }

  const canvas = document.querySelector(".editor-canvas");
  const rect = canvas?.getBoundingClientRect();

  const left = rect?.left ?? 0;
  const top = rect?.top ?? 0;
  let width = rect?.width ?? window.innerWidth;
  const height = rect?.height ?? window.innerHeight;

  // The editor panel is docked to the right edge and covers the canvas.
  const panel = document.querySelector(".editor-panel");
  if (panel) {
    const panelWidth = panel.getBoundingClientRect().width;
    width = Math.max(width - panelWidth, width / 3);
  }

  return screenToFlowPosition({ x: left + width / 2, y: top + height / 2 });
}

/**
 * Nudges `position` diagonally until it no longer sits on top of an existing
 * node, so consecutively added nodes cascade instead of hiding each other.
 */
export function findFreePosition(
  nodes: Node<NodeData>[],
  position: XYPosition,
): XYPosition {
  let candidate = { ...position };

  for (let step = 0; step < MAX_CASCADE_STEPS; step++) {
    const occupied = nodes.some(
      (node) =>
        Math.abs(node.position.x - candidate.x) < OCCUPIED_THRESHOLD &&
        Math.abs(node.position.y - candidate.y) < OCCUPIED_THRESHOLD,
    );
    if (!occupied) break;
    candidate = {
      x: candidate.x + CASCADE_OFFSET,
      y: candidate.y + CASCADE_OFFSET,
    };
  }

  return candidate;
}

export interface CreateNodeOptions {
  type: CreatableNodeType;
  nodes: Node<NodeData>[];
  t: Translations;
  /** Flow position to place the node at. Defaults to the canvas center. */
  position?: XYPosition | null;
  screenToFlowPosition: ScreenToFlowPosition;
}

/**
 * Single source of truth for new nodes, shared by the toolbar, the keyboard
 * shortcuts and the welcome screen so they cannot drift apart.
 */
export function createNode({
  type,
  nodes,
  t,
  position,
  screenToFlowPosition,
}: CreateNodeOptions): Node<NodeData> {
  const basePosition = position ?? getCanvasCenterPosition(screenToFlowPosition);
  const size = INITIAL_SIZE[type];

  // Only task and topic nodes render a label; image and text nodes carry their
  // own content fields and would otherwise store an unused placeholder string.
  const data: NodeData =
    type === "task"
      ? { label: t.newTask, state: "unlocked" }
      : type === "topic"
        ? { label: t.newTopic, state: "unlocked" }
        : ({ state: "unlocked" } as NodeData);

  return {
    id: `node-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    type,
    position: findFreePosition(nodes, basePosition),
    zIndex: getZIndexForNewNode(nodes, type),
    draggable: true,
    ...(size ?? {}),
    data,
  };
}
