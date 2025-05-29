(function () {
  const vscode = acquireVsCodeApi();

  const colorInput = document.getElementById('colorInput');
  const copyButton = document.getElementById('copyButton');

  copyButton.addEventListener('click', () => {
    const color = colorInput.value;
    vscode.postMessage({
      command: 'copy',
      text: color,
    });
  });
})();
