import { useEffect, useState } from "react";
import { X, Link2, Check } from "lucide-react";
import { getTranslations } from "./translations";
import { useEditorStore } from "./editorStore";
import { useJsonStore } from "./useJsonStore";

export function ShareDialog() {
  const [copied, setCopied] = useState(false);
  const [_, postToJsonStore] = useJsonStore();

  // Get state from store
  const open = useEditorStore(state => state.shareDialogOpen);
  const shareLink = useEditorStore(state => state.shareLink);
  const settings = useEditorStore(state => state.settings);
  const setShareDialogOpen = useEditorStore(state => state.setShareDialogOpen);

  const language = settings?.language || "en";
  const t = getTranslations(language);

  const onClose = () => setShareDialogOpen(false);

  useEffect(() => {
    postToJsonStore();
  }, [])

  if (!open) return null;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
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
          <p style={{ marginBottom: 16 }}>{t.shareLink}</p>
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            <input
              type="text"
              value={shareLink}
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
            onClick={handleCopyLink}
            className="drawer-button"
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            {copied ? (
              <>
                <Check size={16} />
                {t.linkCopied}
              </>
            ) : (
              <>
                <Link2 size={16} />
                {t.copyLink}
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
}
