import { useEffect, useState } from "react";
import { X, Link2, Check } from "lucide-react";
import { getTranslations } from "./translations";
import { useEditorStore } from "./editorStore";
import { useJsonStore } from "./useJsonStore";

export function ShareDialog() {
  const [copiedEdit, setCopiedEdit] = useState(false);
  const [copiedLearn, setCopiedLearn] = useState(false);

  // Get state from store
  const open = useEditorStore(state => state.shareDialogOpen);
  const shareLink = useEditorStore(state => state.shareLink);
  const settings = useEditorStore(state => state.settings);
  const setShareDialogOpen = useEditorStore(state => state.setShareDialogOpen);

  const language = settings?.language || "en";
  const t = getTranslations(language);

  const onClose = () => setShareDialogOpen(false);

  if (!open) return null;

  // Generate both edit and learn links
  const editLink = shareLink;
  const learnLink = shareLink.replace(/(#json=.+)/, '/learn$1');

  const handleCopyEditLink = async () => {
    try {
      await navigator.clipboard.writeText(editLink);
      setCopiedEdit(true);
      setTimeout(() => setCopiedEdit(false), 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  const handleCopyLearnLink = async () => {
    try {
      await navigator.clipboard.writeText(learnLink);
      setCopiedLearn(true);
      setTimeout(() => setCopiedLearn(false), 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  return (
    <>
      <div className="drawer-overlay" onClick={onClose} />
      <div className="share-dialog">
        <header className="drawer-header">
          <h2 className="drawer-title">{t.share}</h2>
          <button className="close-button" onClick={onClose} aria-label={t.close}>
            <X size={20} />
          </button>
        </header>
        <div className="drawer-content">
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Edit Link</h3>
            <p style={{ fontSize: 13, color: '#666', marginBottom: 12 }}>Share this link to allow others to edit the map</p>
            <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
              <input
                type="text"
                value={editLink}
                readOnly
                style={{
                  flex: 1,
                  padding: "8px 12px",
                  border: "1px solid #d1d5db",
                  borderRadius: 4,
                  fontSize: 14,
                  fontFamily: "monospace",
                }}
                onClick={(e) => e.currentTarget.select()}
              />
            </div>
            <button
              onClick={handleCopyEditLink}
              className="drawer-button"
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              {copiedEdit ? (
                <>
                  <Check size={16} />
                  {t.linkCopied}
                </>
              ) : (
                <>
                  <Link2 size={16} />
                  Copy Edit Link
                </>
              )}
            </button>
          </div>

          <div>
            <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Learn Link</h3>
            <p style={{ fontSize: 13, color: '#666', marginBottom: 12 }}>Share this link for others to learn from the map</p>
            <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
              <input
                type="text"
                value={learnLink}
                readOnly
                style={{
                  flex: 1,
                  padding: "8px 12px",
                  border: "1px solid #d1d5db",
                  borderRadius: 4,
                  fontSize: 14,
                  fontFamily: "monospace",
                }}
                onClick={(e) => e.currentTarget.select()}
              />
            </div>
            <button
              onClick={handleCopyLearnLink}
              className="drawer-button"
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              {copiedLearn ? (
                <>
                  <Check size={16} />
                  {t.linkCopied}
                </>
              ) : (
                <>
                  <Link2 size={16} />
                  Copy Learn Link
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
