import React, { useEffect } from "react";
import { X, Trash2, RefreshCw } from "lucide-react";
import { Panel, useReactFlow } from "@xyflow/react";
import { Settings } from "./types";
import { ColorSelector } from "./ColorSelector";
import { getTranslations } from "./translations";
import { useEditorStore } from "./editorStore";
import { generateRandomId } from "./helper";

interface SettingsPanelProps {
  defaultLanguage?: string;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  defaultLanguage = "en",
}) => {
  // Get state from store
  const isOpen = useEditorStore(state => state.settingsDrawerOpen);
  const settings = useEditorStore(state => state.settings);
  const edges = useEditorStore(state => state.edges);
  const setEdges = useEditorStore(state => state.setEdges);

  // Get actions from store
  const setSettingsDrawerOpen = useEditorStore(state => state.setSettingsDrawerOpen);
  const setSettings = useEditorStore(state => state.setSettings);

  const language = settings?.language || defaultLanguage;
  const t = getTranslations(language);

  const { getViewport } = useReactFlow();

  const onClose = () => setSettingsDrawerOpen(false);

  if (!isOpen) return null;

  const handleFieldChange = (updates: Partial<Settings>) => {
    setSettings({ ...settings, ...updates });
  };

  const handleUseCurrentViewport = () => {
    const viewport = getViewport();
    handleFieldChange({
      viewport: {
        x: Math.round(viewport.x),
        y: Math.round(viewport.y),
        zoom: parseFloat(viewport.zoom.toFixed(2)),
      }
    });
  };

  const handleUpdateAllEdges = () => {
    const defaultType = settings?.defaultEdgeType || "default";
    const defaultColor = settings?.defaultEdgeColor || "#94a3b8";
    
    const updatedEdges = edges.map(edge => ({
      ...edge,
      type: defaultType,
      style: {
        ...edge.style,
        stroke: defaultColor,
      }
    }));
    
    setEdges(updatedEdges);
  };

  return (
    <Panel position="center-right" className="editor-panel">
      <div className="panel-inner">
        <div className="panel-header">
          <h2 className="panel-title">{t.backgroundSettings}</h2>
          <button onClick={onClose} className="close-button">
            <X size={20} />
          </button>
        </div>

        <div className="panel-content">
          <div className="form-group">
            <label>{t.labelRequired}</label>
            <input
              type="text"
              value={settings?.title || ""}
              onChange={(e) => handleFieldChange({ title: e.target.value })}
              placeholder={t.placeholderTitleLabel}
            />
          </div>
          <div className="form-group">
            <label>{t.languageLabel}</label>
            <select
              value={settings?.language || "en"}
              onChange={(e) => handleFieldChange({ language: e.target.value })}
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
                value={settings?.id || ""}
                onChange={(e) => handleFieldChange({ id: e.target.value })}
                placeholder="Optional"
                style={{ flex: 1 }}
              />
              <button
                onClick={() => handleFieldChange({ id: generateRandomId() })}
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
              value={settings?.background?.color || "#ffffff"}
              onChange={color => handleFieldChange({ background: { ...settings.background, color } })}
            />
          </div>

          <div className="form-group">
            <label>{t.initialViewport}</label>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '8px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '0.875rem', color: '#666' }}>{t.viewportX}</label>
                <input
                  type="number"
                  value={settings?.viewport?.x ?? 0}
                  onChange={(e) => handleFieldChange({
                    viewport: { ...settings.viewport, x: parseFloat(e.target.value) || 0, y: settings.viewport?.y ?? 0, zoom: settings.viewport?.zoom ?? 1 }
                  })}
                  style={{ width: '100%' }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '0.875rem', color: '#666' }}>{t.viewportY}</label>
                <input
                  type="number"
                  value={settings?.viewport?.y ?? 0}
                  onChange={(e) => handleFieldChange({
                    viewport: { ...settings.viewport, y: parseFloat(e.target.value) || 0, x: settings.viewport?.x ?? 0, zoom: settings.viewport?.zoom ?? 1 }
                  })}
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
                  value={settings?.viewport?.zoom ?? 1}
                  onChange={(e) => handleFieldChange({
                    viewport: { ...settings.viewport, zoom: parseFloat(e.target.value) || 1, x: settings.viewport?.x ?? 0, y: settings.viewport?.y ?? 0 }
                  })}
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

          <div className="form-group">
            <label>Default Edge Type</label>
            <select
              value={settings?.defaultEdgeType || "default"}
              onChange={(e) => handleFieldChange({ defaultEdgeType: e.target.value })}
            >
              <option value="default">Default</option>
              <option value="straight">Straight</option>
              <option value="step">Step</option>
              <option value="smoothstep">Smooth Step</option>
              <option value="simplebezier">Simple Bezier</option>
            </select>
          </div>

          <div className="form-group">
            <ColorSelector
              label="Default Edge Color"
              value={settings?.defaultEdgeColor || "#94a3b8"}
              onChange={color => handleFieldChange({ defaultEdgeColor: color })}
            />
          </div>

          <div className="form-group">
            <button
              onClick={handleUpdateAllEdges}
              className="secondary-button"
              style={{ width: '100%' }}
              type="button"
            >
              Update All Edges to Default Settings
            </button>
          </div>
        </div>
      </div>
    </Panel>
  );
};
