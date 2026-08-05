import React from "react";
import { FolderOpen, Plus, Info } from "lucide-react";
import { useEditorStore } from "./editorStore";
import { useReactFlow } from "@xyflow/react";
import logo from "./logo.svg";
import { useFileOperations } from "./useFileOperations";
import { createNode } from "./nodeFactory";

export const WelcomeMessage: React.FC = () => {
  // Get state and actions from store
  const addNode = useEditorStore(state => state.addNode);
  const setHelpOpen = useEditorStore(state => state.setHelpOpen);
  const getTranslationsFromStore = useEditorStore(state => state.getTranslations);

  const { openRoadmap } = useFileOperations();
  const { screenToFlowPosition } = useReactFlow();

  const t = getTranslationsFromStore();

  const onAddTopic = () => {
    addNode(
      createNode({
        type: "topic",
        nodes: useEditorStore.getState().nodes,
        t,
        screenToFlowPosition,
      }),
    );
  };

  const onShowHelp = () => setHelpOpen(true);

  return (
    <div className="welcome-message">
      <div className="welcome-content">
        <h1 className="welcome-title">
          <img src={logo} alt="Logo" className="welcome-logo" />
          {t.welcomeTitle}</h1>
        <p className="welcome-subtitle">{t.welcomeSubtitle}</p>
        <div className="welcome-actions">
          <button onClick={openRoadmap} className="primary-button">
            <FolderOpen size={18} />
            {t.welcomeOpenFile}
          </button>
          <button onClick={onAddTopic} className="primary-button">
            <Plus size={18} />
            {t.welcomeAddTopic}
          </button>
          <button onClick={onShowHelp} className="secondary-button">
            <Info size={18} />
            {t.welcomeHelp}
          </button>
        </div>
      </div>
    </div>
  );
};
