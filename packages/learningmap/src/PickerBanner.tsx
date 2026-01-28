import React from "react";
import { X } from "lucide-react";
import { useEditorStore } from "./editorStore";

export function PickerBanner() {
  const pickerMode = useEditorStore((state) => state.pickerMode);
  const setPickerMode = useEditorStore((state) => state.setPickerMode);
  const getTranslationsFromStore = useEditorStore((state) => state.getTranslations);

  const t = getTranslationsFromStore();

  if (!pickerMode) return null;

  const handleCancel = () => {
    setPickerMode(false, null);
  };

  return (
    <div
      style={{
        position: "fixed",
        top: "60px",
        left: "50%",
        transform: "translateX(-50%)",
        backgroundColor: "#3b82f6",
        color: "white",
        padding: "12px 24px",
        borderRadius: "8px",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        gap: "12px",
        fontSize: "14px",
        fontWeight: 500,
      }}
    >
      <span>{t.clickNodeToPick}</span>
      <button
        onClick={handleCancel}
        style={{
          background: "rgba(255, 255, 255, 0.2)",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          padding: "4px",
          display: "flex",
          alignItems: "center",
          color: "white",
        }}
        title={t.close}
      >
        <X size={16} />
      </button>
    </div>
  );
}
