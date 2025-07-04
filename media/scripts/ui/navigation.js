export function initNavigation() {
  document.querySelectorAll('.nav-item').forEach((item) => {
    item.addEventListener('click', () => {
      document
        .querySelectorAll('.nav-item')
        .forEach((i) => i.classList.remove('active'));
      item.classList.add('active');

      const view = item.dataset.view;
      window.currentState.view = view;
      document.dispatchEvent(new Event('stateUpdated'));
      vscode.postMessage({ command: 'switchView', view });
    });
  });
}
