import * as vscode from 'vscode';
export class ColorPreviewPanel {
  static show(themes: any[], extensionUri: vscode.Uri) {
    const panel = vscode.window.createWebviewPanel(
      'colorPreview',
      `Theme Preview`,
      vscode.ViewColumn.One,
      { enableScripts: true }
    );
    panel.webview.html = this.getHtml(themes, panel.webview, extensionUri);
  }

  private static getHtml(
    themes: any[],
    webview: vscode.Webview,
    extensionUri: vscode.Uri
  ): string {
    const themeHtml = themes
      .map(
        (theme) => `
    <div class="theme-card" style="background: ${theme.background}; color: ${theme.text}; padding: 20px; border-radius: 12px; box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2); transition: transform 0.3s ease-in-out; cursor: pointer;">
        <h3 style="font-size: 1.5rem; font-weight: bold; margin-bottom: 10px;">${theme.name}</h3>
        <p style="font-size: 0.9rem; opacity: 0.8;">${theme.description}</p>
        <button style="width: 100%; padding: 12px; border-radius: 8px; font-size: 1rem; font-weight: medium; border: none; cursor: pointer; background: ${theme.accent}; color: ${theme.background}; transition: background 0.3s ease;">Try Theme</button>
        <div class="color-swatch-container" style="display: flex; justify-content: center; gap: 10px; border-top: 1px solid rgba(255, 255, 255, 0.2); padding: 10px; margin-top: 10px;">
            <div class="color-swatch" style="width: 25px; height: 25px; border-radius: 5px; border: 1px solid ${theme.text}; background: ${theme.background};"></div>
            <span style="font-size: 0.8rem; font-weight: bold; margin-top: 5px; color: ${theme.text};">Bg</span>
            <div class="color-swatch" style="width: 25px; height: 25px; border-radius: 5px; border: 1px solid ${theme.accent}; background: ${theme.text};"></div>
            <span style="font-size: 0.8rem; font-weight: bold; margin-top: 5px; color: ${theme.text};">Text</span>
            <div class="color-swatch" style="width: 25px; height: 25px; border-radius: 5px; border: 1px solid ${theme.text}; background: ${theme.accent};"></div>
            <span style="font-size: 0.8rem; font-weight: bold; margin-top: 5px; color: ${theme.text};">Accent</span>
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
        <style>
          body { font-family: Arial, sans-serif; background: #1e1e1e; color: white; padding: 20px; }
          .theme-container { display: flex; flex-direction: column; gap: 10px; }
       
       body {
  font-family: Arial, sans-serif;
  background: #1e1e1e;
  color: white;
  padding: 20px;
}

.theme-container {
  display: flex;
  flex-direction: column;
  gap: 15px;
  max-width: 600px;
  margin: auto;
}

.theme-card {
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
  transition: transform 0.3s ease-in-out;
  cursor: pointer;
}

.theme-card:hover {
  transform: scale(1.02);
}

.theme-card h3 {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 10px;
}

.theme-card p {
  font-size: 0.9rem;
  opacity: 0.8;
}

.button-accent {
  display: block;
  width: 100%;
  padding: 12px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: medium;
  transition: background 0.3s ease;
  border: none;
  cursor: pointer;
}

.button-accent:hover {
  opacity: 0.9;
}

.color-swatch-container {
  display: flex;
  justify-content: center;
  gap: 10px;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  padding: 10px;
  margin-top: 10px;
}

.color-swatch {
  width: 25px;
  height: 25px;
  border-radius: 5px;
  border: 1px solid white;
}

.color-label {
  font-size: 0.8rem;
  font-weight: bold;
  margin-top: 5px;
}
       </style>
      </head>
      <body>
        <h2>Available Themes</h2>
        <div class="theme-container">${themeHtml}</div>
      </body>
      </html>
    `;
  }
}
