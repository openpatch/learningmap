import { Node, NodeResizer } from "@xyflow/react";
import { ImageNodeData } from "../types";

// Simple markdown link parser for captions
function parseMarkdownLinks(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  let lastIndex = 0;
  let match;

  while ((match = linkRegex.exec(text)) !== null) {
    // Add text before the link
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    // Add the link
    parts.push(
      <a key={match.index} href={match[2]} target="_blank" rel="noopener noreferrer" style={{ color: "#3b82f6", textDecoration: "underline" }}>
        {match[1]}
      </a>
    );
    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts.length > 0 ? parts : [text];
}

export const ImageNode = ({ data, selected }: Node<ImageNodeData>) => {
  return (
    <>
      {data.data ? (
        <>
          <NodeResizer isVisible={selected} keepAspectRatio />
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", width: "100%", height: "100%", overflow: "hidden", gap: "4px" }}>
            <img
              src={data.data}
              style={{
                maxWidth: "100%",
                maxHeight: data.caption ? "calc(100% - 24px)" : "100%",
                objectFit: "contain",
              }}
            />
            {data.caption && (
              <div style={{ fontSize: "11px", color: "#6b7280", textAlign: "center", padding: "0 4px", lineHeight: "1.3" }}>
                {parseMarkdownLinks(data.caption)}
              </div>
            )}
          </div>
        </>
      ) : (
        <span>No Image</span>
      )}
    </>
  );
};
