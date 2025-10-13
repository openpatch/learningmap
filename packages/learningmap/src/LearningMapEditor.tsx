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
  
  // Only get minimal state needed in this component
  const nodes = useEditorStore(state => state.nodes);
  const edges = useEditorStore(state => state.edges);
  const settings = useEditorStore(state => state.settings);
  const previewMode = useEditorStore(state => state.previewMode);
  
  // Store actions
  const loadRoadmapData = useEditorStore(state => state.loadRoadmapData);
  const getRoadmapData = useEditorStore(state => state.getRoadmapData);

  // Use language from settings if available, otherwise use prop
  const effectiveLanguage = settings?.language || language;

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
      <KeyboardShortcuts jsonStore={jsonStore} />
      
      {/* Toolbar */}
      <EditorToolbar defaultLanguage={language} />
      
      {/* Preview or Edit mode */}
      {previewMode && <LearningMap roadmapData={getRoadmapData()} language={effectiveLanguage} />}
      {!previewMode && <>
        {/* Welcome message when empty */}
        {nodes.length === 0 && edges.length === 0 && <WelcomeMessage defaultLanguage={language} />}
        
        {/* Main canvas */}
        <EditorCanvas defaultLanguage={language} />
        
        {/* Drawers */}
        <EditorDrawer defaultLanguage={language} />
        <EdgeDrawer defaultLanguage={language} />
        <SettingsDrawer defaultLanguage={language} />
        
        {/* Dialogs */}
        <EditorDialogs defaultLanguage={language} jsonStore={jsonStore} />
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
