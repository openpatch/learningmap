import { Node } from "@xyflow/react";
import { NodeData } from "./types";

// zIndex constants for different node types
// Ordering: Bottom -> Image (10) -> Text (20) -> Topic/Task (30) -> Top
//
// These values are only the *initial* stacking order for a freshly created
// node. As soon as the user reorders layers explicitly, every node gets its
// own zIndex and the type based defaults no longer apply.

export function getZIndexForNodeType(type?: string): number {
  switch (type) {
    case "image":
      return 10;
    case "text":
      return 20;
    case "topic":
    case "task":
      return 30;
    default:
      return 30; // Default to task/topic level
  }
}

/** The stacking value a node is actually rendered with. */
export function getEffectiveZIndex(node: Node<any>): number {
  return node.zIndex !== undefined
    ? node.zIndex
    : getZIndexForNodeType(node.type);
}

/**
 * Stacking value for a node that is about to be added to `nodes`.
 *
 * New nodes are placed where their type is expected to live relative to the
 * nodes that already exist, instead of at a fixed value that may collide with
 * an explicit order the user has set up:
 * - images go behind everything
 * - text goes behind the topic/task nodes, but in front of the images
 * - topic/task nodes go in front of everything
 */
export function getZIndexForNewNode(
  nodes: Node<NodeData>[],
  type?: string,
): number {
  if (nodes.length === 0) {
    return getZIndexForNodeType(type);
  }

  const zIndexes = nodes.map(getEffectiveZIndex);

  if (type === "image") {
    return Math.min(...zIndexes) - 1;
  }

  if (type === "text") {
    const contentZIndexes = nodes
      .filter((n) => n.type === "topic" || n.type === "task")
      .map(getEffectiveZIndex);
    return contentZIndexes.length > 0
      ? Math.min(...contentZIndexes) - 1
      : Math.max(...zIndexes) + 1;
  }

  return Math.max(...zIndexes) + 1;
}

export type LayerOperation = "front" | "back" | "forward" | "backward";

/**
 * Reorders `nodeIds` within the stacking order of `nodes` and returns every
 * node with a normalized, explicit zIndex.
 *
 * Normalizing the whole stack keeps the order unambiguous: without it, nodes
 * sharing a type default all have the same zIndex and cannot be told apart.
 */
export function reorderNodes(
  nodes: Node<NodeData>[],
  nodeIds: string[],
  operation: LayerOperation,
): Node<NodeData>[] {
  const selected = new Set(nodeIds);
  if (selected.size === 0 || nodes.length === 0) {
    return nodes;
  }

  // Sort bottom -> top, using the array order to break ties so the result is
  // stable and matches what is rendered.
  const stack = nodes
    .map((node, index) => ({ node, index }))
    .sort(
      (a, b) =>
        getEffectiveZIndex(a.node) - getEffectiveZIndex(b.node) ||
        a.index - b.index,
    )
    .map(({ node }) => node);

  let reordered: Node<NodeData>[];

  switch (operation) {
    case "front":
      reordered = [
        ...stack.filter((n) => !selected.has(n.id)),
        ...stack.filter((n) => selected.has(n.id)),
      ];
      break;
    case "back":
      reordered = [
        ...stack.filter((n) => selected.has(n.id)),
        ...stack.filter((n) => !selected.has(n.id)),
      ];
      break;
    case "forward":
      reordered = [...stack];
      // Walk downwards so a node is never moved twice in one pass.
      for (let i = reordered.length - 2; i >= 0; i--) {
        if (selected.has(reordered[i].id) && !selected.has(reordered[i + 1].id)) {
          [reordered[i], reordered[i + 1]] = [reordered[i + 1], reordered[i]];
        }
      }
      break;
    case "backward":
      reordered = [...stack];
      for (let i = 1; i < reordered.length; i++) {
        if (selected.has(reordered[i].id) && !selected.has(reordered[i - 1].id)) {
          [reordered[i], reordered[i - 1]] = [reordered[i - 1], reordered[i]];
        }
      }
      break;
  }

  const zIndexById = new Map(
    reordered.map((node, index) => [node.id, index + 1]),
  );

  // Keep the original array order so React does not remount every node.
  return nodes.map((node) => {
    const zIndex = zIndexById.get(node.id);
    return zIndex !== undefined && zIndex !== node.zIndex
      ? { ...node, zIndex }
      : node;
  });
}

/** Nodes under `point` (flow coordinates), sorted top-most first. */
export function getNodesAtPosition(
  nodes: Node<NodeData>[],
  point: { x: number; y: number },
): Node<NodeData>[] {
  return nodes
    .filter((node) => {
      const width = node.measured?.width ?? node.width ?? 0;
      const height = node.measured?.height ?? node.height ?? 0;
      if (width === 0 || height === 0) return false;
      return (
        point.x >= node.position.x &&
        point.x <= node.position.x + width &&
        point.y >= node.position.y &&
        point.y <= node.position.y + height
      );
    })
    .sort((a, b) => getEffectiveZIndex(b) - getEffectiveZIndex(a));
}
