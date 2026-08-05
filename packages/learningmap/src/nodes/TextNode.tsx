import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Node } from "@xyflow/react";
import { TextNodeData } from "../types";
import { useEditorStore } from "../editorStore";

/**
 * Axis aligned bounding box of a `width` x `height` box rotated by `degrees`.
 *
 * The node wrapper is sized to this box so React Flow's hit area matches what
 * is actually drawn. A CSS `transform` does not affect layout, so without this
 * a rotated text node is clickable where it is not visible and vice versa.
 */
function getRotatedBounds(width: number, height: number, degrees: number) {
  const radians = (degrees * Math.PI) / 180;
  const cos = Math.abs(Math.cos(radians));
  const sin = Math.abs(Math.sin(radians));
  return {
    width: width * cos + height * sin,
    height: width * sin + height * cos,
  };
}

export const TextNode = ({ id, data, isConnectable }: Node<TextNodeData>) => {
  const updateNodeData = useEditorStore((state) => state.updateNodeData);
  const t = useEditorStore((state) => state.getTranslations)();

  const contentRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [contentSize, setContentSize] = useState({ width: 0, height: 0 });
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(data.text || "");

  const rotation = data.rotation || 0;
  const hasText = Boolean(data.text);
  // Falls back to a colour the canvas sets from its background, so a new text
  // node is always readable instead of near-white on white.
  const color = data.color || "var(--learningmap-text-default, #111827)";
  const editable = Boolean(isConnectable) && !data.locked;

  // Track the unrotated size of the content to derive the wrapper size.
  useLayoutEffect(() => {
    const element = contentRef.current;
    if (!element) return;

    const measure = () => {
      const { offsetWidth, offsetHeight } = element;
      setContentSize((current) =>
        current.width === offsetWidth && current.height === offsetHeight
          ? current
          : { width: offsetWidth, height: offsetHeight },
      );
    };

    measure();

    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [data.text, data.fontSize, editing, hasText]);

  useEffect(() => {
    setDraft(data.text || "");
  }, [data.text]);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  const commit = () => {
    setEditing(false);
    if (draft !== (data.text || "")) {
      updateNodeData(id, { text: draft });
    }
  };

  const bounds = getRotatedBounds(
    contentSize.width,
    contentSize.height,
    rotation,
  );

  return (
    <div
      className="text-node"
      style={{
        width: bounds.width || undefined,
        height: bounds.height || undefined,
      }}
      onDoubleClick={editable ? () => setEditing(true) : undefined}
    >
      <div
        ref={contentRef}
        className="text-node-content"
        style={{
          fontSize: data.fontSize || 32,
          color,
          transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
        }}
      >
        {editing ? (
          <input
            ref={inputRef}
            className="text-node-input nodrag nopan"
            value={draft}
            style={{ fontSize: data.fontSize || 32, color }}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              e.stopPropagation();
              if (e.key === "Enter") {
                commit();
              } else if (e.key === "Escape") {
                setDraft(data.text || "");
                setEditing(false);
              }
            }}
          />
        ) : hasText ? (
          data.text
        ) : (
          <span className="node-placeholder node-placeholder-text">
            {editable ? t.doubleClickToAddText : t.noText}
          </span>
        )}
      </div>
    </div>
  );
};
