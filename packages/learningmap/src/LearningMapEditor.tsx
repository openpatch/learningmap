import { useEffect } from "react";
import {
  useReactFlow,
  ReactFlowProvider,
} from "@xyflow/react";
import { EditorDrawer } from "./EditorDrawer";
import { EdgeDrawer } from "./EdgeDrawer";
import { RoadmapData } from "./types";
import { SettingsDrawer } from "./SettingsDrawer";
import { EditorToolbar } from "./EditorToolbar";
import { parseRoadmapData } from "./helper";
import { LearningMap } from "./LearningMap";
import { useEditorStore } from "./editorStore";
import { getTranslations } from "./translations";
import { WelcomeMessage } from "./WelcomeMessage";
import { EditorCanvas } from "./EditorCanvas";
import { EditorDialogs } from "./EditorDialogs";
import { DebugModeEdges } from "./DebugModeEdges";
import { KeyboardShortcuts } from "./KeyboardShortcuts";
import { useEditorActions } from "./useEditorActions";

export interface LearningMapEditorProps {
  roadmapData?: string | RoadmapData;
  language?: string;
  onChange?: (data: RoadmapData) => void;
  jsonStore?: string;
}

export function LearningMapEditor({
  roadmapData,
  language = "en",
  onChange,
  jsonStore = "https://json.openpatch.org",
}: LearningMapEditorProps) {

  const parsedRoadmap = parseRoadmapData(roadmapData || "");
  const { screenToFlowPosition } = useReactFlow();
  
  // Only get minimal state needed in this component
  const nodes = useEditorStore(state => state.nodes);
  const edges = useEditorStore(state => state.edges);
  const settings = useEditorStore(state => state.settings);
  const previewMode = useEditorStore(state => state.previewMode);
  
  // Store actions
  const loadRoadmapData = useEditorStore(state => state.loadRoadmapData);
  const getRoadmapData = useEditorStore(state => state.getRoadmapData);
  const setHelpOpen = useEditorStore(state => state.setHelpOpen);
  const setSettings = useEditorStore(state => state.setSettings);

  // Use language from settings if available, otherwise use prop
  const effectiveLanguage = settings?.language || language;
  const t = getTranslations(effectiveLanguage);

  // Use the custom hook for all editor actions
  const {
    handleNodeClick,
    handleEdgeClick,
    closeDrawer,
    handleUpdateNode,
    handleUpdateEdge,
    handleDeleteEdge,
    handleDeleteNode,
    addNewNode,
    togglePreviewMode,
    toggleDebugMode,
    handleDownload,
    handleShare,
    loadFromJsonStore,
    handleOpen,
    handleOpenSettingsDrawer,
    handleCut,
    handleCopy,
    handlePaste,
    handleZoomIn,
    handleZoomOut,
    handleResetZoom,
    handleFitView,
    handleZoomToSelection,
    handleToggleGrid,
    handleResetMap,
    handleSelectAll,
    handleDeleteSelected,
    handleSave,
  } = useEditorActions(t, screenToFlowPosition, jsonStore);

  const keyboardShortcuts = [
    { action: t.shortcuts.undo, shortcut: "Ctrl+Z" },
    { action: t.shortcuts.redo, shortcut: "Ctrl+Y or Ctrl+Shift+Z" },
    { action: t.shortcuts.addTaskNode, shortcut: "Ctrl+1" },
    { action: t.shortcuts.addTopicNode, shortcut: "Ctrl+2" },
    { action: t.shortcuts.addImageNode, shortcut: "Ctrl+3" },
    { action: t.shortcuts.addTextNode, shortcut: "Ctrl+4" },
    { action: t.shortcuts.deleteNodeEdge, shortcut: "Delete" },
    { action: t.shortcuts.togglePreviewMode, shortcut: "Ctrl+P" },
    { action: t.shortcuts.toggleDebugMode, shortcut: "Ctrl+D" },
    { action: t.shortcuts.selectMultipleNodes, shortcut: "Ctrl+Click or Shift+Drag" },
    { action: t.shortcuts.selectAllNodes, shortcut: "Ctrl+A" },
    { action: t.shortcuts.showHelp, shortcut: "Ctrl+? or Help Button" },
    { action: t.shortcuts.save, shortcut: "Ctrl+S" },
    { action: t.shortcuts.zoomIn, shortcut: "Ctrl++" },
    { action: t.shortcuts.zoomOut, shortcut: "Ctrl+-" },
    { action: t.shortcuts.resetZoom, shortcut: "Ctrl+0" },
    { action: t.shortcuts.resetMap, shortcut: "Ctrl+Delete" },
    { action: t.shortcuts.fitView, shortcut: "Shift+!" },
    { action: t.shortcuts.zoomToSelection, shortcut: "Shift+@" },
    { action: t.shortcuts.toggleGrid, shortcut: "Ctrl+'" },
    { action: t.shortcuts.cut, shortcut: "Ctrl+X" },
    { action: t.shortcuts.copy, shortcut: "Ctrl+C" },
    { action: t.shortcuts.paste, shortcut: "Ctrl+V" },
  ];

  // Load roadmap data when prop changes
  useEffect(() => {
    loadRoadmapData(parsedRoadmap);
  }, [roadmapData, loadRoadmapData]);

  // Save changes via onChange callback
  useEffect(() => {
    if (onChange) {
      const roadmapData = getRoadmapData();
      onChange(roadmapData);
    }
  }, [nodes, edges, settings, onChange, getRoadmapData]);

  return (
    <>
      {/* Debug mode edges effect */}
      <DebugModeEdges />
      
      {/* Keyboard shortcuts handler */}
      <KeyboardShortcuts
        onAddNode={addNewNode}
        onDeleteSelected={handleDeleteSelected}
        onSave={handleSave}
        onUndo={() => {}} // Handled by EditorCanvas
        onRedo={() => {}} // Handled by EditorCanvas
        onTogglePreview={togglePreviewMode}
        onToggleDebug={toggleDebugMode}
        onResetMap={handleResetMap}
        onCut={handleCut}
        onCopy={handleCopy}
        onPaste={handlePaste}
        onSelectAll={handleSelectAll}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onResetZoom={handleResetZoom}
        onFitView={handleFitView}
        onZoomToSelection={handleZoomToSelection}
        onToggleGrid={handleToggleGrid}
      />
      
      {/* Toolbar */}
      <EditorToolbar
        onAddNewNode={addNewNode}
        onOpenSettingsDrawer={handleOpenSettingsDrawer}
        onDownlad={handleDownload}
        onOpen={handleOpen}
        onShare={handleShare}
        onReset={handleResetMap}
        language={effectiveLanguage}
      />
      
      {/* Preview or Edit mode */}
      {previewMode && <LearningMap roadmapData={getRoadmapData()} language={effectiveLanguage} />}
      {!previewMode && <>
        {/* Welcome message when empty */}
        {nodes.length === 0 && edges.length === 0 && <WelcomeMessage
          onOpenFile={handleOpen}
          onAddTopic={() => addNewNode("topic")}
          onShowHelp={() => setHelpOpen(true)}
          language={effectiveLanguage}
        />}
        
        {/* Main canvas */}
        <EditorCanvas
          onNodeClick={handleNodeClick}
          onEdgeClick={handleEdgeClick}
          onSave={handleSave}
          language={effectiveLanguage}
        />
        
        {/* Drawers */}
        <EditorDrawer
          isOpen={true}
          onClose={closeDrawer}
          onUpdate={handleUpdateNode}
          onDelete={handleDeleteNode}
          language={effectiveLanguage}
        />
        <EdgeDrawer
          onClose={closeDrawer}
          onUpdate={handleUpdateEdge}
          onDelete={handleDeleteEdge}
          language={effectiveLanguage}
        />
        <SettingsDrawer
          onClose={closeDrawer}
          onUpdate={setSettings}
          language={effectiveLanguage}
        />
        
        {/* Dialogs */}
        <EditorDialogs
          onDownload={handleDownload}
          onLoadFromStore={loadFromJsonStore}
          language={effectiveLanguage}
          keyboardShortcuts={keyboardShortcuts}
        />
      </>}
    </>
  );
}

export default (props: LearningMapEditorProps) => {
  return (
    <div className="hyperbook-learningmap-container">
      <ReactFlowProvider>
        <LearningMapEditor
          {...props}
        />
      </ReactFlowProvider>
    </div>
  )
}
