export function initProjectModal() {
  const newBtn = document.getElementById('newProjectBtn');
  const cancelBtn = document.getElementById('cancelProjectBtn');
  const createBtn = document.getElementById('createProjectBtn');
  const modal = document.getElementById('projectModal');
  const input = document.getElementById('projectNameInput');

  newBtn.addEventListener('click', () => {
    modal.style.display = 'flex';
    input.focus();
  });

  cancelBtn.addEventListener('click', () => {
    modal.style.display = 'none';
    input.value = '';
  });

  createBtn.addEventListener('click', () => {
    const name = input.value.trim();
    if (name) {
      vscode.postMessage({ command: 'createProject', name });
      modal.style.display = 'none';
      input.value = '';
    }
  });
}
