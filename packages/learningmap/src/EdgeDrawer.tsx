import React from "react";
import { X, Trash2, Save } from "lucide-react";
import { Edge } from "@xyflow/react";
import { EditorDrawerEdgeContent } from "./EditorDrawerEdgeContent";
import { useEditorStore } from "./editorStore";

export const EdgeDrawer: React.FC = () => {
  // Get edge and drawer state from store
  const selectedEdge = useEditorStore(state => state.selectedEdge);
  const edgeDrawerOpen = useEditorStore(state => state.edgeDrawerOpen);

  // Get actions from store
  const setEdgeDrawerOpen = useEditorStore(state => state.setEdgeDrawerOpen);
  const setSelectedEdge = useEditorStore(state => state.setSelectedEdge);
  const updateEdge = useEditorStore(state => state.updateEdge);
  const deleteEdge = useEditorStore(state => state.deleteEdge);
  const getTranslationsFromStore = useEditorStore(state => state.getTranslations);

  const t = getTranslationsFromStore();

  const closeDrawer = () => {
    setEdgeDrawerOpen(false);
    setSelectedEdge(null);
  };

  const onUpdate = (edge: Edge) => {
    updateEdge(edge.id, edge);
  };

  const onDelete = () => {
    if (selectedEdge) {
      deleteEdge(selectedEdge.id);
      closeDrawer();
    }
  };

  if (!selectedEdge || !edgeDrawerOpen) return null;
  return (
    <div>
      <div className="drawer-overlay" onClick={closeDrawer} />
      <div className="drawer">
        <div className="drawer-header">
          <h2 className="drawer-title">{t.editEdge}</h2>
          <button onClick={closeDrawer} className="close-button">
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
        />
        <div className="drawer-footer">
          <button onClick={onDelete} className="danger-button">
            <Trash2 size={16} /> {t.deleteEdge}
          </button>
          <button onClick={closeDrawer} className="primary-button">
            <Save size={16} /> {t.saveChanges}
          </button>
        </div>
      </div>
    </div>
  );
};
