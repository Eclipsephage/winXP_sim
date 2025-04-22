import { getItemByPath, fileSystem, recycleBin } from "./system.js";
import { getIcon } from "./icons.js";
import { openItem } from "./openItem.js";
import { hideContextMenu } from "./contextMenu.js";

// Helper function: Given a folderPath, item key, and itemData, returns the full path.
// Only folders get an ending slash.
function getFullPath(folderPath, key, itemData) {
  if (!folderPath.endsWith("/")) folderPath += "/";
  let fullPath = folderPath + key;
  if (itemData.type === "folder") {
    fullPath += "/";
  }
  return fullPath;
}

function getItemByPathLocal(path) {
  if (typeof path !== "string") {
    console.error("getItemByPath: Provided path is not a string", path);
    return null;
  }
  const cleanPath = path.replace(/^[A-Za-z]:[\\/]/, '');
  const parts = cleanPath.split(/[\\/]/).filter(Boolean);
  let current = window.fileSystem['C:'];
  for (let part of parts) {
    if (current && current.children && current.children.hasOwnProperty(part)) {
      current = current.children[part];
    } else {
      return null;
    }
  }
  return current;
}

// Helper function to move an item to the recycle bin.
function moveToRecycleBin(itemKey, itemData, parentPath) {
  const timestamp = Date.now();
  const newKey = itemKey + "_" + timestamp;
  recycleBin.children[newKey] = {
    originalPath: parentPath + itemKey,
    originalName: itemKey,
    item: itemData
  };
}

export function updateDesktopIcons() {
  const desktopFolder = fileSystem['C:'].children['Desktop'];
  const desktopIconsContainer = document.querySelector('.icons');
  desktopIconsContainer.innerHTML = "";
  
  if (desktopFolder && desktopFolder.children) {
    Object.keys(desktopFolder.children).forEach(appName => {
      addNewAppToDesktop(appName, null, `C:/Desktop/${appName}`, desktopFolder.children[appName].type, desktopFolder.children[appName].target || null);
    });
  }
  
  repositionDesktopIconsInitial();
}

export function repositionDesktopIconsInitial() {
  const desktop = document.querySelector('.desktop');
  const iconsContainer = document.querySelector('.icons');
  const icons = Array.from(iconsContainer.querySelectorAll('.icon'));
  const marginLeft = 20;
  const marginTop = 20;
  const iconWidth = 75;
  const iconHeight = 75;
  const spacingX = 20;
  const spacingY = 20;
  const desktopHeight = desktop.clientHeight;
  const maxIconsPerColumn = Math.floor((desktopHeight - marginTop) / (iconHeight + spacingY)) || 1;
  icons.forEach((icon, index) => {
    const col = Math.floor(index / maxIconsPerColumn);
    const row = index % maxIconsPerColumn;
    icon.style.left = `${marginLeft + col * (iconWidth + spacingX)}px`;
    icon.style.top = `${marginTop + row * (iconHeight + spacingY)}px`;
  });
}

export function findNextAvailablePosition() {
  const desktop = document.querySelector('.desktop');
  const icons = Array.from(document.querySelectorAll('.icon'));
  const marginLeft = 20;
  const marginTop = 20;
  const iconWidth = 75;
  const iconHeight = 75;
  const spacingX = 20;
  const spacingY = 20;
  const desktopWidth = desktop.clientWidth;
  const desktopHeight = desktop.clientHeight;
  const gridCellWidth = iconWidth + spacingX;
  const gridCellHeight = iconHeight + spacingY;
  const numCols = Math.floor((desktopWidth - marginLeft) / gridCellWidth) || 1;
  for (let col = 0; col < numCols; col++) {
    for (let row = 0; row < Math.floor((desktopHeight - marginTop) / gridCellHeight); row++) {
      const posX = marginLeft + col * gridCellWidth;
      const posY = marginTop + row * gridCellHeight;
      const occupied = icons.some(icon => {
        const iconX = parseInt(icon.style.left, 10) || 0;
        const iconY = parseInt(icon.style.top, 10) || 0;
        return Math.abs(iconX - posX) < 5 && Math.abs(iconY - posY) < 5;
      });
      if (!occupied) {
        return { left: posX, top: posY };
      }
    }
  }
  return { left: marginLeft, top: marginTop };
}

