export function initSaveAs(win, appWin, showNotification) {
  const contentArea = win.querySelector('.window-content');
  contentArea.innerHTML = "";
  // Set the window styling
  win.style.width = "600px";
  win.style.height = "440px";
  contentArea.style.padding = "5px";

  // Instruction paragraph.
  const instruction = document.createElement('p');
  instruction.textContent = "Select a folder and enter file name:";
  instruction.style.fontFamily = "Tahoma, sans-serif";
  contentArea.appendChild(instruction);

  // Folder display at the top (initially showing the root folder "C:/").
  const folderDisplay = document.createElement('div');
  folderDisplay.className = "save-as-folder";
  folderDisplay.textContent = "C:/";
  folderDisplay.style.fontFamily = "Tahoma, sans-serif";
  folderDisplay.style.padding = "5px";
  folderDisplay.style.border = "1px solid #ccc";
  folderDisplay.style.marginBottom = "10px";
  folderDisplay.style.backgroundColor = "#f9f9f9";
  contentArea.appendChild(folderDisplay);

  // Back button to navigate up a folder.
  const backButton = document.createElement('button');
  backButton.textContent = "Back";
  backButton.style.marginBottom = "10px";
  contentArea.appendChild(backButton);

  // Container for the folder explorer.
  const explorerContainer = document.createElement('div');
  explorerContainer.style.border = "1px solid #ccc";
  explorerContainer.style.margin = "10px 0";
  explorerContainer.style.height = "250px";
  explorerContainer.style.overflowY = "auto";
  explorerContainer.style.background = "white";
  contentArea.appendChild(explorerContainer);

  // Container for the file name input and Save button.
  const fileSaveContainer = document.createElement('div');
  fileSaveContainer.style.display = "flex";
  fileSaveContainer.style.alignItems = "center";
  fileSaveContainer.style.gap = "10px";
  contentArea.appendChild(fileSaveContainer);

  const fileNameInput = document.createElement('input');
  fileNameInput.type = "text";
  fileNameInput.placeholder = "File name";
  fileNameInput.style.flexGrow = "1";
  fileSaveContainer.appendChild(fileNameInput);

  const saveBtn = document.createElement('button');
  saveBtn.textContent = "Save";
  fileSaveContainer.appendChild(saveBtn);

  // Helper function to get a folder object by its file system path.
  function getFolderByPath(path) {
    if (typeof path !== "string") return null;
    const cleanPath = path.replace(/^[A-Za-z]:[\\/]/, "");
    const parts = cleanPath.split(/[\\/]/).filter(Boolean);
    let current = window.fileSystem && window.fileSystem["C:"];
    for (let part of parts) {
      if (current && current.children && current.children.hasOwnProperty(part)) {
        current = current.children[part];
      } else {
        return null;
      }
    }
    return current;
  }

  // Function to update the explorer container with the folder list for the given folderPath.
  function updateExplorer(folderPath) {
    explorerContainer.innerHTML = "";
    const folder = getFolderByPath(folderPath);
    if (!folder || folder.type !== "folder" || !folder.children) {
      const errMsg = document.createElement("p");
      errMsg.textContent = "Folder not found.";
      explorerContainer.appendChild(errMsg);
      return;
    }
    // List only folder-type items.
    Object.keys(folder.children).forEach((key) => {
      const itemData = folder.children[key];
      if (itemData.type === "folder") {
        const item = document.createElement("div");
        item.style.padding = "5px";
        item.style.borderBottom = "1px solid #ddd";
        item.style.cursor = "pointer";
        item.textContent = key;
        item.addEventListener("click", () => {
          let newPath = folderPath;
          if (!newPath.endsWith("/")) newPath += "/";
          newPath += key + "/";
          folderDisplay.textContent = newPath;
          updateExplorer(newPath);
        });
        explorerContainer.appendChild(item);
      }
    });
  }

  // Initialize the explorer container with the root folder.
  updateExplorer(folderDisplay.textContent);

  // Back button functionality: navigate to parent folder.
  backButton.addEventListener("click", () => {
    let currentPath = folderDisplay.textContent;
    if (currentPath === "C:/") return; // Already at root.
    if (currentPath.endsWith("/")) {
      currentPath = currentPath.slice(0, -1);
    }
    const parts = currentPath.split("/");
    if (parts.length > 1) {
      parts.pop();
      let newPath = parts.join("/");
      if (!newPath.endsWith("/")) newPath += "/";
      folderDisplay.textContent = newPath;
      updateExplorer(newPath);
    }
  });

  // Save button functionality.
  saveBtn.addEventListener("click", () => {
    const folderPath = folderDisplay.textContent.trim();
    let fileName = fileNameInput.value.trim();

    // Check if we're saving from Paint or Notepad and append appropriate extension if missing
    const isPaint = appWin.querySelector("canvas#paint-canvas") !== null;
    const isNotepad = appWin.querySelector("textarea") !== null;

    // Only append extension if one isn't already present
    if (!fileName.includes('.')) {
      if (isPaint) {
        fileName += '.bmp';
      } else if (isNotepad) {
        fileName += '.txt';
      }
    }

    if (!folderPath || !fileName) {
      showNotification("Folder path and file name must be provided.");
      return;
    }
    const folder = getFolderByPath(folderPath);
    if (!folder || folder.type !== "folder") {
      showNotification("Folder not found: " + folderPath);
      return;
    }

    // Get file content: first try to find a Paint canvas, then fallback to a Notepad textarea.
    let fileContent;
    const canvasEl = appWin.querySelector("canvas#paint-canvas");
    if (canvasEl !== null) {
      fileContent = canvasEl.toDataURL("image/png");
    } else {
      const textarea = appWin.querySelector("textarea");
      if (textarea !== null) {
        fileContent = textarea.value;
      } else {
        showNotification("No valid component (Notepad or Paint) found.");
        return;
      }
    }
    folder.children[fileName] = { type: "file", content: fileContent };
    let fullPath = folderPath;
    if (!fullPath.endsWith("/")) fullPath += "/";
    fullPath += fileName;
    appWin.dataset.filePath = fullPath;
    showNotification(`File saved to ${fullPath}`);
    // Simulate a click on the Close button to remove its taskbar button.
    const closeBtn = win.querySelector('button[aria-label="Close"]');
    if (closeBtn) {
      closeBtn.click();
    } else {
      win.remove();
    }
  });
}