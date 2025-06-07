import * as vscode from 'vscode';
import { Theme } from '../utils/types';
export class ColorPreviewPanel {
  static show(mainColor: string, themes: Theme[], extensionUri: vscode.Uri) {
    const panel = vscode.window.createWebviewPanel(
      'colorPreview',
      `Theme Preview`,
      vscode.ViewColumn.One,
      { enableScripts: true }
    );
    panel.webview.html = this.getHtml(
      mainColor,
      themes,
      panel.webview,
      extensionUri
    );
  }

  private static getHtml(
    mainColor: string,
    themes: Theme[],
    webview: vscode.Webview,
    extensionUri: vscode.Uri
  ): string {
    const stylePath = vscode.Uri.joinPath(
      extensionUri,
      'media',
      'styles',
      'previewStyles.css'
    );
    const styleUri = webview.asWebviewUri(stylePath);
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(extensionUri, 'media', 'scripts', 'preview.js')
    );
    const themeHtml = themes
      .map(
        (theme) => /*html*/ `
    <div class="theme-row">
    <div class="theme-header">
    <div class="color-swatch-header" style="background: ${mainColor}"></div>
    <p class="color-role" style="color: ${mainColor};" >
    ${mainColor} as ${theme.role}
    </p>
    </div>
    <div class="theme-swatch-wrapper">
    <div class="color-swatch-container">

            <div class="swatch-label-wrapper"  data-color="${theme.background}">
            <div class="code-swatch-col">
            <span class="color-label">Bg</span>
            <p class="color-code">${theme.background}</p>
            </div>
            <div class="color-swatch" style="background: ${theme.background}"></div>
            <div class="swatch-overlay"></div>
            </div>

            <div class="swatch-label-wrapper"  data-color="${theme.text}">
            <div class="code-swatch-col">
            <span class="color-label">Text</span>
            <p class="color-code">${theme.text}</p>
            </div>
            <div class="color-swatch" style="background: ${theme.text}"></div>
            <div class="swatch-overlay"></div>

            </div>

            <div class="swatch-label-wrapper"  data-color="${theme.accent}">
            <div class="code-swatch-col">
            <span class="color-label">Accent</span>
            <p class="color-code">${theme.accent}</p>
            </div>
            <div class="color-swatch" style="background: ${theme.accent}"></div>
            <div class="swatch-overlay"></div>

            </div>         
            
        </div>
    <div class="theme-card-main" style="background: ${theme.background}; color: ${theme.text}">
        <h3>${theme.name}</h3>
        <p>${theme.description}</p>
        <button class="theme-card-btn" style="background: ${theme.accent};">
        
        <span class="theme-card-btn-label"  style="background: ${theme.background}; color: ${theme.text}"></span> 
        
        </button>
        
    </div>
    </div>
    </div>
  `
      )
      .join('');

    return /*html*/ `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Theme Preview</title>
              <link href="${styleUri}" rel="stylesheet">
      </head>
      <body>
         <div class="preview-header">
       <h2>Color theme suggestions</h2>
      <p>These themes complement your color <strong><small>*${mainColor}*</small></strong> </p>
      <p>You can copy any of the color by hovering over them.</p>
      </div>
        <div class="theme-container"  id="themeContainer">
           <div class="bg-control">
        <label for="bg-picker">Change background</label>
        <input type="color" id="bg-picker" value="#ffffff" title="Choose background color">
      </div>
        ${themeHtml}</div>
        
        <script type="module" src="${scriptUri}"></script>

      </body>
      </html>
    `;
  }
}
