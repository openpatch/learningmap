import React, { useState, useEffect } from "react";
import { X, Save, RefreshCw } from "lucide-react";
import { Settings } from "./types";
import { ColorSelector } from "./ColorSelector";
import { getTranslations } from "./translations";
import { useReactFlow } from "@xyflow/react";
import { useEditorStore } from "./editorStore";
import { generateRandomId } from "./helper";

interface SettingsDrawerProps {
  defaultLanguage?: string;
}

export const SettingsDrawer: React.FC<SettingsDrawerProps> = ({
  defaultLanguage = "en",
}) => {
  // Get state from store
  const isOpen = useEditorStore(state => state.settingsDrawerOpen);
  const settings = useEditorStore(state => state.settings);

  // Get actions from store
  const setSettingsDrawerOpen = useEditorStore(state => state.setSettingsDrawerOpen);
  const setSettings = useEditorStore(state => state.setSettings);

  const language = settings?.language || defaultLanguage;
  const t = getTranslations(language);

  const [localSettings, setLocalSettings] = useState<Settings>(settings);
  const { getViewport } = useReactFlow();

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const onClose = () => setSettingsDrawerOpen(false);

  const onUpdate = (s: Settings) => {
    setSettings(s);
  };

  if (!isOpen) return null;

  const handleSave = () => {
    onUpdate(localSettings);
    onClose();
  };

  const handleUseCurrentViewport = () => {
    const viewport = getViewport();
    setLocalSettings(settings => ({
      ...settings,
      viewport: {
        x: Math.round(viewport.x),
        y: Math.round(viewport.y),
        zoom: parseFloat(viewport.zoom.toFixed(2)),
      }
    }));
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
              placeholder={t.placeholderTitleLabel}
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
            <label>{t.storageId}</label>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              <input
                type="text"
                value={localSettings?.id || ""}
                onChange={(e) => setLocalSettings(settings => ({ ...settings, id: e.target.value }))}
                placeholder="Optional"
                style={{ flex: 1 }}
              />
              <button
                onClick={() => setLocalSettings(settings => ({ ...settings, id: generateRandomId() }))}
                className="secondary-button"
                type="button"
                style={{ padding: '8px 12px', width: "auto", display: 'flex', alignItems: 'center', gap: '4px' }}
                title={t.generateRandomId}
              >
                <RefreshCw size={16} />
              </button>
            </div>
            <p style={{ fontSize: '0.875rem', color: '#666', margin: 0, fontStyle: 'italic' }}>
              ℹ️ {t.storageIdHint}
            </p>
          </div>

          <div className="form-group">
            <ColorSelector
              label={t.backgroundColor}
              value={localSettings?.background?.color || "#ffffff"}
              onChange={color => setLocalSettings(settings => ({ ...settings, background: { ...settings.background, color } }))}
            />
          </div>

          <div className="form-group">
            <label>{t.initialViewport}</label>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '8px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '0.875rem', color: '#666' }}>{t.viewportX}</label>
                <input
                  type="number"
                  value={localSettings?.viewport?.x ?? 0}
                  onChange={(e) => setLocalSettings(settings => ({
                    ...settings,
                    viewport: { ...settings.viewport, x: parseFloat(e.target.value) || 0, y: settings.viewport?.y ?? 0, zoom: settings.viewport?.zoom ?? 1 }
                  }))}
                  style={{ width: '100%' }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '0.875rem', color: '#666' }}>{t.viewportY}</label>
                <input
                  type="number"
                  value={localSettings?.viewport?.y ?? 0}
                  onChange={(e) => setLocalSettings(settings => ({
                    ...settings,
                    viewport: { ...settings.viewport, y: parseFloat(e.target.value) || 0, x: settings.viewport?.x ?? 0, zoom: settings.viewport?.zoom ?? 1 }
                  }))}
                  style={{ width: '100%' }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '0.875rem', color: '#666' }}>{t.viewportZoom}</label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  max="10"
                  value={localSettings?.viewport?.zoom ?? 1}
                  onChange={(e) => setLocalSettings(settings => ({
                    ...settings,
                    viewport: { ...settings.viewport, zoom: parseFloat(e.target.value) || 1, x: settings.viewport?.x ?? 0, y: settings.viewport?.y ?? 0 }
                  }))}
                  style={{ width: '100%' }}
                />
              </div>
            </div>
            <button
              onClick={handleUseCurrentViewport}
              className="secondary-button"
              style={{ marginTop: '8px', width: '100%' }}
              type="button"
            >
              {t.useCurrentViewport}
            </button>
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
