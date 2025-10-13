import { useEffect } from "react";
import { useReactFlow } from "@xyflow/react";
import { useEditorStore } from "./editorStore";

interface KeyboardShortcutsProps {
  onAddNode: (type: "task" | "topic" | "image" | "text") => void;
  onDeleteSelected: () => void;
  onSave: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onTogglePreview: () => void;
  onToggleDebug: () => void;
  onResetMap: () => void;
  onCut: () => void;
  onCopy: () => void;
  onPaste: () => void;
  onSelectAll: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  onFitView: () => void;
  onZoomToSelection: () => void;
  onToggleGrid: () => void;
}

export const KeyboardShortcuts = ({
  onAddNode,
  onDeleteSelected,
  onSave,
  onUndo,
  onRedo,
  onTogglePreview,
  onToggleDebug,
  onResetMap,
  onCut,
  onCopy,
  onPaste,
  onSelectAll,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onFitView,
  onZoomToSelection,
  onToggleGrid,
}: KeyboardShortcutsProps) => {
  const setHelpOpen = useEditorStore(state => state.setHelpOpen);
  const helpOpen = useEditorStore(state => state.helpOpen);
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === '1') {
          e.preventDefault();
          onAddNode("task");
        } else if (e.key === '2') {
          e.preventDefault();
          onAddNode("topic");
        } else if (e.key === '3') {
          e.preventDefault();
          onAddNode("image");
        } else if (e.key === '4') {
          e.preventDefault();
          onAddNode("text");
        } else if (e.key === 's') {
          e.preventDefault();
          onSave();
        } else if (e.key === 'z' && !e.shiftKey) {
          e.preventDefault();
          onUndo();
        } else if ((e.key === 'y') || (e.key === 'z' && e.shiftKey)) {
          e.preventDefault();
          onRedo();
        } else if ((e.key === '?' || (e.shiftKey && e.key === '/'))) {
          e.preventDefault();
          setHelpOpen(!helpOpen);
        } else if (e.key.toLowerCase() === 'p' && !e.shiftKey) {
          e.preventDefault();
          onTogglePreview();
        } else if (e.key.toLowerCase() === 'd' && !e.shiftKey) {
          e.preventDefault();
          onToggleDebug();
        } else if (e.key === '+' || e.key === '=') {
          e.preventDefault();
          onZoomIn();
        } else if (e.key === '-') {
          e.preventDefault();
          onZoomOut();
        } else if (e.key === '0') {
          e.preventDefault();
          onResetZoom();
        } else if (e.key === "'") {
          e.preventDefault();
          onToggleGrid();
        } else if (e.key === 'Delete') {
          e.preventDefault();
          onResetMap();
        } else if (e.key.toLowerCase() === 'x') {
          e.preventDefault();
          onCut();
        } else if (e.key.toLowerCase() === 'c') {
          e.preventDefault();
          onCopy();
        } else if (e.key.toLowerCase() === 'v') {
          e.preventDefault();
          onPaste();
        } else if (e.key.toLowerCase() === 'a') {
          e.preventDefault();
          onSelectAll();
        }
      } else if (e.shiftKey) {
        if (e.key === '!') {
          e.preventDefault();
          onFitView();
        } else if (e.key === '@') {
          e.preventDefault();
          onZoomToSelection();
        }
      } else if (e.key === 'Delete') {
        e.preventDefault();
        onDeleteSelected();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onAddNode, onDeleteSelected, onSave, onUndo, onRedo, helpOpen, setHelpOpen, onTogglePreview, onToggleDebug,
    onZoomIn, onZoomOut, onResetZoom, onFitView, onZoomToSelection, onToggleGrid,
    onResetMap, onCut, onCopy, onPaste, onSelectAll]);

  return null;
};
