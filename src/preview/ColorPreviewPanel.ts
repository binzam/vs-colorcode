import * as vscode from 'vscode';
import { Theme } from '../utils/types';
import { fetchThemes } from '../utils/api';
export class ColorPreviewPanel {
  public static async show(color: string, extensionUri: vscode.Uri) {
    const panel = vscode.window.createWebviewPanel(
      'colorPreview',
      `Theme Preview`,
      vscode.ViewColumn.One,
      {
        enableScripts: true,
      }
    );
    panel.webview.html = this.getLoadingHtml(panel.webview, extensionUri);
    panel.iconPath = vscode.Uri.joinPath(
      extensionUri,
      'media',
      'icons',
      'color-store-logo.png'
    );
    
    try {
      const { mainColor, themes } = await fetchThemes(color);

      if (themes.length > 0) {
        panel.webview.html = this.getHtml(
          mainColor,
          themes,
          panel.webview,
          extensionUri
        );
      } else {
           panel.webview.html = this.getErrorHtml('No theme suggestions were returned.');
        vscode.window.showErrorMessage('Failed to load themes.');
      }
    } catch (error) {
      panel.webview.html = this.getErrorHtml('Failed to load theme suggestions from the server.');
      vscode.window.showErrorMessage('Error loading themes.');
    }
  }
  private static getLoadingHtml(
    webview: vscode.Webview,
    extensionUri: vscode.Uri
  ): string {
    const stylePath = vscode.Uri.joinPath(
      extensionUri,
      'media',
      'styles',
      'loadingStyles.css'
    );
    const styleUri = webview.asWebviewUri(stylePath);
    return /*html*/ `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Loading Preview...</title>
         <link href="${styleUri}" rel="stylesheet">
          <style>
          body {  display: flex;
  align-items: center;
  justify-content: center; }
        </style>
    </head>
    <body>
    <div class="loader-container">
      <h2>Generating Theme Suggestions</h2>
      <p>Please wait...</p>
      <div class="loader"></div>
      </div>
    </body>
    </html>
  `;
  }
private static getErrorHtml(message: string): string {
  return /*html*/ `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Error Loading Themes</title>
      <style>
        body {
          font-family: sans-serif;
          background-color: var(--vscode-editor-background, #1e1e1e);
          color: var(--vscode-editor-foreground, #cccccc);
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100vh;
          text-align: center;
        }
        .error-container {
          max-width: 600px;
          padding: 2rem;
        }
        h2 {
          color: var(--vscode-editorError-foreground, red);
        }
      </style>
    </head>
    <body>
      <div class="error-container">
        <h2>Oops! Something went wrong.</h2>
        <p>${message}</p>
        <p>Please try again or check your internet connection.</p>
      </div>
    </body>
    </html>
  `;
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
    const fontUri = webview.asWebviewUri(
      vscode.Uri.joinPath(extensionUri, 'media', 'fonts', 'Inter-Regular.woff2')
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
    <p class="color-role" ><span class="role-color">${mainColor}</span>
     as ${theme.role}
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
              <style>
          @font-face {
            font-family: 'Inter';
            src: url('${fontUri}') format('woff2');
            font-weight: normal;
            font-style: normal;
            font-display: swap;
          }
          body { font-family: 'Inter', sans-serif; }
        </style>
      </head>
      <body>
         <div class="preview-header">
       <h2>Color theme suggestions</h2>
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
