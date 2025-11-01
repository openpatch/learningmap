import { Node, NodeResizer } from "@xyflow/react";
import { ImageNodeData } from "../types";

// Validate URL to prevent XSS attacks
function isValidUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    // Only allow http, https, and mailto protocols
    return ['http:', 'https:', 'mailto:'].includes(parsedUrl.protocol);
  } catch {
    return false;
  }
}

// Simple markdown link parser for captions
function parseMarkdownLinks(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  
  // Use matchAll instead of exec to avoid potential infinite loops
  const matches = Array.from(text.matchAll(linkRegex));
  let lastIndex = 0;

  matches.forEach((match, index) => {
    // Add text before the link
    if (match.index !== undefined && match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    
    // Add the link only if URL is valid
    const linkText = match[1];
    const linkUrl = match[2];
    
    if (isValidUrl(linkUrl)) {
      parts.push(
        <a key={index} href={linkUrl} target="_blank" rel="noopener noreferrer" style={{ color: "#3b82f6", textDecoration: "underline" }}>
          {linkText}
        </a>
      );
    } else {
      // If URL is invalid, just show the text
      parts.push(`[${linkText}](${linkUrl})`);
    }
    
    if (match.index !== undefined) {
      lastIndex = match.index + match[0].length;
    }
  });

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
