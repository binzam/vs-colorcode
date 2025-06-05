import * as vscode from 'vscode';
import { getContrastColor } from '../utils/colorUtils';

export class ColorPreviewPanel {
  static show(color: string, extensionUri: vscode.Uri) {
    const panel = vscode.window.createWebviewPanel(
      'colorPreview',
      `Color Preview: ${color}`,
      vscode.ViewColumn.One,
      { enableScripts: false }
    );
    panel.webview.html = this.getHtml(color);
  }

  private static getHtml(color: string): string {
    const textColor = color.startsWith('#') ? getContrastColor(color) : 'black';
    return /*html*/ `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>Color Preview</title>
        <style>
      body { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #1e1e1e; }
      .color-label {
        margin-bottom: 24px;
        color: #fff;
        font-family: 'Inter', sans-serif;
        font-size: 1.2em;
        letter-spacing: 1px;
        text-align: center;
      }
      .color-box {
        width: 300px;
        height: 120px;
        border-radius: 12px;
        box-shadow: 0 2px 16px rgba(0,0,0,0.2);
         background: ${color};
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2em;
      color: ${textColor};
        border: 2px solid #fff;
        margin-bottom: 32px;
        }
        .color-text {
        margin-bottom: 32px;
        width: 300px;
        height: 120px;
        border-radius: 12px;
        box-shadow: 0 2px 16px rgba(0,0,0,0.2);
        background: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 2em;
        color: ${color};
        border: 2px solid #fff;
      }
      .color-text.bold{
        font-weight: bold;
      }
    </style>
      </head>
      <body>
    <div class="color-label">Preview: <b>${color}</b></div>
    <div class="color-box">Background</div>
    <div class="color-text">Regular Text</div>
    <div class="color-text bold">Bold Text</div>
  </body>
      </html>
    `;
  }
}
