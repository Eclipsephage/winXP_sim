import { startVirus } from "./virus.js";
import { getItemByPath } from "./system.js";
import { initBonziBuddy } from "./bonziBuddy.js";

export function openItem(filePath) {
  filePath = filePath.trim().replace(/\\/g, '/');
  if (filePath !== "C:/" && filePath.endsWith("/")) {
    filePath = filePath.slice(0, -1);
  }
  
  // Special handling for Recycle Bin
  if (filePath.toLowerCase() === "c:/desktop/recycle bin" || 
      filePath.toLowerCase() === "c:/desktop/recycle bin/" ||
      filePath.toLowerCase() === "c:/recycle bin" || 
      filePath.toLowerCase() === "c:/recycle bin/") {
    const win = window.createWindow("File Explorer");
    window.updateFileExplorer(win, "C:/Desktop/Recycle Bin/");
    return;
  }

  const item = getItemByPath(filePath);
  if (!item) {
    window.openErrorWindow(`Windows cannot find '${filePath}'. Check the spelling and try again.`);
    return;
  }
  
  const segments = filePath.split('/').filter(Boolean);
  const itemName = segments[segments.length - 1].toLowerCase();

  if (itemName === "my computer") {
    const win = window.createWindow("File Explorer");
    window.updateFileExplorer(win, "C:/");
    return;
  }
  
  if (itemName === "control panel") {
    const win = window.createWindow("Control Panel");
    
    // Use the new Control Panel module
    import("./controlPanel.js").then(module => {
      module.initControlPanel(win, window.showNotification);
    });
    
    return;
  }

  if (itemName === "task manager") {
    const win = window.createWindow("Task Manager");
    // Note: initTaskManager will be called by the windowManager
    return;
  }
  
  if (item.type === "app" && item.virus) {
    startVirus();
    return;
  }
  
  if (item.type === "shortcut") {
    if (item.target) {
      openItem(item.target);
      return;
    } else {
      const win = window.createWindow(segments[segments.length - 1]);
      
      // Special handling for Command Prompt shortcut
      if (segments[segments.length - 1] === "Command Prompt") {
        window.initCommandPrompt(win, window.showNotification);
      }
      
      return;
    }
  }
  
  if (item.type === "file") {
    // Check file extension and open in appropriate application
    if (itemName.endsWith('.txt')) {
      import("./notepad.js").then(module => {
        const win = window.createWindow("Notepad", null);
        win.dataset.filePath = filePath;
        setTimeout(() => {
          const textarea = win.querySelector('textarea');
          if (textarea) {
            textarea.value = item.content || "";
          }
        }, 0);
      });
    } else if (itemName.endsWith('.bmp')) {
      import("./paint.js").then(module => {
        const win = window.createWindow("Paint", null);
        win.dataset.filePath = filePath;
        setTimeout(() => {
          const canvas = win.querySelector('#paint-canvas');
          if (canvas) {
            const ctx = canvas.getContext('2d');
            const img = new Image();
            img.onload = () => {
              ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            };
            img.src = item.content;
          }
        }, 0);
      });
    } else {
      // Show error for unknown file types
      window.openErrorWindow(`No program is associated with '${itemName}'. Create an association in Folder Options.`);
    }
    return;
  }
  
  if (item.type === "folder") {
    const win = window.createWindow("File Explorer");
    window.updateFileExplorer(win, filePath + "/");
    return;
  }
  
  if (item.type === "app") {
    // Special handling for BonziBuddy
    if (segments[segments.length - 1] === "BonziBuddy") {
      initBonziBuddy(window.showNotification);
      return;
    }
    
    const win = window.createWindow(segments[segments.length - 1]);
    
    // Special handling for Command Prompt app
    if (segments[segments.length - 1] === "Command Prompt") {
      window.initCommandPrompt(win, window.showNotification);
    }
    
    return;
  }
  
  const win = window.createWindow(segments[segments.length - 1]);
  
  // Special handling for Command Prompt
  if (segments[segments.length - 1] === "Command Prompt") {
    window.initCommandPrompt(win, window.showNotification);
  }
}