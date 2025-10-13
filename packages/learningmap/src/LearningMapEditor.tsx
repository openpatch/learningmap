import {
  ReactFlowProvider,
} from "@xyflow/react";
import { EditorDrawer } from "./EditorDrawer";
import { EdgeDrawer } from "./EdgeDrawer";
import { RoadmapData } from "./types";
import { SettingsDrawer } from "./SettingsDrawer";
import { EditorToolbar } from "./EditorToolbar";
import { LearningMap } from "./LearningMap";
import { useEditorStore } from "./editorStore";
import { WelcomeMessage } from "./WelcomeMessage";
import { EditorCanvas } from "./EditorCanvas";
import { EditorDialogs } from "./EditorDialogs";
import { KeyboardShortcuts } from "./KeyboardShortcuts";
import { useEffect } from "react";

export interface LearningMapEditorProps {
  roadmapData?: string | RoadmapData;
  language?: string;
  jsonStore?: string;
}

export function LearningMapEditor({
  roadmapData,
  language = "en",
  jsonStore = "https://json.openpatch.org",
}: LearningMapEditorProps) {
  // Only get minimal state needed in this component
  const nodes = useEditorStore(state => state.nodes);
  const edges = useEditorStore(state => state.edges);
  const settings = useEditorStore(state => state.settings);
  const previewMode = useEditorStore(state => state.previewMode);

  // Store actions
  const getRoadmapData = useEditorStore(state => state.getRoadmapData);
  const setJsonStore = useEditorStore(state => state.setJsonStore);
  const setDefaultLanguage = useEditorStore(state => state.setDefaultLanguage);
  const loadRoadmapData = useEditorStore(state => state.loadRoadmapData);

  // Use language from settings if available, otherwise use prop
  const effectiveLanguage = settings?.language || language;

  useEffect(() => {
    setJsonStore(jsonStore);
    setDefaultLanguage(language);
  }, [jsonStore, language, setJsonStore, setDefaultLanguage]);

  useEffect(() => {
    if (roadmapData) {
      if (typeof roadmapData === "string") {
        try {
          const parsed = JSON.parse(roadmapData);
          loadRoadmapData(parsed);
        } catch (e) {
          console.error("Failed to parse roadmapData JSON string", e);
        }
      } else {
        loadRoadmapData(roadmapData);
      }
    }
  }, [roadmapData, loadRoadmapData]);


  return (
    <>
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