export function makeDraggable(element) {
  let isDragging = false;
  let offsetX = 0;
  let offsetY = 0;
  element.addEventListener('mousedown', (e) => {
    if (e.button !== 0) return;
    isDragging = true;
    offsetX = e.clientX - element.getBoundingClientRect().left;
    offsetY = e.clientY - element.getBoundingClientRect().top;
    element.style.zIndex = ++window.zIndex;
    e.preventDefault();
  });
  
  element.addEventListener('touchstart', (e) => {
    if (e.touches.length !== 1) return;
    const touch = e.touches[0];
    isDragging = true;
    offsetX = touch.clientX - element.getBoundingClientRect().left;
    offsetY = touch.clientY - element.getBoundingClientRect().top;
    element.style.zIndex = ++window.zIndex;
    e.preventDefault();
  });
  
  document.addEventListener('mousemove', (e) => {
    if (isDragging) {
      element.style.left = (e.clientX - offsetX) + 'px';
      element.style.top = (e.clientY - offsetY) + 'px';
    }
  });
  
  document.addEventListener('touchmove', (e) => {
    if (isDragging && e.touches.length === 1) {
      const touch = e.touches[0];
      element.style.left = (touch.clientX - offsetX) + 'px';
      element.style.top = (touch.clientY - offsetY) + 'px';
      e.preventDefault();
    }
  });
  
  document.addEventListener('mouseup', () => {
    if (isDragging) {
      const marginLeft = 20;
      const marginTop = 20;
      const iconWidth = 75;
      const iconHeight = 75;
      const spacingX = 20;
      const spacingY = 20;
      let currentX = parseInt(element.style.left, 10) || 0;
      let currentY = parseInt(element.style.top, 10) || 0;
      let col = Math.round((currentX - marginLeft) / (iconWidth + spacingX));
      let row = Math.round((currentY - marginTop) / (iconHeight + spacingY));
      let snappedX = marginLeft + col * (iconWidth + spacingX);
      let snappedY = marginTop + row * (iconHeight + spacingY);
      const allIcons = Array.from(document.querySelectorAll('.icon')).filter(icon => icon !== element);
      let overlaps = allIcons.some(icon => {
        const iconX = parseInt(icon.style.left, 10);
        const iconY = parseInt(icon.style.top, 10);
        return Math.abs(iconX - snappedX) < 5 && Math.abs(iconY - snappedY) < 5;
      });
      if (overlaps) {
        const occupiedPositions = allIcons.map(icon => ({
          x: parseInt(icon.style.left, 10),
          y: parseInt(icon.style.top, 10)
        }));
        const desktop = document.querySelector('.desktop');
        const maxColumns = Math.floor((desktop.clientWidth - marginLeft) / (iconWidth + spacingX));
        const maxRows = Math.floor((desktop.clientHeight - marginTop) / (iconHeight + spacingY));
        let minDistance = Infinity;
        let bestPosition = null;
        for (let testRow = 0; testRow < maxRows; testRow++) {
          for (let testCol = 0; testCol < maxColumns; testCol++) {
            const testX = marginLeft + testCol * (iconWidth + spacingX);
            const testY = marginTop + testRow * (iconHeight + spacingY);
            const isOccupied = occupiedPositions.some(pos => 
              Math.abs(pos.x - testX) < 5 && Math.abs(pos.y - testY) < 5
            );
            if (!isOccupied) {
              const distance = Math.sqrt(
                Math.pow(testX - currentX, 2) + 
                Math.pow(testY - currentY, 2)
              );
              if (distance < minDistance) {
                minDistance = distance;
                bestPosition = { x: testX, y: testY };
              }
            }
          }
        }
        if (bestPosition) {
          snappedX = bestPosition.x;
          snappedY = bestPosition.y;
        }
      }
      element.style.left = snappedX + 'px';
      element.style.top = snappedY + 'px';
    }
    isDragging = false;
  });
  
  document.addEventListener('touchend', () => {
    if (isDragging) {
      const marginLeft = 20;
      const marginTop = 20;
      const iconWidth = 75;
      const iconHeight = 75;
      const spacingX = 20;
      const spacingY = 20;
      let currentX = parseInt(element.style.left, 10) || 0;
      let currentY = parseInt(element.style.top, 10) || 0;
      let col = Math.round((currentX - marginLeft) / (iconWidth + spacingX));
      let row = Math.round((currentY - marginTop) / (iconHeight + spacingY));
      let snappedX = marginLeft + col * (iconWidth + spacingX);
      let snappedY = marginTop + row * (iconHeight + spacingY);
      const allIcons = Array.from(document.querySelectorAll('.icon')).filter(icon => icon !== element);
      let overlaps = allIcons.some(icon => {
        const iconX = parseInt(icon.style.left, 10);
        const iconY = parseInt(icon.style.top, 10);
        return Math.abs(iconX - snappedX) < 5 && Math.abs(iconY - snappedY) < 5;
      });
      if (overlaps) {
        const occupiedPositions = allIcons.map(icon => ({
          x: parseInt(icon.style.left, 10),
          y: parseInt(icon.style.top, 10)
        }));
        const desktop = document.querySelector('.desktop');
        const maxColumns = Math.floor((desktop.clientWidth - marginLeft) / (iconWidth + spacingX));
        const maxRows = Math.floor((desktop.clientHeight - marginTop) / (iconHeight + spacingY));
        let minDistance = Infinity;
        let bestPosition = null;
        for (let testRow = 0; testRow < maxRows; testRow++) {
          for (let testCol = 0; testCol < maxColumns; testCol++) {
            const testX = marginLeft + testCol * (iconWidth + spacingX);
            const testY = marginTop + testRow * (iconHeight + spacingY);
            const isOccupied = occupiedPositions.some(pos => 
              Math.abs(pos.x - testX) < 5 && Math.abs(pos.y - testY) < 5
            );
            if (!isOccupied) {
              const distance = Math.sqrt(
                Math.pow(testX - currentX, 2) + 
                Math.pow(testY - currentY, 2)
              );
              if (distance < minDistance) {
                minDistance = distance;
                bestPosition = { x: testX, y: testY };
              }
            }
          }
        }
        if (bestPosition) {
          snappedX = bestPosition.x;
          snappedY = bestPosition.y;
        }
      }
      element.style.left = snappedX + 'px';
      element.style.top = snappedY + 'px';
    }
    isDragging = false;
  });
  
  document.addEventListener('touchcancel', () => {
    isDragging = false;
  });
}

