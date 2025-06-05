(function () {
  document.addEventListener('DOMContentLoaded', () => {
    console.log('main.js loaded');

    let currentState = {
      view: 'saved-colors',
      savedColors: [],
      projects: [],
      currentProject: null,
    };
    // must below currentstate
    const vscode = acquireVsCodeApi();

    // Get DOM elements
    const savedColorsInput = document.getElementById('savedColorsInput');
    const addSavedColorBtn = document.getElementById('addSavedColorBtn');
    const projectColorInput = document.getElementById('projectColorInput');
    const addProjectColorBtn = document.getElementById('addProjectColorBtn');
    const newProjectBtn = document.getElementById('newProjectBtn');
    const projectModal = document.getElementById('projectModal');
    const createProjectBtn = document.getElementById('createProjectBtn');
    const cancelProjectBtn = document.getElementById('cancelProjectBtn');
    const projectNameInput = document.getElementById('projectNameInput');
    const backToProjectsBtn = document.getElementById('backToProjectsBtn');

    // Notify extension that webview is ready
    vscode.postMessage({ command: 'ready' });
    // View switching
    document.querySelectorAll('.nav-item').forEach((item) => {
      item.addEventListener('click', () => {
        document
          .querySelectorAll('.nav-item')
          .forEach((i) => i.classList.remove('active'));
        item.classList.add('active');

        const view = item.dataset.view;
        vscode.postMessage({
          command: 'switchView',
          view: view,
        });
      });
    });
    // Update UI when state changes
    window.addEventListener('message', (event) => {
      const message = event.data;
      if (message.command === 'updateState') {
        currentState = message;
        updateViews();
      }
    });

    function updateViews() {
      document.querySelectorAll('.view-content').forEach((view) => {
        view.style.display = 'none';
      });
      if (currentState.view === 'saved-colors') {
        document.getElementById('savedColorsView').style.display = 'block';
        renderSavedColors();
      } else if (currentState.view === 'projects') {
        document.getElementById('projectsView').style.display = 'block';
        renderProjectsList();
      } else if (currentState.view === 'project-colors') {
        document.getElementById('projectColorsView').style.display = 'block';
        renderProjectColors();
      }
    }

    function renderSavedColors() {
      const container = document.getElementById('savedColorsList');
      renderColorsList(container, currentState.savedColors, 'saved');
    }
    // Project selection
    function handleProjectClick(projectId) {
      vscode.postMessage({
        command: 'selectProject',
        projectId: projectId,
      });
    }
    function handleDeleteProject(projectId) {
      // Confirm before deleting
      const project = currentState.projects.find((p) => p.id === projectId);
      if (project) {
        vscode.postMessage({
          command: 'deleteProject',
          projectId: projectId,
        });
      }
    }
    function renderProjectsList() {
      const container = document.getElementById('projectsList');
      container.innerHTML = currentState.projects
        .map(
          (project) => /*html*/ `
      <div class="project-item" data-project-id="${project.id}">
      <div class="project-info">
        <span class="project-name">${project.name}</span>
        <span class="project-color-count">${project.colors.length} colors</span>
      </div>
      <button class="delete-project-btn" data-project-id="${project.id}" aria-label="Delete project">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <path fill-rule="evenodd" d="M10 3h3v1h-1v9l-1 1H4l-1-1V4H2V3h3V1a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v2zM9 2H6v1h3V2zM4 13h7V4H4v9zm2-8H5v7h1V5zm1 0h1v7H7V5zm2 0h1v7H9V5z"/>
  </svg>
      </button>
    </div>
    `
        )
        .join('');

      // Add click handlers for project selection
      container.querySelectorAll('.project-item').forEach((item) => {
        item.addEventListener('click', (e) => {
          // Don't trigger if clicking on delete button
          if (!e.target.closest('.delete-project-btn')) {
            handleProjectClick(item.dataset.projectId);
          }
        });
      });

      // Add click handlers for delete buttons
      container.querySelectorAll('.delete-project-btn').forEach((button) => {
        button.addEventListener('click', (e) => {
          e.stopPropagation(); // Prevent triggering project selection
          handleDeleteProject(button.dataset.projectId);
        });
      });
      backToProjectsBtn.addEventListener('click', () => {
        vscode.postMessage({
          command: 'switchView',
          view: 'projects',
        });
      });
    }

    function renderProjectColors() {
      if (!currentState.currentProject) {
        return;
      }

      const container = document.getElementById('projectColorsList');
      renderColorsList(
        container,
        currentState.currentProject.colors,
        'project'
      );

      // Update project title
      document.getElementById(
        'projectColorsTitle'
      ).innerHTML = `${currentState.currentProject.name} Colors`;
    }

    function renderColorsList(container, colors, type) {
      container.innerHTML =
        colors.length === 0
          ? /*html*/ `<p>No colors saved yet</p>`
          : colors
              .map((color, index) => {
                const sanitizedId = `copy-options-${type}-${index}`;
                return /*html*/ `
    <div class="color-item" style="position: relative; background-color: ${color}">
      <span class="color-code">${color}</span>
      <div class="color-actions">
        <button class="copy-btn" data-color="${color}" data-options-id="${sanitizedId}"><svg width="16" height="16"  xmlns="http://www.w3.org/2000/svg"  fill="currentColor" viewBox="0 0 448 512"><path d="M208 0L332.1 0c12.7 0 24.9 5.1 33.9 14.1l67.9 67.9c9 9 14.1 21.2 14.1 33.9L448 336c0 26.5-21.5 48-48 48l-192 0c-26.5 0-48-21.5-48-48l0-288c0-26.5 21.5-48 48-48zM48 128l80 0 0 64-64 0 0 256 192 0 0-32 64 0 0 48c0 26.5-21.5 48-48 48L48 512c-26.5 0-48-21.5-48-48L0 176c0-26.5 21.5-48 48-48z"/></svg></button>
        <div id="${sanitizedId}" class="copy-options">
          <button class="copy-option" data-format="plain">${color}</button>
          <button class="copy-option" data-format="tailwind-bg">bg-[${color}]</button>
          <button class="copy-option" data-format="tailwind-text">text-[${color}]</button>
          <button class="copy-option" data-format="css-color">color: ${color};</button>
          <button class="copy-option" data-format="css-bg">background-color: ${color};</button>
          </div>
          <button class="preview-btn" data-color="${color}"><svg width="16" height="16"  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" fill="currentColor"><path d="M288 32c-80.8 0-145.5 36.8-192.6 80.6C48.6 156 17.3 208 2.5 243.7c-3.3 7.9-3.3 16.7 0 24.6C17.3 304 48.6 356 95.4 399.4C142.5 443.2 207.2 480 288 480s145.5-36.8 192.6-80.6c46.8-43.5 78.1-95.4 93-131.1c3.3-7.9 3.3-16.7 0-24.6c-14.9-35.7-46.2-87.7-93-131.1C433.5 68.8 368.8 32 288 32zM144 256a144 144 0 1 1 288 0 144 144 0 1 1 -288 0zm144-64c0 35.3-28.7 64-64 64c-7.1 0-13.9-1.2-20.3-3.3c-5.5-1.8-11.9 1.6-11.7 7.4c.3 6.9 1.3 13.8 3.2 20.7c13.7 51.2 66.4 81.6 117.6 67.9s81.6-66.4 67.9-117.6c-11.1-41.5-47.8-69.4-88.6-71.1c-5.8-.2-9.2 6.1-7.4 11.7c2.1 6.4 3.3 13.2 3.3 20.3z"/></svg></button>
        <button class="remove-btn" data-color="${color}" data-type="${type}"><svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <path fill-rule="evenodd" d="M10 3h3v1h-1v9l-1 1H4l-1-1V4H2V3h3V1a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v2zM9 2H6v1h3V2zM4 13h7V4H4v9zm2-8H5v7h1V5zm1 0h1v7H7V5zm2 0h1v7H9V5z"/>
  </svg></button>

      </div>
    </div>
  `;
              })
              .join('');
      // Add event listeners for buttons
      container.querySelectorAll('.copy-btn').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation(); // Prevent click bubbling
          const optionsId = btn.getAttribute('data-options-id');
          const optionsMenu = document.getElementById(optionsId);
          const isVisible = optionsMenu.style.display === 'flex';
          document
            .querySelectorAll('.copy-options')
            .forEach((el) => (el.style.display = 'none'));
          optionsMenu.style.display = isVisible ? 'none' : 'flex';
        });
      });
      // Handle copy- option click
      container.querySelectorAll('.copy-option').forEach((optionBtn) => {
        optionBtn.addEventListener('click', () => {
          const formatType = optionBtn.dataset.format;
          const rawColor = optionBtn
            .closest('.color-actions')
            .querySelector('.copy-btn').dataset.color;

          let textToCopy;
          switch (formatType) {
            case 'plain':
              textToCopy = `${rawColor}`;
              break;
            case 'tailwind-bg':
              textToCopy = `bg-[${rawColor}]`;
              break;
            case 'tailwind-text':
              textToCopy = `text-[${rawColor}]`;
              break;
            case 'css-color':
              textToCopy = `color: ${rawColor};`;
              break;
            case 'css-bg':
              textToCopy = `background-color: ${rawColor};`;
              break;
            default:
              textToCopy = rawColor;
          }

          vscode.postMessage({
            command: 'copy',
            text: textToCopy,
          });

          optionBtn.parentElement.style.display = 'none';
        });
      });
      document.addEventListener('click', (event) => {
        const isOption = event.target.closest('.copy-options');
        const isButton = event.target.closest('.copy-btn');

        if (!isOption && !isButton) {
          document
            .querySelectorAll('.copy-options')
            .forEach((el) => (el.style.display = 'none'));
        }
      });
      container.querySelectorAll('.remove-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          vscode.postMessage({
            command: 'removeColor',
            color: btn.dataset.color,
            from: btn.dataset.type,
          });
        });
      });
      // preview button logic
      container.querySelectorAll('.preview-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          const color = btn.dataset.color;
          vscode.postMessage({
            command: 'previewColor',
            color: color,
          });
        });
      });
    }
    // Handle color addition
    addSavedColorBtn.addEventListener('click', () => {
      console.log('newcolor clicked>>');
      const color = savedColorsInput.value.trim();
      if (color) {
        vscode.postMessage({
          command: 'addColor',
          color: color,
          from: 'saved',
        });
        savedColorsInput.value = '';
      }
    });

    savedColorsInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        addSavedColorBtn.click();
      }
    });

    addProjectColorBtn.addEventListener('click', () => {
      const color = projectColorInput.value.trim();
      if (color) {
        vscode.postMessage({
          command: 'addColor',
          color: color,
          from: 'project',
        });
        projectColorInput.value = '';
      }
    });

    projectColorInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        addProjectColorBtn.click();
      }
    });

    // Project management
    newProjectBtn.addEventListener('click', () => {
      projectModal.style.display = 'flex';
      projectNameInput.focus();
    });

    cancelProjectBtn.addEventListener('click', () => {
      projectModal.style.display = 'none';
      projectNameInput.value = '';
    });

    createProjectBtn.addEventListener('click', () => {
      const projectName = projectNameInput.value.trim();
      if (projectName) {
        vscode.postMessage({
          command: 'createProject',
          name: projectName,
        });
        projectModal.style.display = 'none';
        projectNameInput.value = '';
      }
    });
  });
})();
