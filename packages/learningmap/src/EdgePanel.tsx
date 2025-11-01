import React from "react";
import { X, Trash2, Save } from "lucide-react";
import { Edge, Panel } from "@xyflow/react";
import { EditorDrawerEdgeContent } from "./EditorDrawerEdgeContent";
import { getTranslations } from "./translations";
import { useEditorStore } from "./editorStore";

interface EdgePanelProps {
  defaultLanguage?: string;
}

export const EdgePanel: React.FC<EdgePanelProps> = ({
  defaultLanguage = "en",
}) => {
  // Get edge and drawer state from store
  const selectedEdge = useEditorStore(state => state.selectedEdge);
  const edgeDrawerOpen = useEditorStore(state => state.edgeDrawerOpen);
  const settings = useEditorStore(state => state.settings);

  // Get actions from store
  const setEdgeDrawerOpen = useEditorStore(state => state.setEdgeDrawerOpen);
  const setSelectedEdge = useEditorStore(state => state.setSelectedEdge);
  const updateEdge = useEditorStore(state => state.updateEdge);
  const deleteEdge = useEditorStore(state => state.deleteEdge);

  const language = settings?.language || defaultLanguage;
  const t = getTranslations(language);

  const closePanel = () => {
    setEdgeDrawerOpen(false);
    setSelectedEdge(null);
  };

  const onUpdate = (edge: Edge) => {
    updateEdge(edge.id, edge);
  };

  const onDelete = () => {
    if (selectedEdge) {
      deleteEdge(selectedEdge.id);
      closePanel();
    }
  };

  if (!selectedEdge || !edgeDrawerOpen) return null;
  
  return (
    <Panel position="center-right" className="editor-panel">
      <div className="panel-inner">
        <div className="panel-header">
          <h2 className="panel-title">{t.editEdge}</h2>
          <button onClick={closePanel} className="close-button">
            <X size={20} />
          </button>
        </div>
        <EditorDrawerEdgeContent
          localEdge={selectedEdge}
          handleFieldChange={(field: string, value: any) => {
            let updated = { ...selectedEdge };
            if (field === "color") {
              updated = {
                ...updated,
                style: { ...updated.style, stroke: value },
              };
            } else if (field === "animated") {
              updated = { ...updated, animated: value };
            } else if (field === "type") {
              updated = { ...updated, type: value };
            }
            onUpdate(updated);
          }}
          language={language}
        />
        <div className="panel-footer">
          <button onClick={onDelete} className="danger-button">
            <Trash2 size={16} /> {t.deleteEdge}
          </button>
          <button onClick={closePanel} className="primary-button">
            <Save size={16} /> {t.saveChanges}
          </button>
        </div>
      </div>
    </Panel>
  );
};
