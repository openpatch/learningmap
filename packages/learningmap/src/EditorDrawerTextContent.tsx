import { Node } from "@xyflow/react";
import { TextNodeData } from "./types";
import { ColorSelector } from "./ColorSelector";
import { RotationInput } from "./RotationInput";
import { useEditorStore } from "./editorStore";
import { getReadableTextColor } from "./colorHelper";

interface Props {
  localNode: Node<TextNodeData>;
  handleFieldChange: (field: string, value: any) => void;
}

export function EditorDrawerTextContent({ localNode, handleFieldChange }: Props) {
  const getTranslationsFromStore = useEditorStore(state => state.getTranslations);
  const backgroundColor = useEditorStore(state => state.settings?.background?.color);
  const t = getTranslationsFromStore();

  // Matches the default the text node renders with when no colour is set.
  const defaultColor = getReadableTextColor(backgroundColor);

  return (
    <div className="panel-content">
      <div className="form-group">
        <label>{t.text}</label>
        <input
          type="text"
          value={localNode.data.text || ""}
          onChange={e => handleFieldChange("text", e.target.value)}
          placeholder={t.placeholderBackgroundText}
        />
      </div>
      <div className="form-group">
        <label>{t.fontSize}</label>
        <input
          type="number"
          value={localNode.data.fontSize || 32}
          onChange={e => handleFieldChange("fontSize", Number(e.target.value))}
        />
      </div>
      <div className="form-group">
        <ColorSelector
          label={t.color}
          value={localNode.data.color || defaultColor}
          onChange={color => handleFieldChange("color", color)}
        />
      </div>
      <RotationInput
        value={localNode.data.rotation || 0}
        onChange={v => handleFieldChange("rotation", v)}
      />
    </div>
  );
}
