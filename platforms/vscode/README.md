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

The extension provides configurable keyboard shortcuts for all editor commands:

| Command | Default Shortcut (Win/Linux) | Default Shortcut (Mac) | Description |
|---------|------------------------------|------------------------|-------------|
| Show Source | `Ctrl+K Ctrl+S` | `Cmd+K Cmd+S` | Switch to JSON source view |
| Add Task Node | `Ctrl+1` | `Cmd+1` | Add a task node |
| Add Topic Node | `Ctrl+2` | `Cmd+2` | Add a topic node |
| Add Image Node | `Ctrl+3` | `Cmd+3` | Add an image node |
| Add Text Node | `Ctrl+4` | `Cmd+4` | Add a text node |
| Undo | `Ctrl+Z` | `Cmd+Z` | Undo last action |
| Redo | `Ctrl+Y` | `Cmd+Y` | Redo last action |
| Toggle Preview | `Ctrl+P` | `Cmd+P` | Toggle preview mode |
| Toggle Debug | `Ctrl+D` | `Cmd+D` | Toggle debug mode |
| Zoom In | `Ctrl+=` | `Cmd+=` | Zoom in |
| Zoom Out | `Ctrl+-` | `Cmd+-` | Zoom out |
| Reset Zoom | `Ctrl+0` | `Cmd+0` | Reset zoom to 100% |
| Toggle Grid | `Ctrl+'` | `Cmd+'` | Toggle grid visibility |
| Reset Map | `Ctrl+Delete` | `Cmd+Delete` | Reset entire map (with confirmation) |
| Cut | `Ctrl+X` | `Cmd+X` | Cut selected nodes |
| Copy | `Ctrl+C` | `Cmd+C` | Copy selected nodes |
| Paste | `Ctrl+V` | `Cmd+V` | Paste nodes |
| Select All | `Ctrl+A` | `Cmd+A` | Select all nodes |
| Fit View | `Shift+1` | `Shift+1` | Fit all nodes in view |
| Zoom to Selection | `Shift+2` | `Shift+2` | Zoom to selected nodes |
| Delete Selected | `Delete` | `Delete` | Delete selected nodes or edge |
| Show Help | `Ctrl+Shift+/` | `Cmd+Shift+/` | Show keyboard shortcuts help |

**Customizing Shortcuts:**

All keyboard shortcuts are fully customizable through VS Code's keyboard shortcuts editor:

1. Open VS Code Keyboard Shortcuts editor: `Ctrl+K Ctrl+S` (Windows/Linux) or `Cmd+K Cmd+S` (Mac)
2. Search for "Learningmap" to see all available commands
3. Click on the pencil icon next to any command to change its shortcut
4. Or right-click on a command to add additional keybindings

**Note:** The shortcuts work through VS Code's command system, allowing you to customize them per your preferences or resolve conflicts with other extensions.

## Requirements

- VS Code 1.80.0 or higher

## License

MIT
