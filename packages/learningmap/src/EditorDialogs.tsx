import React, { memo } from "react";
import { X } from "lucide-react";
import { useEditorStore } from "./editorStore";
import { ShareDialog } from "./ShareDialog";
import { LoadExternalDialog } from "./LoadExternalDialog";
import { getTranslations } from "./translations";

interface EditorDialogsProps {
  defaultLanguage?: string;
  jsonStore?: string;
}

export const EditorDialogs = memo(({ defaultLanguage = "en", jsonStore = "https://json.openpatch.org" }: EditorDialogsProps) => {
  // Get state from store
  const settings = useEditorStore(state => state.settings);
  const helpOpen = useEditorStore(state => state.helpOpen);
  const pendingExternalId = useEditorStore(state => state.pendingExternalId);
  
  // Get actions from store
  const setHelpOpen = useEditorStore(state => state.setHelpOpen);
  const setShareDialogOpen = useEditorStore(state => state.setShareDialogOpen);
  const setLoadExternalDialogOpen = useEditorStore(state => state.setLoadExternalDialogOpen);
  const setPendingExternalId = useEditorStore(state => state.setPendingExternalId);
  const getRoadmapData = useEditorStore(state => state.getRoadmapData);
  const loadRoadmapData = useEditorStore(state => state.loadRoadmapData);

  const language = settings?.language || defaultLanguage;
  const t = getTranslations(language);

  const onDownload = () => {
    const roadmapData = getRoadmapData();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(roadmapData, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "learningmap.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const onLoadFromStore = async (id: string) => {
    try {
      const response = await fetch(`${jsonStore}/api/json/${id}`);
      if (!response.ok) throw new Error("Failed to load from JSON store");
      const data = await response.json();
      loadRoadmapData(data);
      setLoadExternalDialogOpen(false);
      setPendingExternalId(null);
    } catch (error) {
      console.error("Failed to load from JSON store", error);
    }
  };

  const keyboardShortcuts = [
    { action: t.shortcuts.undo, shortcut: "Ctrl+Z" },
    { action: t.shortcuts.redo, shortcut: "Ctrl+Y or Ctrl+Shift+Z" },
    { action: t.shortcuts.addTaskNode, shortcut: "Ctrl+1" },
    { action: t.shortcuts.addTopicNode, shortcut: "Ctrl+2" },
    { action: t.shortcuts.addImageNode, shortcut: "Ctrl+3" },
    { action: t.shortcuts.addTextNode, shortcut: "Ctrl+4" },
    { action: t.shortcuts.deleteNodeEdge, shortcut: "Delete" },
    { action: t.shortcuts.togglePreviewMode, shortcut: "Ctrl+P" },
    { action: t.shortcuts.toggleDebugMode, shortcut: "Ctrl+D" },
    { action: t.shortcuts.selectMultipleNodes, shortcut: "Ctrl+Click or Shift+Drag" },
    { action: t.shortcuts.selectAllNodes, shortcut: "Ctrl+A" },
    { action: t.shortcuts.showHelp, shortcut: "Ctrl+? or Help Button" },
    { action: t.shortcuts.save, shortcut: "Ctrl+S" },
    { action: t.shortcuts.zoomIn, shortcut: "Ctrl++" },
    { action: t.shortcuts.zoomOut, shortcut: "Ctrl+-" },
    { action: t.shortcuts.resetZoom, shortcut: "Ctrl+0" },
    { action: t.shortcuts.resetMap, shortcut: "Ctrl+Delete" },
    { action: t.shortcuts.fitView, shortcut: "Shift+!" },
    { action: t.shortcuts.zoomToSelection, shortcut: "Shift+@" },
    { action: t.shortcuts.toggleGrid, shortcut: "Ctrl+'" },
    { action: t.shortcuts.cut, shortcut: "Ctrl+X" },
    { action: t.shortcuts.copy, shortcut: "Ctrl+C" },
    { action: t.shortcuts.paste, shortcut: "Ctrl+V" },
  ];

  return (
    <>
      <dialog
        className="help"
        open={helpOpen}
        onClose={() => setHelpOpen(false)}
      >
        <header className="help-header">
          <h2>{t.keyboardShortcuts}</h2>
          <button className="close-button" onClick={() => setHelpOpen(false)} aria-label={t.close}>
            <X size={20} />
          </button>
        </header>
        <div className="help-content">
          <table>
            <thead>
              <tr>
                <th>{t.action}</th>
                <th>{t.shortcut}</th>
              </tr>
            </thead>
            <tbody>
              {keyboardShortcuts.map((item) => (
                <tr key={item.action}>
                  <td>{item.action}</td>
                  <td>{item.shortcut}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="help-footer">
          <button className="primary-button" onClick={() => setHelpOpen(false)}>{t.close}</button>
        </div>
      </dialog>
      <ShareDialog />
      <LoadExternalDialog
        onClose={() => {
          setLoadExternalDialogOpen(false);
          setPendingExternalId(null);
        }}
        onDownloadCurrent={onDownload}
        onReplace={() => {
          if (pendingExternalId) {
            onLoadFromStore(pendingExternalId);
          }
        }}
      />
    </>
  );
});

EditorDialogs.displayName = 'EditorDialogs';
