import React, { useState, useEffect } from "react";
import { X, Save } from "lucide-react";
import { Settings } from "./types";
import { ColorSelector } from "./ColorSelector";
import { getTranslations } from "./translations";
import { useReactFlow } from "@xyflow/react";
import { useEditorStore } from "./editorStore";

interface SettingsDrawerProps {
  onClose: () => void;
  onUpdate: (s: Settings) => void;
  language?: string;
}

export const SettingsDrawer: React.FC<SettingsDrawerProps> = ({
  onClose,
  onUpdate,
  language = "en",
}) => {
  const t = getTranslations(language);
  
  // Get state from store
  const isOpen = useEditorStore(state => state.settingsDrawerOpen);
  const settings = useEditorStore(state => state.settings);
  
  const [localSettings, setLocalSettings] = useState<Settings>(settings);
  const { getViewport } = useReactFlow();

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  if (!isOpen) return null;

  const handleSave = () => {
    onUpdate(localSettings);
    onClose();
  };

  return (
    <>
      <div className="drawer-overlay" onClick={onClose} />
      <div className="drawer">
        <div className="drawer-header">
          <h2 className="drawer-title">{t.backgroundSettings}</h2>
          <button onClick={onClose} className="close-button">
            <X size={20} />
          </button>
        </div>

        <div className="drawer-content">
          <div className="form-group">
            <label>{t.labelRequired}</label>
            <input
              type="text"
              value={localSettings?.title || ""}
              onChange={(e) => setLocalSettings(settings => ({ ...settings, title: e.target.value }))}
              placeholder={t.placeholderNodeLabel}
            />
          </div>
          <div className="form-group">
            <label>{t.languageLabel}</label>
            <select
              value={localSettings?.language || "en"}
              onChange={(e) => setLocalSettings(settings => ({ ...settings, language: e.target.value }))}
            >
              <option value="en">{t.languageEnglish}</option>
              <option value="de">{t.languageGerman}</option>
            </select>
          </div>
          <div className="form-group">
            <ColorSelector
              label={t.backgroundColor}
              value={localSettings?.background?.color || "#ffffff"}
              onChange={color => setLocalSettings(settings => ({ ...settings, background: { ...settings.background, color } }))}
            />
          </div>
        </div>

        <div className="drawer-footer">
          <button onClick={handleSave} className="primary-button">
            <Save size={16} /> {t.saveChanges}
          </button>
        </div>
      </div>
    </>
  );
};
