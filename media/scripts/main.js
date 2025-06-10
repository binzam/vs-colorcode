import { initNavigation } from './ui/navigation.js';
import { initSavedColors } from './ui/savedColors.js';
import { initProjects } from './ui/projects.js';
import { initProjectColors } from './ui/projectColors.js';
import { initProjectModal } from './ui/projectModal.js';
import { updateViews } from './ui/viewManager.js';

(function () {
  document.addEventListener('DOMContentLoaded', () => {
    // console.log('main.js loaded');

    window.currentState = {
      view: 'saved-colors',
      savedColors: [],
      projects: [],
      currentProject: null,
    };
    window.serverReady = false;
    window.vscode = acquireVsCodeApi();

    vscode.postMessage({ command: 'ready' });
    function startServerPing() {
      let attempts = 0;
      const maxAttempts = 10; 

      const intervalId = setInterval(async () => {
        attempts++;
        try {
          const res = await fetch('http://localhost:3000/api/ping');
          if (res.ok) {
            window.serverReady = true;
            clearInterval(intervalId);
            document.dispatchEvent(new Event('serverReady'));
          }
        } catch (err) {
          // Do nothing if ping fails
        }

        if (attempts >= maxAttempts) {
          clearInterval(intervalId);
        }
      }, 3000);
    }
   startServerPing();

    

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
    document.addEventListener('serverReady', () => {
      updateViews();
    });
  });
})();
