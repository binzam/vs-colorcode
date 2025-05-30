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
      switch (message.command) {
        case 'ready': //  handle webview ready state
          this.updateWebview();
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
        // case 'switchProject':
        //   this.currentProjectId = message.projectId;
        //   await this.saveData();
        //   this.updateWebview();
        //   return;
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

    return /*html*/ `
            <!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Color Store</title>
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
        <button class="add-color-btn" id="addSavedColorBtn">Add Color</button>
      </div>
      <div id="savedColorsList"></div>
    </div>

    <!-- Projects View -->
    <div id="projectsView" class="view-content" style="display: none">
      <button class="new-prj-btn" id="newProjectBtn">+ New Project</button>
      <div id="projectsList"></div>
    </div>

    <!-- Project Colors View -->
    <div id="projectColorsView" class="view-content" style="display: none">
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
          <button class="action-btn" id="createProjectBtn">Create</button>
          <button class="action-btn" id="cancelProjectBtn">Cancel</button>
        </div>
      </div>
    </div>

    <script src="${scriptUri}"></script>
  </body>
</html>

        `;
  }
}

export function deactivate() {}
