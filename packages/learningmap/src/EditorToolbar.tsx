import React from "react";
import { Menu, MenuButton, MenuDivider, MenuItem, SubMenu } from "@szhsin/react-menu";
import "@szhsin/react-menu/dist/index.css";
import '@szhsin/react-menu/dist/transitions/zoom.css';
import { Plus, Bug, Settings, Eye, Menu as MenuI, FolderOpen, Download, ImageDown, ExternalLink, Share2 } from "lucide-react";
import { getTranslations } from "./translations";

interface EditorToolbarProps {
  debugMode: boolean;
  previewMode: boolean;
  showCompletionNeeds: boolean;
  showCompletionOptional: boolean;
  showUnlockAfter: boolean;
  onToggleDebugMode: () => void;
  onTogglePreviewMode: () => void;
  onSetShowCompletionNeeds: (checked: boolean) => void;
  onSetShowCompletionOptional: (checked: boolean) => void;
  onSetShowUnlockAfter: (checked: boolean) => void;
  onAddNewNode: (type: "task" | "topic" | "image" | "text") => void;
  onOpenSettingsDrawer: () => void;
  onDownlad: () => void;
  onOpen: () => void;
  onShare: () => void;
  language?: string;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({
  debugMode,
  previewMode,
  showCompletionNeeds,
  showCompletionOptional,
  showUnlockAfter,
  onTogglePreviewMode,
  onToggleDebugMode,
  onSetShowCompletionNeeds,
  onSetShowCompletionOptional,
  onSetShowUnlockAfter,
  onAddNewNode,
  onOpenSettingsDrawer,
  onDownlad,
  onOpen,
  onShare,
  language = "en",
}) => {
  const t = getTranslations(language);

  return (
    <div className="editor-toolbar">
      <div className="toolbar-group">
        <Menu menuButton={<MenuButton disabled={previewMode} className="toolbar-button"><Plus size={16} /> <span className="toolbar-label">{t.nodes}</span></MenuButton>}>
          <MenuItem onClick={() => onAddNewNode("task")}>{t.addTask}</MenuItem>
          <MenuItem onClick={() => onAddNewNode("topic")}>{t.addTopic}</MenuItem>
          <MenuItem onClick={() => onAddNewNode("image")}>{t.addImage}</MenuItem>
          <MenuItem onClick={() => onAddNewNode("text")}>{t.addText}</MenuItem>
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
          <MenuItem onClick={onDownlad}>
            <Download size={16} /> <span>{t.download}</span>
          </MenuItem>
          <MenuItem onClick={onShare}>
            <Share2 size={16} /> <span>{t.share}</span>
          </MenuItem>
          <MenuDivider />
          <SubMenu className={`${debugMode ? "active" : ""}`} label={<><Bug size={16} /> <span>{t.debug}</span></>}>
            <MenuItem type="checkbox" checked={debugMode} onClick={onToggleDebugMode}>
              {t.enableDebugMode}
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
