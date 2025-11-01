// zIndex constants for different node types
// Ordering: Bottom -> Image (10) -> Text (20) -> Topic/Task (30) -> Top

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
