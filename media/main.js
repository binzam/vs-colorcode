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

    // Project selection
    function handleProjectClick(projectId) {
      vscode.postMessage({
        command: 'selectProject',
        projectId: projectId,
      });
    }

    // Update UI when state changes
    window.addEventListener('message', (event) => {
      const message = event.data;
      if (message.command === 'updateState') {
        currentState = message;
        updateViews();
      }
    });

    function updateViews() {
      // Hide all views first
      document.querySelectorAll('.view-content').forEach((view) => {
        view.style.display = 'none';
      });

      // Show the active view
      switch (currentState.view) {
        case 'saved-colors':
          document.getElementById('savedColorsView').style.display = 'block';
          renderSavedColors();
          break;
        case 'projects':
          document.getElementById('projectsView').style.display = 'block';
          renderProjectsList();
          break;
        case 'project-colors':
          document.getElementById('projectColorsView').style.display = 'block';
          renderProjectColors();
          break;
      }
    }

    function renderSavedColors() {
      const container = document.getElementById('savedColorsList');
      renderColorsList(container, currentState.savedColors, 'saved');
    }

    function renderProjectsList() {
      const container = document.getElementById('projectsList');
      container.innerHTML = currentState.projects
        .map(
          (project) => `
      <div class="project-item" data-project-id="${project.id}">
        ${project.name}
        <span class="project-color-count">${project.colors.length} colors</span>
      </div>
    `
        )
        .join('');

      container.querySelectorAll('.project-item').forEach((item) => {
        item.addEventListener('click', () =>
          handleProjectClick(item.dataset.projectId)
        );
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
    <div class="color-item" style="position: relative;">
      <div class="color-display" style="background-color: ${color}"></div>
      <span class="color-code">${color}</span>
      <div class="color-actions">
        <button class="action-btn copy-btn" data-color="${color}" data-options-id="${sanitizedId}">Copy</button>
        <div id="${sanitizedId}" class="copy-options">
          <button class="copy-option" data-format="plain">${color}</button>
          <button class="copy-option" data-format="tailwind-bg">bg-[${color}]</button>
          <button class="copy-option" data-format="tailwind-text">text-[${color}]</button>
          <button class="copy-option" data-format="css-color">color: ${color};</button>
          <button class="copy-option" data-format="css-bg">background-color: ${color};</button>
        </div>
        <button class="action-btn remove-btn" data-color="${color}" data-type="${type}">Remove</button>
        <button class="action-btn preview-btn" data-color="${color}">Preview</button>

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
