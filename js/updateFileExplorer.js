import { getIcon } from "./icons.js";
import { openItem } from "./openItem.js";
import { hideContextMenu } from "./contextMenu.js";
import { recycleBin } from "./system.js";
import { getItemByPath } from "./system.js";

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

export function updateFileExplorer(win, folderPath) {
  const contentArea = win.querySelector('.window-content');
  let newFolder = getItemByPath(folderPath);
  
  // Special case: If trying to open Recycle Bin, use the recycleBin object instead
  if (folderPath.toLowerCase() === "c:/desktop/recycle bin" || 
      folderPath.toLowerCase() === "c:/desktop/recycle bin/" ||
      folderPath.toLowerCase() === "c:/recycle bin" || 
      folderPath.toLowerCase() === "c:/recycle bin/") {
    newFolder = recycleBin;
  }
  
  if (!newFolder || !("children" in newFolder)) {
    window.openErrorWindow(`Windows cannot find '${folderPath}'. Check the spelling and try again.`);
    setTimeout(() => {
      const pathInput = win.querySelector('input[type="text"]');
      if (pathInput) {
        pathInput.focus();
        pathInput.select();
      }
    }, 100);
    return;
  }

  contentArea.innerHTML = "";

  // Set up the content area with header (Back button and path input) then a grid layout.
  contentArea.style.flex = "1";
  contentArea.style.display = "flex";
  contentArea.style.flexDirection = "column";

  const titleBarText = win.querySelector('.title-bar-text');
  if (titleBarText) {
    if (folderPath.toLowerCase() === "c:/recycle bin" || folderPath.toLowerCase() === "c:/recycle bin/") {
      titleBarText.innerText = "Recycle Bin";
      win.dataset.title = "Recycle Bin";
    } else if (folderPath === "C:/" || folderPath === "C:") {
      titleBarText.innerText = "Local Disk (C:)";
      win.dataset.title = "Local Disk (C:)";
    } else {
      let parts = folderPath.split("/");
      parts = parts.filter(part => part !== '');
      const name = parts[parts.length - 1] || folderPath;
      titleBarText.innerText = name;
      win.dataset.title = name;
    }
    const taskbarBtn = document.querySelector(`.taskbar-button[data-id="${win.dataset.id}"]`);
    if (taskbarBtn) {
      const span = taskbarBtn.querySelector('span');
      if (span) span.innerText = titleBarText.innerText;
    }
  }

  const headerContainer = document.createElement('div');
  headerContainer.style.padding = "5px";
  headerContainer.style.display = "flex";
  headerContainer.style.flexDirection = "column";
  headerContainer.style.flexShrink = "0";

  const backButton = document.createElement('button');
  backButton.textContent = "Back";
  backButton.style.alignSelf = "flex-start";
  backButton.style.marginBottom = "5px";
  headerContainer.appendChild(backButton);

  const pathRow = document.createElement('div');
  pathRow.style.display = "flex";
  pathRow.style.alignItems = "center";
  const pathInput = document.createElement('input');
  pathInput.type = "text";
  pathInput.value = folderPath;
  pathInput.style.flexGrow = "1";
  pathInput.style.fontWeight = "bold";
  const goButton = document.createElement('button');
  goButton.textContent = "Go";
  goButton.style.marginLeft = "5px";
  pathRow.appendChild(pathInput);
  pathRow.appendChild(goButton);
  headerContainer.appendChild(pathRow);
  contentArea.appendChild(headerContainer);

  pathInput.addEventListener('keypress', (e) => {
    if (e.key === "Enter") {
      updateFileExplorer(win, pathInput.value);
    }
  });
  goButton.addEventListener('click', () => {
    updateFileExplorer(win, pathInput.value);
  });
  backButton.addEventListener('click', () => {
    let currentPath = pathInput.value;
    if (currentPath.toLowerCase() === "c:/recycle bin" || currentPath.toLowerCase() === "c:/recycle bin/") {
      updateFileExplorer(win, "C:/Desktop/");
      pathInput.value = "C:/Desktop/";
      return;
    }
    if (currentPath === "C:/") return;
    if (currentPath.endsWith("/")) {
      currentPath = currentPath.slice(0, -1);
    }
    const parts = currentPath.split("/");
    if (parts.length > 1) {
      parts.pop();
      let newPath = parts.join("/");
      if (!newPath.endsWith("/")) newPath += "/";
      updateFileExplorer(win, newPath);
      pathInput.value = newPath;
    }
  });

  const gridContainer = document.createElement('div');
  gridContainer.style.background = "white";
  gridContainer.style.overflowY = "auto";
  gridContainer.style.display = "grid";
  gridContainer.style.gridTemplateColumns = "repeat(auto-fill, minmax(100px, 1fr))";
  gridContainer.style.gap = "5px";
  gridContainer.style.padding = "0px";
  gridContainer.style.flexGrow = "1";
  gridContainer.style.alignContent = "start";
  contentArea.appendChild(gridContainer);

  Object.keys(newFolder.children).forEach(key => {
    const itemData = newFolder.children[key];
    const item = document.createElement('div');
    item.style.padding = "5px";
    item.style.cursor = "pointer";
    item.style.textAlign = "center";
    item.style.height = "80px";
    item.style.position = "relative";

    let displayName = key;
    if (newFolder === recycleBin && itemData.originalName) {
      displayName = itemData.originalName;
      item.dataset.recycleKey = key;
    }
    
    let iconSrc = "";
    let shortcutOverlay = "";
    if (newFolder === recycleBin) {
      iconSrc = getIcon(itemData.originalName);
    } else {
      if (itemData.type === 'file') {
        // Use specific icons for file extensions
        if (key.toLowerCase().endsWith('.txt')) {
          iconSrc = getIcon('.txt');
        } else if (key.toLowerCase().endsWith('.bmp')) {
          iconSrc = getIcon('.bmp');
        } else {
          iconSrc = getIcon("notepad");
        }
      } else if (itemData.type === 'app') {
        iconSrc = getIcon(key);
      } else if (itemData.type === 'folder') {
        iconSrc = getIcon("folder");
      } else if (itemData.type === 'shortcut') {
        const targetItem = getItemByPath(itemData.target);
        if (targetItem) {
          if (targetItem.type === 'app') {
            iconSrc = getIcon(key);
          } else if (targetItem.type === 'folder') {
            iconSrc = getIcon("folder");
          } else if (targetItem.type === 'file') {
            // Check file extension for shortcuts to files
            if (key.toLowerCase().endsWith('.txt')) {
              iconSrc = getIcon('.txt');
            } else if (key.toLowerCase().endsWith('.bmp')) {
              iconSrc = getIcon('.bmp');
            } else {
              iconSrc = getIcon("notepad");
            }
          } else {
            iconSrc = getIcon("folder");
          }
        } else {
          if (itemData.target && itemData.target.endsWith("/")) {
            iconSrc = getIcon("folder");
          } else {
            iconSrc = getIcon(key);
          }
        }
        shortcutOverlay = true;
      } else {
        iconSrc = getIcon("folder");
      }
    }
    
    item.innerHTML = `
      <div style="position: relative;">
        <img src="${iconSrc}" style="width:40px; height:40px; margin-bottom:5px;">
        ${shortcutOverlay ? `<img src="shortcuticon.png" alt="Shortcut" style="position: absolute; bottom: 5px; left: 35px; width:12px; height:12px;">` : ''}
      </div>
      <div style="font-size: 12px; word-wrap: break-word;">${displayName}</div>
    `;

    const fullPath = (function() {
      let fp = folderPath;
      if (!fp.endsWith("/")) fp += "/";
      fp += key;
      if (itemData.type === "folder") fp += "/";
      return fp;
    })();
    if (newFolder !== recycleBin) {
      item.setAttribute('data-path', fullPath);
    }

    function handleOpen() {
      if (newFolder === recycleBin) {
        window.openProperties(item);
      } else {
        if (key.toLowerCase() === "my computer") {
          updateFileExplorer(win, "C:/");
          pathInput.value = "C:/";
        } else if (key.toLowerCase() === "recycle bin") {
          updateFileExplorer(win, "C:/Desktop/Recycle Bin/");
          pathInput.value = "C:/Desktop/Recycle Bin/";
        } else if (itemData.type === 'folder') {
          updateFileExplorer(win, fullPath);
          pathInput.value = fullPath;
        } else if (itemData.type === 'file') {
          openItem(fullPath);
        } else if (itemData.type === 'app') {
          openItem(fullPath);
        } else if (itemData.type === 'shortcut') {
          openItem(fullPath);
        }
      }
    }

    item.addEventListener('click', handleOpen);

    item.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      let options = [];
      if (newFolder === recycleBin) {
        options.push({
          label: 'Restore', 
          action: () => {
            const recycleKey = item.dataset.recycleKey;
            const recycleEntry = recycleBin.children[recycleKey];
            if (recycleEntry && recycleEntry.originalPath) {
              const parts = recycleEntry.originalPath.split('/');
              const filename = parts.pop();
              const parentPath = parts.join('/') + "/";
              const parentFolder = getItemByPath(parentPath);
              if (parentFolder) {
                parentFolder.children[filename] = recycleEntry.item;
                delete recycleBin.children[recycleKey];
                updateFileExplorer(win, folderPath);
                if (recycleEntry.originalPath.startsWith("C:/Desktop/") && window.updateDesktopIcons) {
                  window.updateDesktopIcons();
                }
                window.showNotification(`Restored "${recycleEntry.originalName}" to ${recycleEntry.originalPath}`);
              } else {
                window.showNotification("Restore failed: original location not found.");
              }
            } else {
              window.showNotification("Restore failed: invalid recycle bin entry.");
            }
            hideContextMenu();
          }
        });
        options.push({
          label: 'Properties',
          action: () => { window.openProperties(item); hideContextMenu(); }
        });
      } else {
        options.push({ 
          label: 'Open', 
          action: () => { handleOpen(); hideContextMenu(); }
        });

        // Check if this is the Recycle Bin app
        if (key.toLowerCase() === "recycle bin") {
          options.push({ 
            label: 'Empty Recycle Bin', 
            action: () => {
              if (Object.keys(recycleBin.children).length === 0) {
                window.showNotification('The Recycle Bin is already empty');
              } else if (confirm('Are you sure you want to permanently delete all items in the Recycle Bin?')) {
                recycleBin.children = {};
                window.showNotification('The Recycle Bin has been emptied');
                updateFileExplorer(win, folderPath);
              }
              hideContextMenu();
            }
          });
        } else {
          // Only show Rename and Delete for non-Recycle Bin items
          options.push({ 
            label: 'Rename', 
            action: () => { 
              const oldName = key;
              const newName = prompt('Enter new name:', oldName);
              if (newName && newName !== oldName) {
                newFolder.children[newName] = itemData;
                delete newFolder.children[oldName];
                updateFileExplorer(win, folderPath);
              }
              hideContextMenu();
            }
          });

          // Only show Delete for non-Recycle Bin items
          if (key.toLowerCase() !== "recycle bin") {
            options.push({ 
              label: 'Delete', 
              action: () => { 
                if (confirm('Are you sure you want to delete "' + key + '"?')) {
                  moveToRecycleBin(key, itemData, folderPath);
                  delete newFolder.children[key];
                  updateFileExplorer(win, folderPath);
                  if (folderPath === "C:/Desktop/" || folderPath === "C:/Desktop") {
                    if (window.updateDesktopIcons) window.updateDesktopIcons();
                  }
                }
                hideContextMenu();
              }
            });
          }
        }

        // Only show Pin to Start menu for apps and shortcuts to apps
        if (itemData.type === "app" || (itemData.type === "shortcut" && itemData.target && itemData.target.includes("/Apps/"))) {
          options.push({ 
            label: 'Pin to Start menu', 
            action: () => {
              const title = key;
              const startMenuFirstColumn = document.querySelector('.start-menu .first-column');
              if (!startMenuFirstColumn) {
                console.error('Start menu first column not found');
                return;
              }
              const smItem = document.createElement('div');
              smItem.className = 'start-menu-item';
              smItem.setAttribute('data-path', fullPath);
              smItem.setAttribute('data-window', title);
              smItem.innerHTML = `
                <img src="${getIcon(title)}" alt="${title} icon" width="32" height="32">
                <span>${title}</span>
              `;
              smItem.addEventListener('click', () => { 
                const path = smItem.getAttribute('data-path');
                if (path) openItem(path);
                hideContextMenu();
              });
              smItem.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                let smOptions = [
                  { label: 'Open', action: () => { 
                      const path = smItem.getAttribute('data-path');
                      if (path) openItem(path);
                      hideContextMenu();
                    }},
                  { label: 'Remove', action: () => { smItem.remove(); hideContextMenu(); } },
                  { label: 'Add to Desktop', action: () => { 
                      const fp = smItem.getAttribute('data-path') || title;
                      window.addNewAppToDesktop(title, title, fp);
                      hideContextMenu();
                    }},
                  { label: 'Properties', action: () => { window.openProperties(smItem); hideContextMenu(); } }
                ];
                window.showContextMenu(e.pageX, e.pageY, smOptions);
              });
              startMenuFirstColumn.appendChild(smItem);
              window.showNotification(`Added "${title}" to the start menu.`);
              hideContextMenu();
            }
          });
        }

        // Add to Desktop option (except for Recycle Bin)
        if (key.toLowerCase() !== "recycle bin") {
          options.push({ 
            label: 'Add to Desktop', 
            action: () => { 
              const fp = item.getAttribute('data-path') || key;
              window.addNewAppToDesktop(key, key, fp);
              hideContextMenu();
            }
          });
        }

        options.push({ 
          label: 'Properties', 
          action: () => { window.openProperties(item); hideContextMenu(); }
        });
      }
      window.showContextMenu(e.pageX, e.pageY, options);
    });

    gridContainer.appendChild(item);
  });
}