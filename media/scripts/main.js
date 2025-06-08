import { initNavigation } from "./ui/navigation.js";
import { initSavedColors } from "./ui/savedColors.js";
import { initProjects } from "./ui/projects.js";
import { initProjectColors } from "./ui/projectColors.js";
import { initProjectModal } from "./ui/projectModal.js";
import { updateViews } from "./ui/viewManager.js";

(function () {
  document.addEventListener('DOMContentLoaded', () => {
    // console.log('main.js loaded');

    window.currentState = {
      view: 'saved-colors',
      savedColors: [],
      projects: [],
      currentProject: null,
    };

    window.vscode = acquireVsCodeApi();

    vscode.postMessage({ command: 'ready' });

    initNavigation();
    initSavedColors();
    initProjects();
    initProjectColors();
    initProjectModal();

    window.addEventListener('message', (event) => {
      const message = event.data;
      if (message.command === 'updateState') {
        window.currentState = message;
        document.dispatchEvent(new Event('stateUpdated'));
        updateViews();
      }
    });
    document.addEventListener('stateUpdated', updateViews);
  });
})();
