import * as vscode from 'vscode';
export function activate(context: vscode.ExtensionContext) {
  const provider = new ColorPickerViewProvider(context.extensionUri);

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider('colorcodestore-view', provider, {
      webviewOptions: {
        retainContextWhenHidden: true,
      },
    })
  );
}

interface ColorProject {
  id: string;
  name: string;
  colors: string[];
}
class ColorPickerViewProvider implements vscode.WebviewViewProvider {
  private _view?: vscode.WebviewView;
  private savedColors: string[] = [];
  private projects: ColorProject[] = [];
  private currentProjectId: string | null = null;
  private currentView: 'saved-colors' | 'projects' | 'project-colors' =
    'saved-colors';
  constructor(private readonly extensionUri: vscode.Uri) {
    this.loadData();
  }

  private async loadData() {
    const config = vscode.workspace.getConfiguration('colorcodestore');
    this.savedColors = (await config.get('savedColors')) || [];
    this.projects = (await config.get('projects')) || [];
    this.currentProjectId = (await config.get('currentProjectId')) || null;
  }
  private async saveData() {
    const config = vscode.workspace.getConfiguration('colorcodestore');
    await config.update(
      'savedColors',
      this.savedColors,
      vscode.ConfigurationTarget.Global
    );
    await config.update(
      'projects',
      this.projects,
      vscode.ConfigurationTarget.Global
    );
    await config.update(
      'currentProjectId',
      this.currentProjectId,
      vscode.ConfigurationTarget.Global
    );
  }

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    this._view = webviewView;
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [vscode.Uri.joinPath(this.extensionUri, 'media')],
    };

    webviewView.webview.html = this.getHtmlForWebview(webviewView.webview);

    webviewView.webview.onDidReceiveMessage(async (message) => {
      console.log('message>>', message);
      switch (message.command) {
        case 'ready': //  handle webview ready state
          this.updateWebview();
          return;
        case 'addColor':
          if (this.isValidColor(message.color)) {
            if (message.from === 'project' && this.currentProjectId) {
              const project = this.projects.find(
                (p) => p.id === this.currentProjectId
              );
              if (project) {
                project.colors.unshift(message.color);
              }
            } else {
              this.savedColors.unshift(message.color);
            }
            await this.saveData();
            this.updateWebview();
          }
          return;
        case 'switchView':
          this.currentView = message.view;
          this.updateWebview();
          return;
        case 'selectProject':
          this.currentProjectId = message.projectId;
          this.currentView = 'project-colors';
          this.updateWebview();
          return;
        case 'copy':
          vscode.env.clipboard.writeText(message.text);
          vscode.window.showInformationMessage(`Copied: ${message.text}`);
          return;

        case 'removeColor':
          if (message.from === 'project' && this.currentProjectId) {
            const project = this.projects.find(
              (p) => p.id === this.currentProjectId
            );
            if (project) {
              project.colors = project.colors.filter(
                (c) => c !== message.color
              );
            }
          } else {
            this.savedColors = this.savedColors.filter(
              (c) => c !== message.color
            );
          }
          await this.saveData();
          this.updateWebview();
          return;
        case 'createProject':
          const projectName = message.name;
          if (projectName) {
            const newProject: ColorProject = {
              id: Date.now().toString(),
              name: projectName,
              colors: [],
            };
            this.projects.unshift(newProject);
            this.currentProjectId = newProject.id;
            this.currentView = 'project-colors';
            await this.saveData();
            this.updateWebview();
          }
          return;
        case 'switchProject':
          this.currentProjectId = message.projectId;
          await this.saveData();
          this.updateWebview();
          return;
        case 'deleteProject':
          this.projects = this.projects.filter(
            (p) => p.id !== message.projectId
          );
          if (this.currentProjectId === message.projectId) {
            this.currentProjectId = null;
            this.currentView = 'saved-colors';
          }
          await this.saveData();
          this.updateWebview();
          return;
        case 'previewColor': {
          const color = message.color;
          const panel = vscode.window.createWebviewPanel(
            'colorPreview',
            `Color Preview: ${color}`,
            vscode.ViewColumn.One,
            { enableScripts: false }
          );
          panel.webview.html = getColorPreviewHtml(color);
          return;
        }
      }
    });
  }

  private isValidColor(color: string): boolean {
    // Simple validation - expand this with more robust checks
    return /^(#([0-9A-Fa-f]{3}){1,2}|(rgb|hsl)a?\(\s*\d+\s*,\s*\d+\s*%?\s*,\s*\d+\s*%?\s*(,\s*[\d.]+\s*)?\))$/.test(
      color
    );
  }
  private updateWebview() {
    if (!this._view) {
      return;
    }
    const currentProject = this.currentProjectId
      ? this.projects.find((p) => p.id === this.currentProjectId)
      : null;
    this._view.webview.postMessage({
      command: 'updateState',
      view: this.currentView || 'saved-colors',
      savedColors: this.savedColors,
      projects: this.projects,
      currentProject: currentProject
        ? {
            id: currentProject.id,
            name: currentProject.name,
            colors: currentProject.colors,
          }
        : null,
    });
  }
  private getHtmlForWebview(webview: vscode.Webview): string {
    const cssUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.extensionUri, 'media', 'styles.css')
    );

    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.extensionUri, 'media', 'main.js')
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

    body {
      font-family: 'Inter', sans-serif;
    }
  </style>
    <link href="${cssUri}" rel="stylesheet" />

  </head>
  <body>
    <div class="main-nav">
      <div class="nav-item active" data-view="saved-colors">Saved Colors</div>
      <div class="nav-item" data-view="projects">Projects</div>
    </div>

    <!-- Saved Colors View -->
    <div id="savedColorsView" class="view-content">
      <div class="color-input-bar">
        <input
          class="color-input"
          type="text"
          id="savedColorsInput"
          placeholder="Enter color (hex, rgb, rgba, hsl)"
        />
      <button class="add-color-btn" id="addSavedColorBtn">+ Add Color</button>
      </div>
      <div id="savedColorsList"></div>
    </div>

    <!-- Projects View -->
    <div id="projectsView" class="view-content" >
      <button class="new-prj-btn" id="newProjectBtn">+ New Project</button>
      <div id="projectsList"></div>
    </div>

    <!-- Project Colors View -->
    <div id="projectColorsView" class="view-content" >
      <h3 id="projectColorsTitle"></h3>
      <div class="color-input-bar">
        <input
          class="color-input"
          type="text"
          id="projectColorInput"
          placeholder="Enter color (hex, rgb, rgba, hsl)"
        />
  <button class="add-color-btn" id="addProjectColorBtn">Add Color</button>
      </div>
      <div id="projectColorsList"></div>
    </div>

    <!-- New Project Modal -->
    <div id="projectModal" class="project-modal">
      <div class="project-modal-content">
        <h3>Create New Project</h3>
        <input type="text" id="projectNameInput" placeholder="Project name" />
        <div class="project-modal-actions">
          <button class="action-btn create-btn" id="createProjectBtn">Create</button>
          <button class="action-btn cancel-btn" id="cancelProjectBtn">Cancel</button>
        </div>
      </div>
    </div>

    <script src="${scriptUri}"></script>
  </body>
</html>

        `;
  }
}

function getColorPreviewHtml(color: string): string {
  return /*html*/ `<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
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
        color: #fff;
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
  </html>`;
}

export function deactivate() {}
