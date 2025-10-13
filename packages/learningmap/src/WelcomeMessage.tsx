import React from "react";
import { FolderOpen, Plus, Info } from "lucide-react";
import { getTranslations } from "./translations";
import { useEditorStore } from "./editorStore";
import { Node } from "@xyflow/react";
import { NodeData } from "./types";
import logo from "./logo.svg";

interface WelcomeMessageProps {
  defaultLanguage?: string;
}

export const WelcomeMessage: React.FC<WelcomeMessageProps> = ({
  defaultLanguage = "en",
}) => {
  // Get state and actions from store
  const settings = useEditorStore(state => state.settings);
  const addNode = useEditorStore(state => state.addNode);
  const setHelpOpen = useEditorStore(state => state.setHelpOpen);
  const loadRoadmapData = useEditorStore(state => state.loadRoadmapData);

  const language = settings?.language || defaultLanguage;
  const t = getTranslations(language);

  const onOpenFile = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          try {
            const data = JSON.parse(e.target.result);
            loadRoadmapData(data);
          } catch (error) {
            console.error("Failed to parse JSON file", error);
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const onAddTopic = () => {
    const position = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const newNode: Node<NodeData> = {
      id: `node-${Date.now()}`,
      type: "topic",
      position,
      data: {
        label: t.newTopic,
        state: "unlocked",
      },
    };
    addNode(newNode);
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
          <button onClick={onOpenFile} className="primary-button">
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
