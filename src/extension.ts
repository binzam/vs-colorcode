import * as vscode from 'vscode';
import { ColorPreviewPanel } from './preview/ColorPreviewPanel';
import { ColorPickerViewProvider } from './webview/ColorPickerViewProvider';

export function activate(context: vscode.ExtensionContext) {
  const provider = new ColorPickerViewProvider(context.extensionUri);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider('colorcodestore-view', provider, {
      webviewOptions: {
        retainContextWhenHidden: true,
      },
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      'colorcodestore.previewColor',
      async (color: string) => {
        await ColorPreviewPanel.show(color, context.extensionUri);
      }
    )
  );
}

export function deactivate() {}
