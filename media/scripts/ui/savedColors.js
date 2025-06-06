import { renderColorsList } from './common/renderColorsList.js';

export function initSavedColors() {
  const input = document.getElementById('savedColorsInput');
  const button = document.getElementById('addSavedColorBtn');

  button.addEventListener('click', () => {
    const color = input.value.trim();
    if (color) {
      vscode.postMessage({ command: 'addColor', color, from: 'saved' });
      input.value = '';
    }
  });

  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      button.click();
    }
  });

  document.addEventListener('stateUpdated', renderSavedColors);
}

export function renderSavedColors() {
  const container = document.getElementById('savedColorsList');
  renderColorsList(container, window.currentState.savedColors, 'saved');
}
