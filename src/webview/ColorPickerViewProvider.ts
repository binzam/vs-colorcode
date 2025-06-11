import * as vscode from 'vscode';
import { ColorProjectManager } from './ColorProjectManager';

export class ColorPickerViewProvider implements vscode.WebviewViewProvider {
  private _view?: vscode.WebviewView;
  private manager: ColorProjectManager;
  private currentView: 'saved-colors' | 'projects' | 'project-colors' =
    'saved-colors';
  private _disposables: vscode.Disposable[] = [];
  constructor(
    private readonly extensionUri: vscode.Uri,
    private readonly globalState: vscode.Memento
  ) {
    this.manager = new ColorProjectManager(globalState);
    this.initializeManager();
  }
  private async initializeManager(): Promise<void> {
    try {
      await this.manager.initialize();
      // If we have a view already (unlikely but possible), update it
      if (this._view) {
        this.updateWebview();
      }
    } catch (error) {
      vscode.window.showErrorMessage(
        'Failed to initialize color manager: ' + (error as Error).message
      );
    }
  }
  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    this._view = webviewView;
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [vscode.Uri.joinPath(this.extensionUri, 'media')],
    };
    webviewView.webview.html = this.getHtmlForWebview(webviewView.webview);

    webviewView.webview.onDidReceiveMessage(async (message) => {
      // console.log('message>>', message);
      switch (message.command) {
        case 'ready':
          this.updateWebview();
          break;
        case 'addColor':
          const addResult = await this.manager.addColor(
            message.color,
            message.from
          );
          if (addResult.success) {
            vscode.window.showInformationMessage(
              addResult.message || 'Color added.'
            );
            this.updateWebview();
          } else {
            vscode.window.showWarningMessage(
              addResult.message || 'Failed to add color'
            );
          }
          break;
        case 'removeColor':
          const removeResult = await this.manager.removeColor(
            message.color,
            message.from
          );
          if (removeResult.success) {
            vscode.window.showInformationMessage(
              removeResult.message || 'Color removed.'
            );
            this.updateWebview();
          } else {
            vscode.window.showWarningMessage(
              removeResult.message || 'Failed to remove color.'
            );
          }
          break;
        case 'copy':
          vscode.env.clipboard.writeText(message.text);
          vscode.window.showInformationMessage(`Copied: ${message.text}`);
          break;
        case 'previewColor':
          vscode.commands.executeCommand(
            'color-store.previewColor',
            message.color
          );
          break;
        case 'switchView':
          this.currentView = message.view;
          this.updateWebview();
          break;
        case 'createProject':
          if (await this.manager.createProject(message.name)) {
            this.currentView = 'project-colors';
            this.updateWebview();
          }
          break;
        case 'selectProject':
          await this.manager.selectProject(message.projectId);
          this.currentView = 'project-colors';
          this.updateWebview();
          break;
        case 'deleteProject':
          if (await this.manager.deleteProject(message.projectId)) {
            // should the currentview change to 'projects' or 'saved-colors' ? its optional
            this.currentView = 'projects';
            this.updateWebview();
          }
          break;
      }
    });
  }

  private updateWebview() {
    if (!this._view) {
      return;
    }
    this._view.webview.postMessage({
      command: 'updateState',
      view: this.currentView,
      savedColors: this.manager.getSavedColors(),
      projects: this.manager.getProjects(),
      currentProject: this.manager.getCurrentProject(),
    });
  }

  private getHtmlForWebview(webview: vscode.Webview): string {
    const cssUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.extensionUri, 'media', 'styles', 'styles.css')
    );
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.extensionUri, 'media', 'scripts', 'main.js')
    );
    const fontUri = webview.asWebviewUri(
      vscode.Uri.joinPath(
        this.extensionUri,
        'media',
        'fonts',
        'Inter-Regular.woff2'
      )
    );
    return /*html*/ `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Color Store</title>
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
        <link href="${cssUri}" rel="stylesheet" />
      </head>
      <body>
        <div class="main-nav">
          <div class="nav-item active" data-view="saved-colors">Saved Colors</div>
          <div class="nav-item" data-view="projects">Projects</div>
        </div>
        <div id="savedColorsView" class="view-content">
          <div class="color-input-bar">
            <input class="color-input" type="text" id="savedColorsInput" placeholder="Enter color (hex, rgb, hsv, hsl)" />
            <button class="add-color-btn" id="addSavedColorBtn">+ Add Color</button>
          </div>
          <div id="savedColorsList"  class="color-listing"></div>
        </div>
        <div id="projectsView" class="view-content">
          <button class="new-prj-btn" id="newProjectBtn">+ New Project</button>
          <div id="projectsList" class="project-listing"></div>
        </div>
        <div id="projectColorsView" class="view-content">
        <button id="backToProjectsBtn" class="back-to-projects-btn"><svg  width="12" height="12"  xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor">
  <path stroke-linecap="round" stroke-linejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
</svg>
Back</button>
          <h3 id="projectColorsTitle" class="project-title"></h3>
          <div class="color-input-bar">
            <input class="color-input" type="text" id="projectColorInput" placeholder="Enter color (hex, rgb, rgba, hsl)" />
            <button class="add-color-btn" id="addProjectColorBtn">Add Color</button>
          </div>
          <div id="projectColorsList" class="project-color-listing"></div>
        </div>
        <div id="projectModal" class="project-modal">
          <div class="project-modal-content">
            <h3>Create New Project</h3>
            <input class="new-project-input" type="text" id="projectNameInput" placeholder="Project name" />
            <div class="project-modal-actions">
              <button class="action-btn create-btn" id="createProjectBtn">Create</button>
              <button class="action-btn cancel-btn" id="cancelProjectBtn">Cancel</button>
            </div>
          </div>
        </div>
        <script type="module" src="${scriptUri}"></script>
      </body>
      </html>
    `;
  }
  dispose() {
    this._disposables.forEach((d) => d.dispose());
  }
}
