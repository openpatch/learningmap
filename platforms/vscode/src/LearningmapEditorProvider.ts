import * as vscode from 'vscode';

/**
 * Provider for learningmap custom editor.
 * Handles the webview that displays the LearningMapEditor component.
 */
export class LearningmapEditorProvider implements vscode.CustomTextEditorProvider {
  private static readonly viewType = 'learningmap.editor';

  constructor(private readonly context: vscode.ExtensionContext) {}

  /**
   * Called when our custom editor is opened.
   */
  public async resolveCustomTextEditor(
    document: vscode.TextDocument,
    webviewPanel: vscode.WebviewPanel,
    _token: vscode.CancellationToken
  ): Promise<void> {
    // Setup initial webview content
    webviewPanel.webview.options = {
      enableScripts: true,
    };
    webviewPanel.webview.html = this.getHtmlForWebview(webviewPanel.webview);

    // Track if we're currently updating from external changes
    let isUpdatingFromDocument = false;

    // Hook up event handlers
    const updateWebview = () => {
      isUpdatingFromDocument = true;
      webviewPanel.webview.postMessage({
        type: 'update',
        content: document.getText(),
      });
      // Reset flag after a short delay
      setTimeout(() => {
        isUpdatingFromDocument = false;
      }, 100);
    };

    // Send initial content
    updateWebview();

    // Listen for changes in the document (from external sources)
    const changeDocumentSubscription = vscode.workspace.onDidChangeTextDocument(e => {
      if (e.document.uri.toString() === document.uri.toString() && e.contentChanges.length > 0) {
        // Only update if change was from external source (not from us)
        if (!isUpdatingFromDocument) {
          updateWebview();
        }
      }
    });

    // Listen for messages from the webview
    webviewPanel.webview.onDidReceiveMessage(async e => {
      switch (e.type) {
        case 'save':
          if (!isUpdatingFromDocument) {
            await this.saveDocument(document, e.content);
          }
          return;
        case 'ready':
          // Webview is ready, send initial content
          updateWebview();
          return;
      }
    });

    // Clean up
    webviewPanel.onDidDispose(() => {
      changeDocumentSubscription.dispose();
    });
  }

  /**
   * Write out the JSON to a given document.
   */
  private async saveDocument(document: vscode.TextDocument, json: any): Promise<void> {
    const edit = new vscode.WorkspaceEdit();

    // Format the JSON with 2-space indentation
    const text = JSON.stringify(json, null, 2);

    // Replace the entire document
    edit.replace(
      document.uri,
      new vscode.Range(0, 0, document.lineCount, 0),
      text
    );

    await vscode.workspace.applyEdit(edit);
  }

  /**
   * Get the static HTML for the webview.
   */
  private getHtmlForWebview(webview: vscode.Webview): string {
    // Get URIs for scripts and styles
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.context.extensionUri, 'dist', 'webview.js')
    );
    const styleUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.context.extensionUri, 'dist', 'webview.css')
    );

    // Use a nonce to only allow specific scripts to be run
    const nonce = getNonce();

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}'; img-src ${webview.cspSource} data: https:; font-src ${webview.cspSource} data:;">
  <link href="${styleUri}" rel="stylesheet">
  <title>Learningmap Editor</title>
  <style>
    html, body {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      overflow: hidden;
    }
    #root {
      width: 100%;
      height: 100%;
    }
  </style>
</head>
<body>
  <div id="root"></div>
  <script nonce="${nonce}" src="${scriptUri}"></script>
</body>
</html>`;
  }
}

function getNonce() {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}
