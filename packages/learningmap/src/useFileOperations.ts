import { useCallback } from "react";
import { useEditorStore } from "./editorStore";

/**
 * Hook for handling file operations (download and open) for learning maps
 * Provides consistent file handling across the application
 */
export const useFileOperations = () => {
  const getRoadmapData = useEditorStore((state) => state.getRoadmapData);
  const loadRoadmapData = useEditorStore((state) => state.loadRoadmapData);
  const settings = useEditorStore((state) => state.settings);

  /**
   * Generates a filename for the learning map
   * Uses the title if present, otherwise generates a timestamp-based name
   * Format: "title.learningmap" or "YYYY-MM-DD-HHMMSS.learningmap"
   */
  const getFilename = useCallback(() => {
    if (settings?.title && settings.title.trim()) {
      // Sanitize title for filename: remove invalid characters
      const sanitized = settings.title
        .trim()
        .replace(/[<>:"/\\|?*\x00-\x1F]/g, "-")
        .replace(/\s+/g, "-");
      return `${sanitized}.learningmap`;
    }
    
    // Generate timestamp-based filename
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");
    
    return `${year}-${month}-${day}-${hours}${minutes}${seconds}.learningmap`;
  }, [settings?.title]);

  /**
   * Downloads the current roadmap as a .learningmap file
   */
  const downloadRoadmap = useCallback(() => {
    const roadmapData = getRoadmapData();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(roadmapData, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", getFilename());
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  }, [getRoadmapData, getFilename]);

  /**
   * Opens a file picker to load a roadmap from a .learningmap or .json file
   */
  const openRoadmap = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    // Accept both .learningmap and .json for backward compatibility
    input.accept = '.learningmap,.json,application/json';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          try {
            const data = JSON.parse(e.target.result);
            loadRoadmapData(data);
          } catch (error) {
            console.error("Failed to parse file", error);
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  }, [loadRoadmapData]);

  return {
    downloadRoadmap,
    openRoadmap,
    getFilename,
  };
};
