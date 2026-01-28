import React from "react";
import { Target, Trash2 } from "lucide-react";
import { useEditorStore } from "./editorStore";

interface NodePickerInputProps {
  value: string;
  onChange: (nodeId: string) => void;
  onRemove: () => void;
  nodeOptions: Array<{ id: string; label: string }>;
}

export function NodePickerInput({
  value,
  onChange,
  onRemove,
  nodeOptions,
}: NodePickerInputProps) {
  const getTranslationsFromStore = useEditorStore((state) => state.getTranslations);
  const setPickerMode = useEditorStore((state) => state.setPickerMode);
  const pickerMode = useEditorStore((state) => state.pickerMode);

  const t = getTranslationsFromStore();

  const selectedNode = nodeOptions.find((n) => n.id === value);

  const handlePickClick = () => {
    setPickerMode(true, (nodeId: string) => {
      onChange(nodeId);
    });
  };

  return (
    <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
      <select 
        value={value} 
        onChange={(e) => onChange(e.target.value)}
        style={{ flex: 1 }}
      >
        <option value="">{t.selectNode}</option>
        {nodeOptions.map((n) => (
          <option key={n.id} value={n.id}>
            {n.label}
          </option>
        ))}
      </select>
      <button
        onClick={handlePickClick}
        className="icon-button"
        title={t.pickFromMap}
        disabled={pickerMode}
        style={{
          opacity: pickerMode ? 0.5 : 1,
          cursor: pickerMode ? "not-allowed" : "pointer",
        }}
      >
        <Target size={16} />
      </button>
      <button onClick={onRemove} className="icon-button">
        <Trash2 size={16} />
      </button>
    </div>
  );
}
