import * as vscode from 'vscode';
import { ColorPreviewPanel } from './preview/ColorPreviewPanel';
import { ColorPickerViewProvider } from './webview/ColorPickerViewProvider';

export function activate(context: vscode.ExtensionContext) {
  const provider = new ColorPickerViewProvider(
    context.extensionUri,
    context.globalState
  );
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider('color-store-view', provider, {
      webviewOptions: {
        retainContextWhenHidden: true,
      },
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      'color-store.previewColor',
      async (color: string) => {
        await ColorPreviewPanel.show(color, context.extensionUri);
      }
    )
  );
}

export function deactivate() {}
