import React, { useState, useEffect } from "react";
import { X, Trash2, Save } from "lucide-react";
import { Node } from "@xyflow/react";
import { EditorDrawerTaskContent } from "./EditorDrawerTaskContent";
import { EditorDrawerTopicContent } from "./EditorDrawerTopicContent";
import { EditorDrawerImageContent } from "./EditorDrawerImageContent";
import { EditorDrawerTextContent } from "./EditorDrawerTextContent";
import { Completion, NodeData } from "./types";
import { getTranslations } from "./translations";
import { useEditorStore } from "./editorStore";

interface EditorDrawerProps {
  defaultLanguage?: string;
}

export const EditorDrawer: React.FC<EditorDrawerProps> = ({
  defaultLanguage = "en",
}) => {
  // Get node and all nodes from store
  const selectedNodeId = useEditorStore(state => state.selectedNodeId);
  const nodes = useEditorStore(state => state.nodes);
  const isOpen = useEditorStore(state => state.drawerOpen);
  const settings = useEditorStore(state => state.settings);
  
  // Get actions from store
  const setDrawerOpen = useEditorStore(state => state.setDrawerOpen);
  const setSelectedNodeId = useEditorStore(state => state.setSelectedNodeId);
  const updateNode = useEditorStore(state => state.updateNode);
  const deleteNode = useEditorStore(state => state.deleteNode);
  
  const language = settings?.language || defaultLanguage;
  const t = getTranslations(language);
  
  const node = nodes.find(n => n.id === selectedNodeId) || null;
  
  const [localNode, setLocalNode] = useState<Node<NodeData> | null>(node);

  useEffect(() => {
    setLocalNode(node);
  }, [node]);

  const onClose = () => {
    setDrawerOpen(false);
    setSelectedNodeId(null);
  };

  const onUpdate = (updatedNode: Node<NodeData>) => {
    updateNode(updatedNode.id, updatedNode);
  };

  const onDelete = () => {
    if (node && confirm(t.resetMapWarning)) {
      deleteNode(node.id);
      onClose();
    }
  };

  if (!isOpen || !node || !localNode) return null;

  // Filter out the current node from selectable options
  const nodeOptions = nodes.filter(n => n.id !== node.id && (n.type === "task" || n.type === "topic"));

  // Helper for dropdowns
  const renderNodeSelect = (value: string, onChange: (id: string) => void) => (
    <select value={value} onChange={e => onChange(e.target.value)}>
      <option value="">{t.selectNode}</option>
      {nodeOptions.map(n => (
        <option key={n.id} value={n.id}>
          {n.data.label || n.id}
        </option>
      ))}
    </select>
  );

  // Completion Needs
  const handleCompletionNeedsChange = (idx: number, id: string) => {
    if (!localNode) return;
    const needs: Completion["needs"] = [...(localNode.data.completion?.needs || [])];
    needs[idx] = id;
    handleFieldChange("completion", { ...(localNode.data.completion || {}), needs });
  };
  const addCompletionNeed = () => {
    if (!localNode) return;
    const needs: Completion["needs"] = [...(localNode.data.completion?.needs || []), ""];
    handleFieldChange("completion", { ...(localNode.data.completion || {}), needs });
  };
  const removeCompletionNeed = (idx: number) => {
    if (!localNode) return;
    const needs: Completion["needs"] = (localNode.data.completion?.needs || []).filter((_: any, i: number) => i !== idx);
    handleFieldChange("completion", { ...(localNode.data.completion || {}), needs });
  };

  // Completion Optional
  const handleCompletionOptionalChange = (idx: number, id: string) => {
    if (!localNode) return;
    const optional: Completion["optional"] = [...(localNode.data.completion?.optional || [])];
    optional[idx] = id;
    handleFieldChange("completion", { ...(localNode.data.completion || {}), optional });
  };
  const addCompletionOptional = () => {
    if (!localNode) return;
    const optional: Completion["optional"] = [...(localNode.data.completion?.optional || []), ""];
    handleFieldChange("completion", { ...(localNode.data.completion || {}), optional });
  };
  const removeCompletionOptional = (idx: number) => {
    if (!localNode) return;
    const optional = (localNode.data.completion?.optional || []).filter((_: any, i: number) => i !== idx);
    handleFieldChange("completion", { ...(localNode.data.completion || {}), optional });
  };

  // Unlock After
  const handleUnlockAfterChange = (idx: number, id: string) => {
    if (!localNode) return;
    const after = [...(localNode.data.unlock?.after || [])];
    after[idx] = id;
    handleFieldChange("unlock", { ...(localNode.data.unlock || {}), after });
  };
  const addUnlockAfter = () => {
    if (!localNode) return;
    const after = [...(localNode.data.unlock?.after || []), ""];
    handleFieldChange("unlock", { ...(localNode.data.unlock || {}), after });
  };
  const removeUnlockAfter = (idx: number) => {
    if (!localNode) return;
    const after = (localNode.data.unlock?.after || []).filter((_: any, i: number) => i !== idx);
    handleFieldChange("unlock", { ...(localNode.data.unlock || {}), after });
  };

  const handleSave = () => {
    if (!localNode) return;
    onUpdate(localNode);
    onClose();
  };

  const handleFieldChange = (field: string, value: any) => {
    setLocalNode((prev: Node<NodeData> | null) => ({
      ...prev!,
      data: { ...prev!.data, [field]: value },
      className: field === "color" ? value : prev!.className
    }));
  };

  const handleResourceChange = (index: number, field: string, value: string) => {
    if (!localNode) return;
    const resources = [...(localNode.data.resources || [])];
    resources[index] = { ...resources[index], [field]: value };
    handleFieldChange("resources", resources);
  };

  const addResource = () => {
    if (!localNode) return;
    const resources = [...(localNode.data.resources || []), { label: "", url: "" }];
    handleFieldChange("resources", resources);
  };

  const removeResource = (index: number) => {
    if (!localNode) return;
    const resources = (localNode.data.resources || []).filter((_: any, i: number) => i !== index);
    handleFieldChange("resources", resources);
  };

  let content;
  if (localNode.type === "task") {
    content = (
      <>
        <div className="drawer-header">
          <h2 className="drawer-title">{t.editTask}</h2>
          <button onClick={onClose} className="close-button">
            <X size={20} />
          </button>
        </div>
        <EditorDrawerTaskContent
          localNode={localNode}
          handleFieldChange={handleFieldChange}
          handleResourceChange={handleResourceChange}
          addResource={addResource}
          removeResource={removeResource}
          handleUnlockAfterChange={handleUnlockAfterChange}
          addUnlockAfter={addUnlockAfter}
          removeUnlockAfter={removeUnlockAfter}
          renderNodeSelect={renderNodeSelect}
          handleCompletionNeedsChange={handleCompletionNeedsChange}
          addCompletionNeed={addCompletionNeed}
          removeCompletionNeed={removeCompletionNeed}
          handleCompletionOptionalChange={handleCompletionOptionalChange}
          addCompletionOptional={addCompletionOptional}
          removeCompletionOptional={removeCompletionOptional}
          language={language}
        />
      </>
    );
  } else if (localNode.type === "topic") {
    content = (
      <>
        <div className="drawer-header">
          <h2 className="drawer-title">{t.editTopic}</h2>
          <button onClick={onClose} className="close-button">
            <X size={20} />
          </button>
        </div>
        <EditorDrawerTopicContent
          localNode={localNode}
          handleFieldChange={handleFieldChange}
          handleResourceChange={handleResourceChange}
          addResource={addResource}
          removeResource={removeResource}
          handleUnlockAfterChange={handleUnlockAfterChange}
          addUnlockAfter={addUnlockAfter}
          removeUnlockAfter={removeUnlockAfter}
          renderNodeSelect={renderNodeSelect}
          handleCompletionNeedsChange={handleCompletionNeedsChange}
          addCompletionNeed={addCompletionNeed}
          removeCompletionNeed={removeCompletionNeed}
          handleCompletionOptionalChange={handleCompletionOptionalChange}
          addCompletionOptional={addCompletionOptional}
          removeCompletionOptional={removeCompletionOptional}
          language={language}
        />
      </>
    );
  } else if (localNode.type === "image") {
    content = (
      <>
        <div className="drawer-header">
          <h2 className="drawer-title">{t.editImage}</h2>
          <button onClick={onClose} className="close-button">
            <X size={20} />
          </button>
        </div>
        <EditorDrawerImageContent
          localNode={localNode}
          handleFieldChange={handleFieldChange}
          language={language}
        />
      </>
    );
  } else if (localNode.type === "text") {
    content = (
      <>
        <div className="drawer-header">
          <h2 className="drawer-title">{t.editText}</h2>
          <button onClick={onClose} className="close-button">
            <X size={20} />
          </button>
        </div>
        <EditorDrawerTextContent
          localNode={localNode}
          handleFieldChange={handleFieldChange}
          language={language}
        />
      </>
    );
  }

  return (
    <>
      <div className="drawer-overlay" onClick={onClose} />
      <div className="drawer">
        {content}
        <div className="drawer-footer">
          <button onClick={onDelete} className="danger-button">
            <Trash2 size={16} /> {t.deleteNode}
          </button>
          <button onClick={handleSave} className="primary-button">
            <Save size={16} /> {t.saveChanges}
          </button>
        </div>
      </div>
    </>
  );
};
