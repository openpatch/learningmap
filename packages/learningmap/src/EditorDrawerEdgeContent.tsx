import { ColorSelector } from "./ColorSelector";
import { Edge } from "@xyflow/react";
import { useEditorStore } from "./editorStore";

interface Props {
  localEdge: Edge;
  handleFieldChange: (field: string, value: any) => void;
}

export function EditorDrawerEdgeContent({
  localEdge,
  handleFieldChange,
}: Props) {
  const getTranslationsFromStore = useEditorStore(state => state.getTranslations);
  const t = getTranslationsFromStore();
  
  return (
    <div className="panel-content">
      <div className="form-group">
        <ColorSelector
          label={t.edgeColor}
          value={localEdge.style?.stroke || "#222222"}
          onChange={color => handleFieldChange("color", color)}
        />
      </div>
      <div className="form-group">
        <label>
          <input
            type="checkbox"
            checked={!!localEdge.animated}
            onChange={e => handleFieldChange("animated", e.target.checked)}
          />
          {t.animated}
        </label>
      </div>
      <div className="form-group">
        <label>{t.edgeType}</label>
        <select
          value={localEdge.type || "default"}
          onChange={e => handleFieldChange("type", e.target.value)}
        >
          <option value="default">{t.default}</option>
          <option value="straight">{t.straight}</option>
          <option value="step">{t.step}</option>
          <option value="smoothstep">{t.smoothstep}</option>
          <option value="simplebezier">Simple Bezier</option>
        </select>
      </div>
    </div>
  );
}
