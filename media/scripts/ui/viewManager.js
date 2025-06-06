import { renderProjectColors } from "./projectColors.js";
import { renderProjectsList } from "./projects.js";
import { renderSavedColors } from "./savedColors.js";


export function updateViews() {
  const state = window.currentState;

  document.querySelectorAll('.view-content').forEach((view) => {
    view.style.display = 'none';
  });

  switch (state.view) {
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
