import { describe, it, expect } from "vitest";
import { Node } from "@xyflow/react";
import { createNode, findFreePosition } from "./nodeFactory";
import { NodeData } from "./types";
import { translations } from "./translations";

const t = translations.en;

const makeNode = (
  id: string,
  type: string,
  x: number,
  y: number,
  zIndex?: number,
): Node<NodeData> =>
  ({
    id,
    type,
    position: { x, y },
    zIndex,
    data: { label: id, state: "unlocked" },
  }) as Node<NodeData>;

// The factory never needs a real viewport in these tests.
const screenToFlowPosition = (position: { x: number; y: number }) => position;

describe("findFreePosition", () => {
  it("keeps a free position untouched", () => {
    expect(findFreePosition([], { x: 10, y: 10 })).toEqual({ x: 10, y: 10 });
  });

  it("moves off an occupied position", () => {
    const nodes = [makeNode("a", "task", 10, 10)];
    expect(findFreePosition(nodes, { x: 10, y: 10 })).not.toEqual({
      x: 10,
      y: 10,
    });
  });

  it("cascades past a run of stacked nodes", () => {
    const nodes = [
      makeNode("a", "task", 0, 0),
      makeNode("b", "task", 28, 28),
      makeNode("c", "task", 56, 56),
    ];
    expect(findFreePosition(nodes, { x: 0, y: 0 })).toEqual({ x: 84, y: 84 });
  });
});

describe("createNode", () => {
  it("always sets a zIndex", () => {
    // Regression: nodes added via the keyboard used to have no zIndex at all
    // and rendered below every other node.
    for (const type of ["task", "topic", "image", "text"] as const) {
      const node = createNode({
        type,
        nodes: [],
        t,
        position: { x: 0, y: 0 },
        screenToFlowPosition,
      });
      expect(node.zIndex).toBeTypeOf("number");
    }
  });

  it("places a new image behind the existing nodes", () => {
    const nodes = [makeNode("a", "task", 0, 0, 5)];
    const node = createNode({
      type: "image",
      nodes,
      t,
      position: { x: 200, y: 200 },
      screenToFlowPosition,
    });
    expect(node.zIndex!).toBeLessThan(5);
  });

  it("gives image nodes an initial size", () => {
    const node = createNode({
      type: "image",
      nodes: [],
      t,
      position: { x: 0, y: 0 },
      screenToFlowPosition,
    });
    expect(node.width).toBeGreaterThan(0);
    expect(node.height).toBeGreaterThan(0);
  });

  it("labels task and topic nodes", () => {
    expect(
      createNode({
        type: "task",
        nodes: [],
        t,
        position: { x: 0, y: 0 },
        screenToFlowPosition,
      }).data.label,
    ).toBe(t.newTask);
    expect(
      createNode({
        type: "topic",
        nodes: [],
        t,
        position: { x: 0, y: 0 },
        screenToFlowPosition,
      }).data.label,
    ).toBe(t.newTopic);
  });

  it("does not put a placeholder label on image and text nodes", () => {
    for (const type of ["image", "text"] as const) {
      const node = createNode({
        type,
        nodes: [],
        t,
        position: { x: 0, y: 0 },
        screenToFlowPosition,
      });
      expect(node.data.label).toBeUndefined();
    }
  });

  it("offsets a node that would land on an existing one", () => {
    const nodes = [makeNode("a", "task", 100, 100)];
    const node = createNode({
      type: "task",
      nodes,
      t,
      position: { x: 100, y: 100 },
      screenToFlowPosition,
    });
    expect(node.position).not.toEqual({ x: 100, y: 100 });
  });

  it("generates unique ids for nodes created in the same millisecond", () => {
    const ids = new Set(
      Array.from(
        { length: 50 },
        () =>
          createNode({
            type: "task",
            nodes: [],
            t,
            position: { x: 0, y: 0 },
            screenToFlowPosition,
          }).id,
      ),
    );
    expect(ids.size).toBeGreaterThan(1);
  });
});
