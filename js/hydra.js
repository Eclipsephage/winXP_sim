export function initHydra(win, showNotification, createWindow) {
  // Use .window-content if available, otherwise fallback to .window-body
  const contentArea = win.querySelector('.window-content') || win.querySelector('.window-body');
  contentArea.innerHTML = `<p>Cut off a head, two more will take its place.</p>`;
  // Using xp.css windows, select the close button via its aria-label.
  const closeBtn = win.querySelector('button[aria-label="Close"]');
  if (closeBtn) {
    closeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      // Create two new Hydra apps before closing the current one.
      createWindow('Hydra App');
      createWindow('Hydra App');
      showNotification('Hydra multiplies!');
      win.remove();
    });
  }
}