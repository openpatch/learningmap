import React from "react";
import { FolderOpen, Plus, Info } from "lucide-react";
import { getTranslations } from "./translations";
import logo from "./logo.svg";

interface WelcomeMessageProps {
  onOpenFile: () => void;
  onAddTopic: () => void;
  onShowHelp: () => void;
  language?: string;
}

export const WelcomeMessage: React.FC<WelcomeMessageProps> = ({
  onOpenFile,
  onAddTopic,
  onShowHelp,
  language = "en",
}) => {
  const t = getTranslations(language);

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
