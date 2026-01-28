import React, { useEffect } from "react";
import { X, Trash2, Copy } from "lucide-react";
import { Node, Panel } from "@xyflow/react";
import { EditorDrawerTaskContent } from "./EditorDrawerTaskContent";
import { EditorDrawerTopicContent } from "./EditorDrawerTopicContent";
import { EditorDrawerImageContent } from "./EditorDrawerImageContent";
import { EditorDrawerTextContent } from "./EditorDrawerTextContent";
import { Completion, NodeData } from "./types";
import { useEditorStore } from "./editorStore";
import { NodePickerInput } from "./NodePickerInput";

export const EditorPanel: React.FC = () => {
  // Get node and all nodes from store
  const selectedNodeId = useEditorStore(state => state.selectedNodeId);
  const nodes = useEditorStore(state => state.nodes);
  const isOpen = useEditorStore(state => state.drawerOpen);
  const nextNodeId = useEditorStore(state => state.nextNodeId);

  // Get actions from store
  const setDrawerOpen = useEditorStore(state => state.setDrawerOpen);
  const setSelectedNodeId = useEditorStore(state => state.setSelectedNodeId);
  const updateNode = useEditorStore(state => state.updateNode);
  const deleteNode = useEditorStore(state => state.deleteNode);
  const addNode = useEditorStore(state => state.addNode);
  const setNextNodeId = useEditorStore(state => state.setNextNodeId);
  const getTranslationsFromStore = useEditorStore(state => state.getTranslations);

  const t = getTranslationsFromStore();

  const node = nodes.find(n => n.id === selectedNodeId) || null;

  // Close panel when node gets deselected
  useEffect(() => {
    if (isOpen && !node) {
      setDrawerOpen(false);
      setSelectedNodeId(null);
    }
  }, [node, isOpen, setDrawerOpen, setSelectedNodeId]);

  const onClose = () => {
    setDrawerOpen(false);
    setSelectedNodeId(null);
  };

  const onDelete = () => {
    if (node) {
      deleteNode(node.id);
      onClose();
    }
  };

  const onCopy = () => {
    if (!node) return;
    
    // Create a copy of the node with a new ID and offset position
    const newNodeId = `node-${nextNodeId}`;
    const copiedNode: Node<NodeData> = {
      ...node,
      id: newNodeId,
      position: {
        x: node.position.x + 20,
        y: node.position.y + 20,
      },
      data: {
        ...node.data,
        label: `${node.data.label} (copy)`,
      },
      selected: false,
    };
    
    addNode(copiedNode);
    setNextNodeId(nextNodeId + 1);
    
    // Select the new node
    setSelectedNodeId(newNodeId);
  };

  if (!isOpen || !node) return null;

  // Filter out the current node from selectable options
  const nodeOptions = nodes.filter(n => n.id !== node.id && (n.type === "task" || n.type === "topic"));

  // Get edges connected to this node
  const edges = useEditorStore.getState().edges;
  const connectedNodeIds = new Set<string>();
  edges.forEach(edge => {
    if (edge.source === node.id) {
      connectedNodeIds.add(edge.target);
    }
    if (edge.target === node.id) {
      connectedNodeIds.add(edge.source);
    }
  });

  // Sort node options: connected nodes first, then alphabetically by label
  const sortedNodeOptions = [...nodeOptions].sort((a, b) => {
    const aConnected = connectedNodeIds.has(a.id);
    const bConnected = connectedNodeIds.has(b.id);
    
    // Connected nodes come first
    if (aConnected && !bConnected) return -1;
    if (!aConnected && bConnected) return 1;
    
    // Otherwise sort alphabetically by label
    const aLabel = (a.data.label || a.id).toLowerCase();
    const bLabel = (b.data.label || b.id).toLowerCase();
    return aLabel.localeCompare(bLabel);
  }).map(n => ({
    id: n.id,
    label: n.data.label || n.id
  }));

  // Helper for picker inputs
  const renderNodePicker = (value: string, onChange: (id: string) => void, onRemove: () => void) => (
    <NodePickerInput
      value={value}
      onChange={onChange}
      onRemove={onRemove}
      nodeOptions={sortedNodeOptions}
    />
  );

  // Completion Needs
  const handleCompletionNeedsChange = (idx: number, id: string) => {
    if (!node) return;
    const needs: Completion["needs"] = [...(node.data.completion?.needs || [])];
    needs[idx] = id;
    handleFieldChange("completion", { ...(node.data.completion || {}), needs });
  };
  const addCompletionNeed = () => {
    if (!node) return;
    const needs: Completion["needs"] = [...(node.data.completion?.needs || []), ""];
    handleFieldChange("completion", { ...(node.data.completion || {}), needs });
  };
  const removeCompletionNeed = (idx: number) => {
    if (!node) return;
    const needs: Completion["needs"] = (node.data.completion?.needs || []).filter((_: any, i: number) => i !== idx);
    handleFieldChange("completion", { ...(node.data.completion || {}), needs });
  };

  // Completion Optional
  const handleCompletionOptionalChange = (idx: number, id: string) => {
    if (!node) return;
    const optional: Completion["optional"] = [...(node.data.completion?.optional || [])];
    optional[idx] = id;
    handleFieldChange("completion", { ...(node.data.completion || {}), optional });
  };
  const addCompletionOptional = () => {
    if (!node) return;
    const optional: Completion["optional"] = [...(node.data.completion?.optional || []), ""];
    handleFieldChange("completion", { ...(node.data.completion || {}), optional });
  };
  const removeCompletionOptional = (idx: number) => {
    if (!node) return;
    const optional = (node.data.completion?.optional || []).filter((_: any, i: number) => i !== idx);
    handleFieldChange("completion", { ...(node.data.completion || {}), optional });
  };

  // Unlock After
  const handleUnlockAfterChange = (idx: number, id: string) => {
    if (!node) return;
    const after = [...(node.data.unlock?.after || [])];
    after[idx] = id;
    handleFieldChange("unlock", { ...(node.data.unlock || {}), after });
  };
  const addUnlockAfter = () => {
    if (!node) return;
    const after = [...(node.data.unlock?.after || []), ""];
    handleFieldChange("unlock", { ...(node.data.unlock || {}), after });
  };
  const removeUnlockAfter = (idx: number) => {
    if (!node) return;
    const after = (node.data.unlock?.after || []).filter((_: any, i: number) => i !== idx);
    handleFieldChange("unlock", { ...(node.data.unlock || {}), after });
  };

  const handleFieldChange = (field: string, value: any) => {
    if (!node) return;
    const updatedNode = {
      ...node,
      data: { ...node.data, [field]: value },
      className: field === "color" ? value : node.className
    };
    updateNode(node.id, updatedNode);
  };

  const handleResourceChange = (index: number, field: string, value: string) => {
    if (!node) return;
    const resources = [...(node.data.resources || [])];
    resources[index] = { ...resources[index], [field]: value };
    handleFieldChange("resources", resources);
  };

  const addResource = () => {
    if (!node) return;
    const resources = [...(node.data.resources || []), { label: "", type: "url", url: "" }];
    handleFieldChange("resources", resources);
  };

  const removeResource = (index: number) => {
    if (!node) return;
    const resources = (node.data.resources || []).filter((_: any, i: number) => i !== index);
    handleFieldChange("resources", resources);
  };

  let content;
  if (node.type === "task") {
    content = (
      <>
        <div className="panel-header">
          <h2 className="panel-title">{t.editTask}</h2>
          <button onClick={onClose} className="close-button">
            <X size={20} />
          </button>
        </div>
        <EditorDrawerTaskContent
          localNode={node}
          handleFieldChange={handleFieldChange}
          handleResourceChange={handleResourceChange}
          addResource={addResource}
          removeResource={removeResource}
          handleUnlockAfterChange={handleUnlockAfterChange}
          addUnlockAfter={addUnlockAfter}
          removeUnlockAfter={removeUnlockAfter}
          renderNodePicker={renderNodePicker}
          handleCompletionNeedsChange={handleCompletionNeedsChange}
          addCompletionNeed={addCompletionNeed}
          removeCompletionNeed={removeCompletionNeed}
          handleCompletionOptionalChange={handleCompletionOptionalChange}
          addCompletionOptional={addCompletionOptional}
          removeCompletionOptional={removeCompletionOptional}
        />
      </>
    );
  } else if (node.type === "topic") {
    content = (
      <>
        <div className="panel-header">
          <h2 className="panel-title">{t.editTopic}</h2>
          <button onClick={onClose} className="close-button">
            <X size={20} />
          </button>
        </div>
        <EditorDrawerTopicContent
          localNode={node}
          handleFieldChange={handleFieldChange}
          handleResourceChange={handleResourceChange}
          addResource={addResource}
          removeResource={removeResource}
          handleUnlockAfterChange={handleUnlockAfterChange}
          addUnlockAfter={addUnlockAfter}
          removeUnlockAfter={removeUnlockAfter}
          renderNodePicker={renderNodePicker}
          handleCompletionNeedsChange={handleCompletionNeedsChange}
          addCompletionNeed={addCompletionNeed}
          removeCompletionNeed={removeCompletionNeed}
          handleCompletionOptionalChange={handleCompletionOptionalChange}
          addCompletionOptional={addCompletionOptional}
          removeCompletionOptional={removeCompletionOptional}
        />
      </>
    );
  } else if (node.type === "image") {
    content = (
      <>
        <div className="panel-header">
          <h2 className="panel-title">{t.editImage}</h2>
          <button onClick={onClose} className="close-button">
            <X size={20} />
          </button>
        </div>
        <EditorDrawerImageContent
          localNode={node}
          handleFieldChange={handleFieldChange}
        />
      </>
    );
  } else if (node.type === "text") {
    content = (
      <>
        <div className="panel-header">
          <h2 className="panel-title">{t.editText}</h2>
          <button onClick={onClose} className="close-button">
            <X size={20} />
          </button>
        </div>
        <EditorDrawerTextContent
          localNode={node}
          handleFieldChange={handleFieldChange}
        />
      </>
    );
  }

  return (
    <Panel position="center-right" className="editor-panel">
      <div className="panel-inner">
        {content}
        <div className="panel-footer">
          <button onClick={onCopy} className="secondary-button">
            <Copy size={16} /> {t.copyNode}
          </button>
          <button onClick={onDelete} className="danger-button">
            <Trash2 size={16} /> {t.deleteNode}
          </button>
        </div>
      </div>
    </Panel>
  );
};
