import { Node, NodeResizer } from "@xyflow/react";
import { ImageNodeData } from "../types";

// Normalize and validate URL to prevent XSS attacks
function normalizeAndValidateUrl(url: string): string | null {
  // Trim whitespace
  url = url.trim();
  
  // If URL doesn't start with a protocol, prepend https://
  if (!url.match(/^[a-z]+:\/\//i)) {
    url = 'https://' + url;
  }
  
  try {
    const parsedUrl = new URL(url);
    // Only allow http, https, and mailto protocols
    if (['http:', 'https:', 'mailto:'].includes(parsedUrl.protocol)) {
      return parsedUrl.href;
    }
    return null;
  } catch {
    return null;
  }
}

// Simple markdown link parser for captions - supports [text](url) and bare URLs
function parseMarkdownLinks(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  
  // Combined regex for markdown links [text](url) and bare URLs
  // Matches markdown links first, then bare URLs (starting with http:// or https://)
  const combinedRegex = /\[([^\]]+)\]\(([^)]+)\)|(https?:\/\/[^\s<>"{}|\\^`\[\]]+)/g;
  
  const matches = Array.from(text.matchAll(combinedRegex));
  let lastIndex = 0;

  matches.forEach((match, index) => {
    // Add text before the link
    if (match.index !== undefined && match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    
    if (match[1] && match[2]) {
      // Markdown link [text](url)
      const linkText = match[1];
      const linkUrl = match[2];
      
      const normalizedUrl = normalizeAndValidateUrl(linkUrl);
      if (normalizedUrl) {
        parts.push(
          <a key={index} href={normalizedUrl} target="_blank" rel="noopener noreferrer" style={{ color: "#3b82f6", textDecoration: "underline" }}>
            {linkText}
          </a>
        );
      } else {
        // If URL is invalid, just show the text
        parts.push(`[${linkText}](${linkUrl})`);
      }
    } else if (match[3]) {
      // Bare URL
      const url = match[3];
      const normalizedUrl = normalizeAndValidateUrl(url);
      if (normalizedUrl) {
        parts.push(
          <a key={index} href={normalizedUrl} target="_blank" rel="noopener noreferrer" style={{ color: "#3b82f6", textDecoration: "underline" }}>
            {url}
          </a>
        );
      } else {
        parts.push(url);
      }
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
