import React from "react";
import { Menu, MenuButton, MenuDivider, MenuItem, SubMenu } from "@szhsin/react-menu";
import "@szhsin/react-menu/dist/index.css";
import '@szhsin/react-menu/dist/transitions/zoom.css';
import { Plus, Bug, Settings, Eye, Menu as MenuI, FolderOpen, Download, ImageDown, ExternalLink, Share2, RotateCcw } from "lucide-react";
import { getTranslations } from "./translations";
import { useEditorStore } from "./editorStore";
import { Node } from "@xyflow/react";
import { NodeData } from "./types";
import { useJsonStore } from "./useJsonStore";

interface EditorToolbarProps {
  defaultLanguage?: string;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({
  defaultLanguage = "en",
}) => {
  // Get state directly from store
  const settings = useEditorStore(state => state.settings);
  const debugMode = useEditorStore(state => state.debugMode);
  const previewMode = useEditorStore(state => state.previewMode);
  const showCompletionNeeds = useEditorStore(state => state.showCompletionNeeds);
  const showCompletionOptional = useEditorStore(state => state.showCompletionOptional);
  const showUnlockAfter = useEditorStore(state => state.showUnlockAfter);

  // Get actions directly from store
  const setDebugMode = useEditorStore(state => state.setDebugMode);
  const setPreviewMode = useEditorStore(state => state.setPreviewMode);
  const setShowCompletionNeeds = useEditorStore(state => state.setShowCompletionNeeds);
  const setShowCompletionOptional = useEditorStore(state => state.setShowCompletionOptional);
  const setShowUnlockAfter = useEditorStore(state => state.setShowUnlockAfter);
  const addNode = useEditorStore(state => state.addNode);
  const setSettingsDrawerOpen = useEditorStore(state => state.setSettingsDrawerOpen);
  const getRoadmapData = useEditorStore(state => state.getRoadmapData);
  const reset = useEditorStore(state => state.reset);

  const [_, postToJsonStore] = useJsonStore();;

  const language = settings?.language || defaultLanguage;
  const t = getTranslations(language);

  const onToggleDebugMode = () => setDebugMode(!debugMode);
  const onTogglePreviewMode = () => setPreviewMode(!previewMode);
  const onSetShowCompletionNeeds = (checked: boolean) => setShowCompletionNeeds(checked);
  const onSetShowCompletionOptional = (checked: boolean) => setShowCompletionOptional(checked);
  const onSetShowUnlockAfter = (checked: boolean) => setShowUnlockAfter(checked);

  const onAddNewNode = (type: "task" | "topic" | "image" | "text") => {
    const position = { x: Math.random() * 500, y: Math.random() * 500 };
    const newNode: Node<NodeData> = {
      id: `node-${Date.now()}`,
      type,
      position,
      data: {
        label: type === "task" ? t.newTask : type === "topic" ? t.newTopic : type,
        state: "unlocked",
      },
    };
    addNode(newNode);
  };

  const onOpenSettingsDrawer = () => setSettingsDrawerOpen(true);

  const onDownload = () => {
    const roadmapData = getRoadmapData();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(roadmapData, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "learningmap.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const onOpen = () => {
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
            useEditorStore.getState().loadRoadmapData(data);
          } catch (error) {
            console.error("Failed to parse JSON file", error);
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const onReset = () => {
    if (confirm(t.resetMapWarning)) {
      reset();
    }
  };

  return (
    <div className="editor-toolbar">
      <div className="toolbar-group">
        <Menu menuButton={<MenuButton disabled={previewMode} className="toolbar-button"><Plus size={16} /> <span className="toolbar-label">{t.nodes}</span></MenuButton>}>
          <MenuItem onClick={() => onAddNewNode("task")}>
            <span>{t.addTask}</span>
            <span style={{ marginLeft: 'auto', paddingLeft: '16px', color: '#9ca3af', fontSize: '0.875rem' }}>Ctrl+1</span>
          </MenuItem>
          <MenuItem onClick={() => onAddNewNode("topic")}>
            <span>{t.addTopic}</span>
            <span style={{ marginLeft: 'auto', paddingLeft: '16px', color: '#9ca3af', fontSize: '0.875rem' }}>Ctrl+2</span>
          </MenuItem>
          <MenuItem onClick={() => onAddNewNode("image")}>
            <span>{t.addImage}</span>
            <span style={{ marginLeft: 'auto', paddingLeft: '16px', color: '#9ca3af', fontSize: '0.875rem' }}>Ctrl+3</span>
          </MenuItem>
          <MenuItem onClick={() => onAddNewNode("text")}>
            <span>{t.addText}</span>
            <span style={{ marginLeft: 'auto', paddingLeft: '16px', color: '#9ca3af', fontSize: '0.875rem' }}>Ctrl+4</span>
          </MenuItem>
        </Menu>
        <button disabled={previewMode} onClick={onOpenSettingsDrawer} className="toolbar-button">
          <Settings size={16} /> <span className="toolbar-label">{t.settings}</span>
        </button>
      </div>
      <div className="toolbar-group">
        <Menu menuButton={<MenuButton className="toolbar-button"><MenuI /></MenuButton>}>
          <MenuItem onClick={onOpen}>
            <FolderOpen size={16} /> <span>{t.open}</span>
          </MenuItem>
          <MenuItem onClick={onDownload}>
            <Download size={16} /> <span>{t.download}</span>
          </MenuItem>
          <MenuItem onClick={postToJsonStore}>
            <Share2 size={16} /> <span>{t.share}</span>
          </MenuItem>
          <MenuDivider />
          <MenuItem onClick={onReset}>
            <RotateCcw size={16} /> <span>{t.reset}</span>
            <span style={{ marginLeft: 'auto', paddingLeft: '16px', color: '#9ca3af', fontSize: '0.875rem' }}>Ctrl+Del</span>
          </MenuItem>
          <MenuDivider />
          <SubMenu className={`${debugMode ? "active" : ""}`} label={<><Bug size={16} /> <span>{t.debug}</span></>}>
            <MenuItem type="checkbox" checked={debugMode} onClick={onToggleDebugMode}>
              <span>{t.enableDebugMode}</span>
              <span style={{ marginLeft: 'auto', paddingLeft: '16px', color: '#9ca3af', fontSize: '0.875rem' }}>Ctrl+D</span>
            </MenuItem>
            <MenuItem type="checkbox" checked={showCompletionNeeds} onClick={e => onSetShowCompletionNeeds(e.checked ?? false)} disabled={!debugMode}>
              {t.showCompletionNeedsEdges}
            </MenuItem>
            <MenuItem type="checkbox" checked={showCompletionOptional} onClick={e => onSetShowCompletionOptional(e.checked ?? false)} disabled={!debugMode}>
              {t.showCompletionOptionalEdges}
            </MenuItem>
            <MenuItem type="checkbox" checked={showUnlockAfter} onClick={e => onSetShowUnlockAfter(e.checked ?? false)} disabled={!debugMode}>
              {t.showUnlockAfterEdges}
            </MenuItem>
          </SubMenu>
          <MenuItem onClick={onTogglePreviewMode} className={`${previewMode ? "active" : ""}`}>
            <Eye size={16} /> <span>{t.preview}</span>
            <span style={{ marginLeft: 'auto', paddingLeft: '16px', color: '#9ca3af', fontSize: '0.875rem' }}>Ctrl+P</span>
          </MenuItem>
          <MenuDivider />
          <MenuItem href="https://openpatch.org" target="_blank" rel="noopener noreferrer">
            <ExternalLink size={16} /> <span>OpenPatch</span>
          </MenuItem>
          <MenuItem href="https://github.com/openpatch/learningmap" target="_blank" rel="noopener noreferrer">
            <ExternalLink size={16} /> <span>GitHub</span>
          </MenuItem>
          <MenuItem href="https://fosstodon.org/@openpatch" target="_blank" rel="noopener noreferrer">
            <ExternalLink size={16} /> <span>Mastodon</span>
          </MenuItem>
        </Menu>
      </div>
    </div>
  );
};