export function addNewAppToDesktop(appName, appCode, fullPath = null, itemType = "app", linkTarget = null) {
  const desktopIcons = document.querySelector('.icons');
  const newIcon = document.createElement('div');
  newIcon.className = 'icon';
  if (fullPath) {
    newIcon.setAttribute('data-path', fullPath);
  }
  if (itemType === "file") {
    newIcon.setAttribute('data-window', "Notepad");
    newIcon.setAttribute('data-filePath', fullPath);
  } else {
    newIcon.setAttribute('data-window', appName);
  }
  
  let iconSrc;
  if (itemType === "file") {
    if (appName.toLowerCase().endsWith('.txt')) {
      iconSrc = getIcon('.txt');
    } else if (appName.toLowerCase().endsWith('.bmp')) {
      iconSrc = getIcon('.bmp');
    } else {
      iconSrc = getIcon("notepad");
    }
  } else {
    iconSrc = getIcon(appName);
  }
  
  let shortcutOverlay = "";
  if (itemType === "shortcut") {
    shortcutOverlay = `<img src="shortcuticon.png" alt="Shortcut" style="position: absolute; bottom: 18px; left: 10px; width:12px; height:12px;">`;
  }
  
  newIcon.innerHTML = `
    <img src="${iconSrc}" alt="${appName} icon" width="48" height="48">
    <span>${appName}</span>
    ${shortcutOverlay}
  `;
  desktopIcons.appendChild(newIcon);
  
  const pos = findNextAvailablePosition();
  newIcon.style.position = "absolute";
  newIcon.style.left = pos.left + "px";
  newIcon.style.top = pos.top + "px";
  
  makeDraggable(newIcon);
  
  newIcon.addEventListener('dblclick', (e) => {
    e.preventDefault();
    const path = newIcon.getAttribute('data-path');
    if (path) openItem(path);
  });
  
  let lastTap = 0;
  newIcon.addEventListener('touchend', (e) => {
    const currentTime = new Date().getTime();
    const tapLength = currentTime - lastTap;
    if (tapLength < 500 && tapLength > 0) {
      e.preventDefault();
      const path = newIcon.getAttribute('data-path');
      if (path) openItem(path);
    }
    lastTap = currentTime;
  });
  
  newIcon.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    let options = [];
    
    if (appName.toLowerCase() === "recycle bin") {
      options.push({ 
        label: 'Open', 
        action: () => { 
          const path = newIcon.getAttribute('data-path');
          if (path) openItem(path);
          window.hideContextMenu();
        }
      });
      
      options.push({ 
        label: 'Empty Recycle Bin', 
        action: () => {
          if (Object.keys(recycleBin.children).length === 0) {
            window.showNotification('The Recycle Bin is already empty');
          } else if (confirm('Are you sure you want to permanently delete all items in the Recycle Bin?')) {
            recycleBin.children = {};
            window.showNotification('The Recycle Bin has been emptied');
            const recycleBinWindow = Array.from(document.querySelectorAll('.window')).find(win => 
              win.querySelector('.title-bar-text')?.textContent === 'Recycle Bin'
            );
            if (recycleBinWindow) {
              window.updateFileExplorer(recycleBinWindow, "C:/Desktop/Recycle Bin/");
            }
          }
          window.hideContextMenu();
        }
      });
      
      options.push({ 
        label: 'Properties', 
        action: () => { window.openProperties(newIcon); window.hideContextMenu(); }
      });
    } else {
      options.push({ 
        label: 'Open', 
        action: () => { 
          const path = newIcon.getAttribute('data-path');
          if (path) openItem(path);
          window.hideContextMenu();
        }
      });

      options.push({ 
        label: 'Rename', 
        action: () => {
          const oldName = newIcon.querySelector('span').textContent;
          const newName = prompt('Enter new name:', oldName);
          if (newName && newName !== oldName) {
            newIcon.querySelector('span').textContent = newName;
            const desktopFolder = fileSystem['C:'].children['Desktop'];
            if (desktopFolder && desktopFolder.children.hasOwnProperty(oldName)) {
              desktopFolder.children[newName] = desktopFolder.children[oldName];
              delete desktopFolder.children[oldName];
            }
            if (newIcon.hasAttribute('data-path')) {
              let newPath = `C:/Desktop/${newName}`;
              if(newIcon.hasAttribute('data-folder')) newPath += "/";
              newIcon.setAttribute('data-path', newPath);
            }
            updateDesktopIcons();
          }
          window.hideContextMenu();
        }
      });
      
      options.push({ 
        label: 'Delete', 
        action: () => {
          if (confirm('Are you sure you want to delete this item?')) {
            const desktopFolder = fileSystem['C:'].children['Desktop'];
            const iconName = newIcon.querySelector('span').textContent;
            if (desktopFolder && desktopFolder.children.hasOwnProperty(iconName)) {
              moveToRecycleBin(iconName, desktopFolder.children[iconName], "C:/Desktop/");
              delete desktopFolder.children[iconName];
            }
            newIcon.remove();
            repositionDesktopIconsInitial();
          }
          window.hideContextMenu();
        }
      });
      
      if (itemType === "app" || (itemType === "shortcut" && linkTarget && linkTarget.includes("/Apps/"))) {
        options.push({ 
          label: 'Pin to Start menu', 
          action: () => {
            const title = newIcon.querySelector('span').textContent;
            const startMenuFirstColumn = document.querySelector('.start-menu .first-column');
            if (!startMenuFirstColumn) {
              console.error('Start menu first column not found');
              return;
            }
            const smItem = document.createElement('div');
            smItem.className = 'start-menu-item';
            if(newIcon.hasAttribute('data-window')) {
              smItem.setAttribute('data-window', newIcon.getAttribute('data-window'));
            }
            if(newIcon.hasAttribute('data-path')) {
              smItem.setAttribute('data-path', newIcon.getAttribute('data-path'));
            }
            if(newIcon.hasAttribute('data-link')){
              smItem.setAttribute('data-link', newIcon.getAttribute('data-link'));
            }
            smItem.innerHTML = `
              <img src="${getIcon(title)}" alt="${title} icon" width="32" height="32">
              <span>${title}</span>
            `;
            smItem.addEventListener('click', () => { 
              const path = smItem.getAttribute('data-path');
              if (path) openItem(path);
              window.hideContextMenu();
            });
            smItem.addEventListener('contextmenu', (e) => {
              e.preventDefault();
              let smOptions = [
                { label: 'Open', action: () => { 
                    const path = smItem.getAttribute('data-path');
                    if (path) openItem(path);
                    window.hideContextMenu();
                  }},
                { label: 'Remove', action: () => { smItem.remove(); window.hideContextMenu(); } },
                { label: 'Add to Desktop', action: () => { 
                    const fullPath = smItem.getAttribute('data-path') || title;
                    addNewAppToDesktop(title, title, fullPath);
                    window.hideContextMenu();
                  }},
                { label: 'Properties', action: () => { window.openProperties(smItem); window.hideContextMenu(); } }
              ];
              window.showContextMenu(e.pageX, e.pageY, smOptions);
            });
            startMenuFirstColumn.appendChild(smItem);
            window.showNotification(`Added "${title}" to the start menu.`);
            window.hideContextMenu();
          }
        });
      }
      
      options.push({ 
        label: 'Properties', 
        action: () => { window.openProperties(newIcon); window.hideContextMenu(); }
      });
    }
    
    window.showContextMenu(e.pageX, e.pageY, options);
  });
}