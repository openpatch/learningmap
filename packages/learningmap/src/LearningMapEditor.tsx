import {
  ReactFlowProvider,
} from "@xyflow/react";
import { RoadmapData, KeyBindings } from "./types";
import { EditorToolbar } from "./EditorToolbar";
import { LearningMap } from "./LearningMap";
import { useEditorStore, setPersistence } from "./editorStore";
import { WelcomeMessage } from "./WelcomeMessage";
import { EditorCanvas } from "./EditorCanvas";
import { EditorDialogs } from "./EditorDialogs";
import { KeyboardShortcuts } from "./KeyboardShortcuts";
import { PickerBanner } from "./PickerBanner";
import { detectBrowserLanguage } from "./translations";
import { useEffect } from "react";

export interface LearningMapEditorProps {
  roadmapData?: string | RoadmapData;
  language?: string;
  jsonStore?: string;
  disableSharing?: boolean;
  disableFileOperations?: boolean;
  disablePersist?: boolean;
  keyBindings?: Partial<KeyBindings>;
}

export function LearningMapEditor({
  roadmapData,
  language,
  jsonStore = "https://json.openpatch.org",
  disableSharing = false,
  disableFileOperations = false,
  disablePersist = false,
  keyBindings,
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
  const setSettings = useEditorStore(state => state.setSettings);

  // Initialize settings with "auto" as default language if not set
  useEffect(() => {
    if (!settings?.language) {
      setSettings({ ...settings, language: "auto" });
    }
  }, [settings, setSettings]);

  useEffect(() => {
    setPersistence(!disablePersist);
  }, [disablePersist]);

  useEffect(() => {
    setJsonStore(jsonStore);
    // Set default language from prop or browser detection
    const defaultLang = language && language !== "auto" ? language : detectBrowserLanguage();
    setDefaultLanguage(defaultLang);
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
      <KeyboardShortcuts jsonStore={jsonStore} keyBindings={keyBindings} />

      {/* Toolbar */}
      <EditorToolbar disableSharing={disableSharing} disableFileOperations={disableFileOperations} />

      {/* Picker mode banner */}
      <PickerBanner />

      {/* Preview or Edit mode */}
      {previewMode && <LearningMap roadmapData={getRoadmapData()} />}
      {!previewMode && <>
        {/* Welcome message when empty */}
        {nodes.length === 0 && edges.length === 0 && <WelcomeMessage />}

        {/* Main canvas */}
        <EditorCanvas />

        {/* Dialogs */}
        <EditorDialogs jsonStore={jsonStore} />
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
