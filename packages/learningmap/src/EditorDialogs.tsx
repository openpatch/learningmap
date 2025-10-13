import React, { memo } from "react";
import { X } from "lucide-react";
import { useEditorStore } from "./editorStore";
import { ShareDialog } from "./ShareDialog";
import { LoadExternalDialog } from "./LoadExternalDialog";
import { getTranslations } from "./translations";

interface EditorDialogsProps {
  onDownload: () => void;
  onLoadFromStore: (id: string) => void;
  language?: string;
  keyboardShortcuts: Array<{ action: string; shortcut: string }>;
}

export const EditorDialogs = memo(({ onDownload, onLoadFromStore, language = "en", keyboardShortcuts }: EditorDialogsProps) => {
  const t = getTranslations(language);
  
  // Get state from store
  const helpOpen = useEditorStore(state => state.helpOpen);
  const pendingExternalId = useEditorStore(state => state.pendingExternalId);
  
  // Get actions from store
  const setHelpOpen = useEditorStore(state => state.setHelpOpen);
  const setShareDialogOpen = useEditorStore(state => state.setShareDialogOpen);
  const setLoadExternalDialogOpen = useEditorStore(state => state.setLoadExternalDialogOpen);
  const setPendingExternalId = useEditorStore(state => state.setPendingExternalId);

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
      <ShareDialog
        onClose={() => setShareDialogOpen(false)}
        language={language}
      />
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
        language={language}
      />
    </>
  );
});

EditorDialogs.displayName = 'EditorDialogs';
