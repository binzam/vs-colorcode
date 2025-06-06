export function initProjects() {
  const backBtn = document.getElementById('backToProjectsBtn');

  backBtn.addEventListener('click', () => {
    vscode.postMessage({ command: 'switchView', view: 'projects' });
  });

  document.addEventListener('stateUpdated', renderProjectsList);
}
export function renderProjectsList() {
  const container = document.getElementById('projectsList');
  container.innerHTML = window.currentState.projects
    .map(
      (project) => `
      <div class="project-item" data-project-id="${project.id}">
        <div class="project-info">
          <span class="project-name">${project.name}</span>
          <span class="project-color-count">${project.colors.length} colors</span>
        </div>
        <button class="delete-project-btn" data-project-id="${project.id}">🗑️</button>
      </div>
    `
    )
    .join('');

  container.querySelectorAll('.project-item').forEach((item) => {
    item.addEventListener('click', (e) => {
      if (!e.target.closest('.delete-project-btn')) {
        vscode.postMessage({
          command: 'selectProject',
          projectId: item.dataset.projectId,
        });
      }
    });
  });

  container.querySelectorAll('.delete-project-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      vscode.postMessage({
        command: 'deleteProject',
        projectId: btn.dataset.projectId,
      });
    });
  });
}
