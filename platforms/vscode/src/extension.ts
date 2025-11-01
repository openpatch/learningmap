import * as vscode from 'vscode';
import { LearningmapEditorProvider } from './LearningmapEditorProvider';

export function activate(context: vscode.ExtensionContext) {
  // Register the custom editor provider
  const provider = new LearningmapEditorProvider(context);
  context.subscriptions.push(
    vscode.window.registerCustomEditorProvider(
      'learningmap.editor',
      provider,
      {
        webviewOptions: {
          retainContextWhenHidden: true,
        },
        supportsMultipleEditorsPerDocument: false,
      }
    )
  );

  // Register command to create a new learningmap
  context.subscriptions.push(
    vscode.commands.registerCommand('learningmap.new', async () => {
      const workspaceFolders = vscode.workspace.workspaceFolders;
      if (!workspaceFolders) {
        vscode.window.showErrorMessage('Please open a folder or workspace first');
        return;
      }

      // Ask for filename
      const filename = await vscode.window.showInputBox({
        prompt: 'Enter the name for your new learningmap',
        placeHolder: 'my-learningmap',
        validateInput: (value) => {
          if (!value) {
            return 'Filename is required';
          }
          if (!/^[a-zA-Z0-9_-]+$/.test(value)) {
            return 'Filename can only contain letters, numbers, hyphens, and underscores';
          }
          return null;
        }
      });

      if (!filename) {
        return;
      }

      // Create empty learningmap file
      const uri = vscode.Uri.joinPath(
        workspaceFolders[0].uri,
        `${filename}.learningmap`
      );

      // Initial empty learningmap structure
      const emptyLearningmap = {
        nodes: [],
        edges: [],
        settings: {
          background: { color: '#ffffff' }
        },
        version: 1,
        type: 'learningmap',
        source: 'vscode-extension'
      };

      await vscode.workspace.fs.writeFile(
        uri,
        Buffer.from(JSON.stringify(emptyLearningmap, null, 2), 'utf8')
      );

      // Open the file with our custom editor
      await vscode.commands.executeCommand('vscode.openWith', uri, 'learningmap.editor');
    })
  );

  console.log('Learningmap extension is now active');
}

export function deactivate() {}
