import { describe, it, expect } from "vitest";
import { Node } from "@xyflow/react";
import {
  getZIndexForNodeType,
  getEffectiveZIndex,
  getZIndexForNewNode,
  reorderNodes,
  getNodesAtPosition,
} from "./zIndexHelper";
import { NodeData } from "./types";

const makeNode = (
  id: string,
  type: string,
  overrides: Partial<Node<NodeData>> = {},
): Node<NodeData> =>
  ({
    id,
    type,
    position: { x: 0, y: 0 },
    data: { label: id, state: "unlocked" },
    ...overrides,
  }) as Node<NodeData>;

const zIndexOf = (nodes: Node<NodeData>[], id: string) =>
  nodes.find((n) => n.id === id)!.zIndex;

/** Node ids from bottom to top. */
const stackOrder = (nodes: Node<NodeData>[]) =>
  [...nodes]
    .sort((a, b) => getEffectiveZIndex(a) - getEffectiveZIndex(b))
    .map((n) => n.id);

describe("getEffectiveZIndex", () => {
  it("falls back to the type default when no zIndex is set", () => {
    expect(getEffectiveZIndex(makeNode("a", "image"))).toBe(
      getZIndexForNodeType("image"),
    );
  });

  it("prefers an explicit zIndex", () => {
    expect(getEffectiveZIndex(makeNode("a", "image", { zIndex: 99 }))).toBe(99);
  });
});

describe("getZIndexForNewNode", () => {
  it("uses the type default on an empty map", () => {
    expect(getZIndexForNewNode([], "text")).toBe(getZIndexForNodeType("text"));
  });

  it("puts images behind everything", () => {
    const nodes = [
      makeNode("a", "task", { zIndex: 5 }),
      makeNode("b", "image", { zIndex: 2 }),
    ];
    expect(getZIndexForNewNode(nodes, "image")).toBe(1);
  });

  it("puts text behind the topic and task nodes", () => {
    const nodes = [
      makeNode("a", "task", { zIndex: 7 }),
      makeNode("b", "topic", { zIndex: 9 }),
      makeNode("c", "image", { zIndex: 1 }),
    ];
    expect(getZIndexForNewNode(nodes, "text")).toBe(6);
  });

  it("puts text on top when there is no content node", () => {
    const nodes = [makeNode("a", "image", { zIndex: 4 })];
    expect(getZIndexForNewNode(nodes, "text")).toBe(5);
  });

  it("puts topic and task nodes in front of everything", () => {
    const nodes = [
      makeNode("a", "image", { zIndex: 1 }),
      makeNode("b", "task", { zIndex: 12 }),
    ];
    expect(getZIndexForNewNode(nodes, "topic")).toBe(13);
  });
});

describe("reorderNodes", () => {
  const nodes = [
    makeNode("bottom", "image", { zIndex: 1 }),
    makeNode("middle", "text", { zIndex: 2 }),
    makeNode("top", "task", { zIndex: 3 }),
  ];

  it("brings a node to the front", () => {
    expect(stackOrder(reorderNodes(nodes, ["bottom"], "front"))).toEqual([
      "middle",
      "top",
      "bottom",
    ]);
  });

  it("sends a node to the back", () => {
    expect(stackOrder(reorderNodes(nodes, ["top"], "back"))).toEqual([
      "top",
      "bottom",
      "middle",
    ]);
  });

  it("moves a node one step forward", () => {
    expect(stackOrder(reorderNodes(nodes, ["bottom"], "forward"))).toEqual([
      "middle",
      "bottom",
      "top",
    ]);
  });

  it("moves a node one step backward", () => {
    expect(stackOrder(reorderNodes(nodes, ["top"], "backward"))).toEqual([
      "bottom",
      "top",
      "middle",
    ]);
  });

  it("keeps the top node in place when moving it forward", () => {
    expect(stackOrder(reorderNodes(nodes, ["top"], "forward"))).toEqual([
      "bottom",
      "middle",
      "top",
    ]);
  });

  it("keeps a multi selection together", () => {
    const result = reorderNodes(nodes, ["bottom", "middle"], "front");
    expect(stackOrder(result)).toEqual(["top", "bottom", "middle"]);
  });

  it("assigns an explicit zIndex to every node", () => {
    const result = reorderNodes(
      [makeNode("a", "task"), makeNode("b", "task"), makeNode("c", "task")],
      ["c"],
      "back",
    );
    expect(result.every((n) => n.zIndex !== undefined)).toBe(true);
    expect(zIndexOf(result, "c")).toBe(1);
  });

  it("breaks ties on the type defaults using the array order", () => {
    // Both nodes default to the same zIndex, so the second one renders on top.
    const tied = [makeNode("first", "task"), makeNode("second", "task")];
    expect(stackOrder(reorderNodes(tied, ["first"], "forward"))).toEqual([
      "second",
      "first",
    ]);
  });

  it("preserves the array order so nodes are not remounted", () => {
    const result = reorderNodes(nodes, ["bottom"], "front");
    expect(result.map((n) => n.id)).toEqual(["bottom", "middle", "top"]);
  });

  it("returns the nodes untouched without a selection", () => {
    expect(reorderNodes(nodes, [], "front")).toBe(nodes);
  });
});

describe("getNodesAtPosition", () => {
  const sized = (
    id: string,
    type: string,
    x: number,
    y: number,
    zIndex: number,
  ) =>
    makeNode(id, type, {
      position: { x, y },
      zIndex,
      measured: { width: 100, height: 100 },
    } as Partial<Node<NodeData>>);

  it("returns overlapping nodes top-most first", () => {
    const nodes = [
      sized("background", "image", 0, 0, 1),
      sized("foreground", "task", 20, 20, 5),
    ];
    expect(getNodesAtPosition(nodes, { x: 50, y: 50 }).map((n) => n.id)).toEqual(
      ["foreground", "background"],
    );
  });

  it("ignores nodes the point is outside of", () => {
    const nodes = [sized("a", "task", 0, 0, 1)];
    expect(getNodesAtPosition(nodes, { x: 500, y: 500 })).toEqual([]);
  });

  it("ignores nodes that have not been measured", () => {
    expect(getNodesAtPosition([makeNode("a", "task")], { x: 0, y: 0 })).toEqual(
      [],
    );
  });
});
