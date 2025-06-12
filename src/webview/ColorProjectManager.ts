import * as vscode from 'vscode';
import type { ColorProject } from '../utils/types';
import { isValidColor } from '../utils/colorUtils';

export class ColorProjectManager {
  private savedColors: string[] = [];
  private projects: ColorProject[] = [];
  private currentProjectId: string = '';
  private initialized: boolean = false;
  private globalState: vscode.Memento;
  constructor(globalState: vscode.Memento) {
    this.globalState = globalState;
  }
  public async initialize(): Promise<void> {
    if (!this.initialized) {
      try {
        const isSeeded = this.globalState.get<boolean>(
          'colorStore.initialized'
        );

        if (!isSeeded) {
          await this.seedDefaultColors();
          await this.globalState.update('colorStore.initialized', true);
        }
        await this.loadData();
        this.initialized = true;
      } catch (error) {
        vscode.window.showErrorMessage(
          'Failed to load color data: ' + (error as Error).message
        );
        this.savedColors = [];
        this.projects = [];
        this.currentProjectId = '';
        this.initialized = true;
      }
    }
  }
  private async seedDefaultColors() {
    await this.loadData();
    if (this.savedColors.length > 0) {
      return;
    }

    const defaultColors = [
      '#FF5733',
      '#33C1FF',
      '#28A745',
      '#FFC107',
      '#6F42C1',
    ];

    const addedColors: string[] = [];

    for (const color of defaultColors) {
      const { isValid, acceptableColor } = isValidColor(color);
      if (
        isValid &&
        acceptableColor &&
        !this.savedColors.includes(acceptableColor)
      ) {
        this.savedColors.unshift(acceptableColor);
        addedColors.push(acceptableColor);
      }
    }

    await this.saveData();
  }

  private async loadData() {
    const config = vscode.workspace.getConfiguration('color-store');
    // Use Promise.all for parallel loading
    const [savedColors, projects, currentProjectId] = await Promise.all([
      config.get<string[]>('savedColors'),
      config.get<ColorProject[]>('projects'),
      config.get<string>('currentProjectId'),
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
    this.currentProjectId =
      typeof currentProjectId === 'string' ? currentProjectId : '';
  }

  private async saveData() {
    const config = vscode.workspace.getConfiguration('color-store');
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
  ): Promise<{ success: boolean; message?: string; color?: string }> {
    const { isValid, acceptableColor } = isValidColor(color);
    if (!isValid || !acceptableColor) {
      return { success: false, message: 'Invalid color format.' };
    }
    const colorToSave = acceptableColor;
    if (from === 'project' && this.currentProjectId) {
      const project = this.projects.find((p) => p.id === this.currentProjectId);
      if (project) {
        if (project.colors.includes(colorToSave)) {
          return {
            success: false,
            message: `${colorToSave} is already in this Project.`,
          };
        }
        project.colors.unshift(colorToSave);
        await this.saveData();
        return {
          success: true,
          color: colorToSave,
          message: `${colorToSave} added to Project.`,
        };
      }
    } else {
      if (this.savedColors.includes(colorToSave)) {
        return {
          success: false,
          message: `${colorToSave} is already in Saved colors.`,
        };
      }
      this.savedColors.unshift(colorToSave);
      await this.saveData();
      return {
        success: true,
        color: colorToSave,
        message: `${colorToSave} Saved.`,
      };
    }
    return { success: false, message: 'Failed to add color.' };
  }

  // Remove a color from either saved colors or current project
  public async removeColor(
    color: string,
    from: 'saved' | 'project' = 'saved'
  ): Promise<{ success: boolean; message?: string }> {
    let removed = false;
    if (from === 'project' && this.currentProjectId) {
      const project = this.projects.find((p) => p.id === this.currentProjectId);
      if (project) {
        const originalLength = project.colors.length;
        project.colors = project.colors.filter((c) => c !== color);
        removed = project.colors.length !== originalLength;
      }
    } else {
      const originalLength = this.savedColors.length;
      this.savedColors = this.savedColors.filter((c) => c !== color);
      removed = this.savedColors.length !== originalLength;
    }
    if (removed) {
      await this.saveData();
      return {
        success: true,
        message: `${color} removed from ${
          from === 'project' ? 'Project' : 'Saved colors.'
        }`,
      };
    }
    return { success: false, message: 'Color not found.' };
  }

  // Create a new project
  public async createProject(name: string): Promise<boolean> {
    if (!name || name.trim() === '') {
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
    const idx = this.projects.findIndex((p) => p.id === projectId);
    if (idx !== -1) {
      this.projects.splice(idx, 1);
      if (this.currentProjectId === projectId) {
        this.currentProjectId = '';
      }
      await this.saveData();
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
    const currentProject = this.projects.find(
      (p) => p.id === this.currentProjectId
    );
    return currentProject
      ? {
          id: currentProject.id,
          name: currentProject.name,
          colors: currentProject.colors,
        }
      : null;
  }
}
