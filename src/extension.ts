import * as vscode from 'vscode';
import { ColorPreviewPanel } from './preview/ColorPreviewPanel';
import { ColorPickerViewProvider } from './webview/ColorPickerViewProvider';
import { fetchThemes } from './utils/api';

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
        const { mainColor, themes } = await fetchThemes(color);
        if (themes.length > 0) {
          ColorPreviewPanel.show(mainColor, themes, context.extensionUri);
        } else {
          vscode.window.showErrorMessage('Failed to load themes.');
        }
      }
    )
  );
}

export function deactivate() {}
