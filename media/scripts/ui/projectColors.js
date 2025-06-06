import { renderColorsList } from './common/renderColorsList.js';

export function initProjectColors() {
  const input = document.getElementById('projectColorInput');
  const button = document.getElementById('addProjectColorBtn');

  button.addEventListener('click', () => {
    const color = input.value.trim();
    if (color) {
      vscode.postMessage({ command: 'addColor', color, from: 'project' });
      input.value = '';
    }
  });

  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      button.click();
    }
  });

  document.addEventListener('stateUpdated', renderProjectColors);
}
export function renderProjectColors() {
  if (!window.currentState.currentProject) {
    return;
  }

  document.getElementById(
    'projectColorsTitle'
  ).textContent = `${window.currentState.currentProject.name} Colors`;

  const container = document.getElementById('projectColorsList');
  renderColorsList(
    container,
    window.currentState.currentProject.colors,
    'project'
  );
}
