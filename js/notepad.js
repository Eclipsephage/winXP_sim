export function initNotepad(win, showNotification) {
  const windowContent = win.querySelector('.window-content');
  
  // Set up a function to update the Notepad title.
  function updateNotepadTitle() {
    const titleBar = win.querySelector('.title-bar-text');
    let fileName;
    if (win.dataset.filePath) {
      const parts = win.dataset.filePath.split('/');
      fileName = parts[parts.length - 1] || 'Untitled';
    } else {
      fileName = 'Untitled';
    }
    titleBar.textContent = fileName + " - Notepad";
    const taskbarBtn = document.querySelector(`.taskbar-button[data-id="${win.dataset.id}"]`);
    if (taskbarBtn) {
      const span = taskbarBtn.querySelector('span');
      if (span) span.innerText = titleBar.textContent;
    }
  }

  // Set the Notepad window title based on the file name if a file is being opened.
  const titleBar = win.querySelector('.title-bar-text');
  if (titleBar) {
    if (win.dataset.filePath) {
      const parts = win.dataset.filePath.split('/');
      let fileName = parts[parts.length - 1] || 'Untitled';
      titleBar.textContent = fileName + " - Notepad";
    } else {
      titleBar.textContent = 'Untitled - Notepad';
    }
    const taskbarBtn = document.querySelector(`.taskbar-button[data-id="${win.dataset.id}"]`);
    if (taskbarBtn) {
      const span = taskbarBtn.querySelector('span');
      if (span) span.innerText = titleBar.textContent;
    }
  }
  
  // Check for existing textarea;
  let textarea = win.querySelector('textarea');

  // If file content exists (opened text file), display it and update the title accordingly.
  if (win.dataset.filecontent !== undefined) {
    textarea.value = win.dataset.filecontent;
    updateNotepadTitle();
  }
  
  // Add the Notepad buttons container at the top if not already added.
  let buttonContainer = win.querySelector('.notepad-buttons');
  if (!buttonContainer) {
    buttonContainer = document.createElement('div');
    buttonContainer.className = 'notepad-buttons';
    buttonContainer.style.marginBottom = '5px';
    buttonContainer.style.marginTop = '5px';
    buttonContainer.style.display = 'flex';
    buttonContainer.style.gap = '5px';
    
    const saveBtn = document.createElement('button');
    saveBtn.textContent = 'Save';
    saveBtn.addEventListener('click', () => {
      if (!window.fileSystem) {
        showNotification('File system not available.');
        return;
      }
      if (win.dataset.filePath) {
        try {
          const fullPath = win.dataset.filePath;
          const lastSlashIndex = fullPath.lastIndexOf('/');
          const folderPath = fullPath.substring(0, lastSlashIndex + 1);
          const fileName = fullPath.substring(lastSlashIndex + 1);
          const folder = getFolderByPath(folderPath);
          if (folder && folder.children) {
            folder.children[fileName] = { type: "file", content: textarea.value };
            showNotification(`File saved to ${folderPath} as ${fileName}`);
            updateNotepadTitle();
          } else {
            showNotification('Error: Folder not found.');
          }
        } catch (error) {
          showNotification('Error saving file: ' + error.message);
        }
      } else {
        const saveAsWin = window.createWindow("Save As");
        import("./saveAs.js").then(module => {
          module.initSaveAs(saveAsWin, win, showNotification);
        });
      }
    });
    
    const exportBtn = document.createElement('button');
    exportBtn.textContent = 'Export';
    exportBtn.addEventListener('click', () => {
      const blob = new Blob([textarea.value], { type: 'text/plain' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = win.dataset.filePath
                   ? win.dataset.filePath.split('/').pop()
                   : 'notepad.txt';
      a.click();
      showNotification(`File exported as ${a.download}`);
    });
    
    windowContent.insertBefore(buttonContainer, windowContent.firstChild);
    buttonContainer.appendChild(saveBtn);
    buttonContainer.appendChild(exportBtn);
  }
  
  function getFolderByPath(path) {
    if (typeof path !== "string") return null;
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
}