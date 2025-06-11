export function renderColorsList(container, colors, type) {
  container.innerHTML = colors.length
    ? colors
        .map((color, index) => {
          const id = `copy-options-${type}-${index}`;
          return /*html*/ `<div class="color-item" style="background:${color}">
          <span class="color-code">${color}</span>
          <div class="color-actions">
            <button class="copy-btn" data-color="${color}" data-options-id="${id}">📋</button>
            <div id="${id}" class="copy-options">
              <button class="copy-option" data-format="plain">${color}</button>
              <button class="copy-option" data-format="tailwind-bg">bg-[${color}]</button>
              <button class="copy-option" data-format="tailwind-text">text-[${color}]</button>
              <button class="copy-option" data-format="css-color">color: ${color};</button>
              <button class="copy-option" data-format="css-bg">background-color: ${color};</button>
            </div>
            
  <button class="preview-btn" data-color="${color}">👁️</button>
            <button class="remove-btn" data-color="${color}" data-type="${type}">🗑️</button>
          </div>
        </div>`;
        })
        .join('')
    : /*html*/ `<p>No colors saved yet</p>`;

  setupColorActions(container);
}

function setupColorActions(container) {
  container.querySelectorAll('.copy-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const menu = document.getElementById(btn.dataset.optionsId);
      const isVisible = menu.style.display === 'flex';
      document
        .querySelectorAll('.copy-options')
        .forEach((el) => (el.style.display = 'none'));
      menu.style.display = isVisible ? 'none' : 'flex';
    });
  });

  container.querySelectorAll('.copy-option').forEach((btn) => {
    btn.addEventListener('click', () => {
      const format = btn.dataset.format;
      const color = btn.closest('.color-actions').querySelector('.copy-btn')
        .dataset.color;
      const text = formatColor(color, format);
      vscode.postMessage({ command: 'copy', text });
      btn.parentElement.style.display = 'none';
    });
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

  container.querySelectorAll('.preview-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      vscode.postMessage({ command: 'previewColor', color: btn.dataset.color });
    });
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.copy-options') && !e.target.closest('.copy-btn')) {
      document
        .querySelectorAll('.copy-options')
        .forEach((el) => (el.style.display = 'none'));
    }
  });
}

function formatColor(color, format) {
  switch (format) {
    case 'tailwind-bg':
      return `bg-[${color}]`;
    case 'tailwind-text':
      return `text-[${color}]`;
    case 'css-color':
      return `color: ${color};`;
    case 'css-bg':
      return `background-color: ${color};`;
    default:
      return color;
  }
}
