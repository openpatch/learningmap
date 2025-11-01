# Learningmap VS Code Extension Development

This directory contains the VS Code extension for editing `.learningmap` files.

## Architecture

The extension consists of two main parts:

1. **Extension Host** (`src/extension.ts`, `src/LearningmapEditorProvider.ts`): Runs in Node.js and manages the VS Code integration
2. **Webview** (`src/webview.tsx`): Runs in a browser context and hosts the React-based LearningMapEditor

### Extension Host

- Registers a custom editor for `.learningmap` files
- Provides a command to create new learningmap files
- Manages file I/O and document synchronization
- Communicates with the webview via message passing

### Webview

- Renders the LearningMapEditor React component
- Syncs state with the editor store (Zustand)
- Sends save messages to the extension host on changes (debounced)
- Receives update messages when the file changes externally

## Building

```bash
# From the root of the repository
pnpm build

# Or build just the vscode extension
pnpm --filter learningmap-vscode build
```

The build process:
1. Compiles TypeScript and bundles extension code with esbuild (target: Node.js)
2. Bundles webview code with esbuild (target: Browser)
3. Copies CSS from the learningmap package

## Development

```bash
# Watch mode for development
pnpm --filter learningmap-vscode watch
```

To test the extension:
1. Open VS Code
2. Press F5 to launch Extension Development Host
3. Open or create a `.learningmap` file
4. The visual editor should appear

## File Format

Learningmap files are JSON files with the `.learningmap` extension. The structure includes:

- `nodes`: Array of nodes (topics, tasks, text, images)
- `edges`: Array of connections between nodes
- `settings`: Map settings (background color, title, etc.)
- `version`: Schema version
- `type`: Always "learningmap"

## Limitations

Some features from the web platform may not work in the VS Code webview:

- **Share functionality**: Uses `window.location` which doesn't work in webviews
- **External JSON store**: Loading from external IDs via URL hash won't work

These are optional features and don't affect core editing capabilities.

## Packaging

To create a `.vsix` package for distribution:

```bash
cd platforms/vscode
pnpm package
```

This requires the extension to be built first.
