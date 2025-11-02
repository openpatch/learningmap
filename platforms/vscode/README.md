# Learningmap VS Code Extension

Visual editor for `.learningmap` files in VS Code.

## Features

- **Custom Editor**: Opens `.learningmap` files with a visual editor
- **Create New**: Command to create new learningmap files
- **Auto-save**: Changes are automatically saved to the file
- **Empty File Support**: Can open and edit empty `.learningmap` files

## Usage

### Opening a Learningmap File

Simply open any file with the `.learningmap` extension, and the visual editor will automatically open.

### Creating a New Learningmap

1. Open the Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P`)
2. Run the command `Learningmap: New Learningmap`
3. Enter a name for your learningmap
4. The editor will open automatically

### Editing

Use the visual editor to:
- Add nodes (topics, tasks, text, images)
- Connect nodes with edges
- Configure node properties
- Set up completion and unlock conditions
- Preview your learningmap

Changes are automatically saved to the file.

### Viewing Source

To view or edit the JSON source of a learningmap:

1. Open the Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P`)
2. Run the command `Learningmap: Show Source`
3. Or use the keyboard shortcut: `Ctrl+K Ctrl+S` (Windows/Linux) or `Cmd+K Cmd+S` (Mac)

### Keyboard Shortcuts

The extension provides a configurable keyboard shortcut:

| Command | Default Shortcut | Description |
|---------|-----------------|-------------|
| Show Source | `Ctrl+K Ctrl+S` (Windows/Linux)<br>`Cmd+K Cmd+S` (Mac) | Switch to JSON source view |

**Note:** All keyboard shortcuts within the editor (like adding nodes, undo/redo, etc.) work as documented in the learningmap editor and are handled by the visual editor itself.

To customize keyboard shortcuts:
1. Open VS Code Keyboard Shortcuts editor (`Ctrl+K Ctrl+S` or `Cmd+K Cmd+S`)
2. Search for "Learningmap"
3. Click on the pencil icon next to the command to change the shortcut

## Requirements

- VS Code 1.80.0 or higher

## License

MIT
