(function () {
  const vscode = acquireVsCodeApi();
  window.addEventListener('DOMContentLoaded', () => {
    vscode.postMessage({ command: 'ready' });
  });
})();
