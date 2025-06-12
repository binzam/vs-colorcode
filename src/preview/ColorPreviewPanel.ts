import * as vscode from 'vscode';
import { getFormattedShades } from '../utils/colorUtils';

export class ColorPreviewPanel {
  public static async show(color: string, extensionUri: vscode.Uri) {
    const panel = vscode.window.createWebviewPanel(
      'colorPreview',
      `Color Preview`,
      vscode.ViewColumn.One,
      {
        enableScripts: true,
      }
    );
    panel.iconPath = vscode.Uri.joinPath(
      extensionUri,
      'media',
      'icons',
      'color-store-logo.png'
    );
    panel.webview.html = this.getLoadingHtml(panel.webview, extensionUri);
    try {
      const delay = new Promise((res) => setTimeout(res, 500));
      const shadePromise = getFormattedShades(color);
      const [{ shades }] = await Promise.all([shadePromise, delay]);
      if (shades) {
        panel.webview.html = this.getHtml(
          color,
          shades,
          panel.webview,
          extensionUri
        );
      } else {
        panel.webview.html = this.getErrorHtml(
          'Failed to generate color shades.'
        );
        vscode.window.showErrorMessage('Failed to generate color shades.');
      }
    } catch (error) {
      panel.webview.html = this.getErrorHtml(
        'Unexpected error. Please Try again.'
      );
      vscode.window.showErrorMessage('Unexpected error. Please Try again.');
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
      <h2>Loading Color Preview</h2>
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
    shades: { key: string; value: string }[],
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
    const shadesDisplay = shades
      .map(
        (shade) => /*html*/ `
  <div class="shade-box" style="background: ${shade.value}" data-color="${shade.value}">
    <span class="shade-value">${shade.value}</span>
  </div>`
      )
      .join('');
    const mainColorBlock = /*html*/ `
  <div class="main-color-block" style="background: ${mainColor};">
    <span class="main-color-value">${mainColor}</span>
  </div>
`;
    return /*html*/ `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
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
       <h2>Color Preview</h2>
      <p>You can copy any shade of color by hovering over.</p>
      </div>
      <div class="shades-container">
      
      ${mainColorBlock}
      <div class="shades-grid">
      ${shadesDisplay}
      </div>
      </div>
        <script type="module" src="${scriptUri}"></script>

      </body>
      </html>
    `;
  }
}
