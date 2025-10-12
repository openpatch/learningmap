import React from "react";
import { X, Download, AlertTriangle } from "lucide-react";
import { getTranslations } from "./translations";

interface LoadExternalDialogProps {
  open: boolean;
  onClose: () => void;
  onDownloadCurrent: () => void;
  onReplace: () => void;
  language?: string;
}

export function LoadExternalDialog({
  open,
  onClose,
  onDownloadCurrent,
  onReplace,
  language = "en",
}: LoadExternalDialogProps) {
  const t = getTranslations(language);

  if (!open) return null;

  const handleDownloadAndReplace = () => {
    onDownloadCurrent();
    setTimeout(() => onReplace(), 100);
  };

  return (
    <>
      <div className="drawer-overlay" onClick={onClose} />
      <div className="share-dialog">
        <header className="drawer-header">
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <AlertTriangle size={20} color="#f59e0b" />
            <h2 className="drawer-title" style={{ margin: 0 }}>Warning</h2>
          </div>
          <button className="close-button" onClick={onClose} aria-label={t.close}>
            <X size={20} />
          </button>
        </header>
        <div className="drawer-content">
          <p style={{ marginBottom: 16 }}>{t.loadExternalWarning}</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <button
              onClick={handleDownloadAndReplace}
              className="drawer-button"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <Download size={16} />
              {t.downloadCurrentMap}
            </button>
            <button
              onClick={onReplace}
              className="drawer-button"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                backgroundColor: "#dc2626",
              }}
            >
              {t.replaceWithExternal}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
