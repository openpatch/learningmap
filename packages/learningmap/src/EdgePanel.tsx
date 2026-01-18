import React, { useEffect } from "react";
import { X, Trash2 } from "lucide-react";
import { Edge, Panel } from "@xyflow/react";
import { EditorDrawerEdgeContent } from "./EditorDrawerEdgeContent";
import { useEditorStore } from "./editorStore";

export const EdgePanel: React.FC = () => {
  // Get edge and drawer state from store
  const selectedEdge = useEditorStore(state => state.selectedEdge);
  const edgeDrawerOpen = useEditorStore(state => state.edgeDrawerOpen);
  const edges = useEditorStore(state => state.edges);

  // Get actions from store
  const setEdgeDrawerOpen = useEditorStore(state => state.setEdgeDrawerOpen);
  const setSelectedEdge = useEditorStore(state => state.setSelectedEdge);
  const updateEdge = useEditorStore(state => state.updateEdge);
  const deleteEdge = useEditorStore(state => state.deleteEdge);
  const getTranslationsFromStore = useEditorStore(state => state.getTranslations);

  const t = getTranslationsFromStore();

  // Close panel when edge gets deselected
  useEffect(() => {
    if (edgeDrawerOpen && !selectedEdge) {
      setEdgeDrawerOpen(false);
    }
  }, [selectedEdge, edgeDrawerOpen, setEdgeDrawerOpen]);

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
        />
        <div className="panel-footer panel-footer-centered">
          <button onClick={onDelete} className="danger-button">
            <Trash2 size={16} /> {t.deleteEdge}
          </button>
        </div>
      </div>
    </Panel>
  );
};
