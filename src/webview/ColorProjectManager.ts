import * as vscode from 'vscode';
import type { ColorProject } from '../utils/types';
import { isValidColor } from '../utils/colorUtils';

export class ColorProjectManager {
  private savedColors: string[] = [];
  private projects: ColorProject[] = [];
  private currentProjectId: string | null = null;
  private initialized: boolean = false;
  public async initialize(): Promise<void> {
    if (!this.initialized) {
      try {
        await this.loadData();
        this.initialized = true;
      } catch (error) {
        vscode.window.showErrorMessage(
          'Failed to load color data: ' + (error as Error).message
        );
        this.savedColors = [];
        this.projects = [];
        this.currentProjectId = null;
        this.initialized = true; 
      }
    }
  }
  private async loadData() {
    const config = vscode.workspace.getConfiguration('colorcodestore');
    // Use Promise.all for parallel loading
    const [savedColors, projects, currentProjectId] = await Promise.all([
      config.get<string[]>('savedColors'),
      config.get<ColorProject[]>('projects'),
      config.get<string | null>('currentProjectId'),
    ]);
    // Clean the loaded data
    this.savedColors = (savedColors || []).filter(
      (c) => c !== null && c.trim() !== ''
    );
    this.projects = (projects || []).map((project) => ({
      ...project,
      colors: (project.colors || []).filter(
        (c) => c !== null && c.trim() !== ''
      ),
    }));
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

  public async addColor(
    color: string,
    from: 'saved' | 'project' = 'saved'
  ): Promise<boolean> {
    if (!isValidColor(color)) {
      return false;
    }

    if (from === 'project' && this.currentProjectId) {
      const project = this.projects.find((p) => p.id === this.currentProjectId);
      if (project) {
        project.colors.unshift(color);
      }
    } else {
      this.savedColors.unshift(color);
    }

    await this.saveData();
    return true;
  }

  // Remove a color from either saved colors or current project
  public async removeColor(
    color: string,
    from: 'saved' | 'project' = 'saved'
  ): Promise<boolean> {
    if (from === 'project' && this.currentProjectId) {
      const project = this.projects.find((p) => p.id === this.currentProjectId);
      if (project) {
        project.colors = project.colors.filter((c) => c !== color);
      }
    } else {
      this.savedColors = this.savedColors.filter((c) => c !== color);
    }

    await this.saveData();
    return true;
  }

  // Create a new project
  public async createProject(name: string): Promise<boolean> {
    if (!name) {
      return false;
    }

    const newProject: ColorProject = {
      id: Date.now().toString(),
      name: name,
      colors: [],
    };

    this.projects.unshift(newProject);
    this.currentProjectId = newProject.id;
    await this.saveData();
    return true;
  }

  public async selectProject(projectId: string): Promise<void> {
    this.currentProjectId = projectId;
    await this.saveData();
  }

  public async deleteProject(projectId: string): Promise<boolean> {
    console.log('deleteprjID>>', projectId);
    const idx = this.projects.findIndex((p) => p.id === projectId);
    if (idx !== -1) {
      this.projects.splice(idx, 1);
      if (this.currentProjectId === projectId) {
        this.currentProjectId = null;
      }
      this.saveData();
      return true;
    }
    return false;
  }
  getSavedColors() {
    return this.savedColors;
  }

  getProjects() {
    return this.projects;
  }

  getCurrentProject() {
    const currentProject = this.currentProjectId
      ? this.projects.find((p) => p.id === this.currentProjectId)
      : null;
    return currentProject
      ? {
          id: currentProject.id,
          name: currentProject.name,
          colors: currentProject.colors,
        }
      : null;
  }
}
