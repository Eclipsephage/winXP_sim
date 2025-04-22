export function showContextMenu(x, y, options) {
  hideContextMenu();
  const contextMenu = document.createElement('div');
  contextMenu.className = 'context-menu';
  contextMenu.style.top = y + "px";
  contextMenu.style.left = x + "px";
  options.forEach(opt => {
    const menuItem = document.createElement('div');
    menuItem.className = 'context-menu-item';
    menuItem.textContent = opt.label;
    menuItem.addEventListener('click', () => {
      opt.action();
      hideContextMenu();
    });
    contextMenu.appendChild(menuItem);
  });
  document.body.appendChild(contextMenu);
}

export function hideContextMenu() {
  const existing = document.querySelectorAll('.context-menu');
  existing.forEach(menu => menu.remove());
}

// Close any open context menu when clicking outside of it.
document.addEventListener('click', (e) => {
  if (!e.target.closest('.context-menu')) {
    hideContextMenu();
  }
});