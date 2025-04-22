import { getNextWindowId, getNextZIndex, fileSystem, getItemByPath, recycleBin } from "./system.js";
import { getIcon } from "./icons.js"; 

// Global variable to track current active window id.
window.currentActiveWindowId = null;

export function createWindow(title, customCode) {
  const win = document.createElement('div');
  win.className = 'window';
  win.style.position = 'absolute';
  win.dataset.title = title;
  win.dataset.id = getNextWindowId();
  
  // Check if horror mode is active
  const isHorrorMode = window.isHorrorModeActive && window.isHorrorModeActive();
  
  // Layout for Error windows vs. normal windows.
  if (title === "Error") {
    const desktop = document.querySelector('.desktop');
    const desktopWidth = desktop.clientWidth;
    const desktopHeight = desktop.clientHeight;
    // Check our global flag: if true, use random placement; otherwise, center the error window.
    if (window.__errorRandomPlacement || isHorrorMode) {
      win.style.left = `${Math.random() * (desktopWidth - 300)}px`;
      win.style.top = `${Math.random() * (desktopHeight - 100)}px`;
    } else {
      // Center the error window.
      const winWidth = parseFloat(win.style.width) || 300;
      const winHeight = parseFloat(win.style.height) || 150;
      win.style.left = `${(desktopWidth - winWidth) / 2}px`;
      win.style.top = `${(desktopHeight - winHeight) / 2}px`;
    }
  } else {
    win.style.left = `${50 + Math.random() * 100}px`;
    win.style.top = `${50 + Math.random() * 100}px`;
  }
  win.style.zIndex = getNextZIndex();

  // Set default size if not provided.
  if (!win.style.width) win.style.width = "400px";
  if (!win.style.height) win.style.height = "300px";

  // Make the window a flex container so that header and content adjust correctly.
  win.style.display = "flex";
  win.style.flexDirection = "column";
  win.style.minHeight = "0";

  let headerHTML;
  if (title === "Error") {
    const desktop = document.querySelector('.desktop');
    // For error windows (normally) the width should be set so that centering works later.
    if (!win.style.width) win.style.width = "300px";
    headerHTML = `
      <div class="title-bar">
        <div class="title-bar-left" style="display: flex; align-items: center;">
          <div class="title-bar-text">${title}</div>
        </div>
        <div class="title-bar-controls">
          <button aria-label="Close"></button>
        </div>
      </div>
    `;
  } else {
    const iconSrc = getIcon(title);
    headerHTML = `
      <div class="title-bar">
        <div class="title-bar-left" style="display: flex; align-items: center;">
          <img src="${iconSrc}" style="width:20px; height:20px; margin-right: 5px; pointer-events: none;" draggable="false">
          <div class="title-bar-text">${title}</div>
        </div>
        <div class="title-bar-controls">
          <button aria-label="Minimize"></button>
          <button aria-label="Maximize" class="toggle-maximize"></button>
          <button aria-label="Close"></button>
        </div>
      </div>
    `;
  }

  let bodyHTML = "";
  let content = "";
  switch (title) {
    case 'Internet Explorer':
      bodyHTML = `<div class="window-body ie-window" style="overflow: auto;">`;
      content = customCode ? customCode : `<div class="ie-toolbar" style="padding: 5px; display: flex; align-items: center;">
          <span style="margin-right: 5px; white-space: nowrap;">Address:</span>
          <input type="text" id="url-bar" placeholder="Enter a search term or URL" style="flex: 1;">
          <button id="go-btn">Go</button>
        </div>
        <div style="width: 100%; height: calc(100% - 40px); overflow: auto;">
          <iframe id="ie-content" srcdoc="<h1>Welcome to Internet Explorer</h1><p>Enter a search term or URL above to begin browsing.</p>" style="width: 100%; height: 100%; border: none; display: block; overflow: auto;"></iframe>
        </div>`;
      win.style.width = '800px';
      win.style.height = '600px';
      break;
    case 'File Explorer':
      bodyHTML = `<div class="window-content">`;
      content = customCode ? customCode : `<div class="window-content"></div>`;
      break;
    case 'Snake':
      bodyHTML = `<div class="window-content">`;
      content = customCode ? customCode : `<div class="window-content">
        <canvas id="snake-canvas" style="border:1px solid #000;"></canvas>
        <div>Score: <span id="snake-score">0</span></div>
        <button id="snake-start">Start Game</button>
        <div style="margin-top: 10px;">
          <button id="snake-up">↑</button><br>
          <button id="snake-left">←</button>
          <button id="snake-right">→</button><br>
          <button id="snake-down">↓</button>
        </div>
      </div>`;
      win.style.width = '350px';
      win.style.height = '500px';
      break;
    case 'Minesweeper':
      bodyHTML = `<div class="window-content">`;
      content = customCode ? customCode : `
        <div style="text-align: center;">
          <div id="minesweeper-controls" style="margin-bottom: 10px;">
            <select id="difficulty-select">
              <option value="easy" selected>Easy (9x9, 10 mines)</option>
              <option value="medium">Medium (16x16, 40 mines)</option>
              <option value="hard">Hard (16x30, 99 mines)</option>
            </select>
            <button id="new-game">New Game</button>
            <span id="mine-count"></span>
            <span id="timer"></span>
          </div>
          <div id="minesweeper-grid" style="margin: 0 auto;"></div>
        </div>
      `;
      win.style.width = '1000px';
      win.style.height = '580px';
      break;
    case 'Notepad':
      bodyHTML = `<div class="window-content">`;
      content = customCode ? customCode : `<textarea style="width:100%; height:calc(100% - 35px);resize: none;"></textarea>`;
      win.style.width = '300px';
      win.style.height = '200px';
      break;
    case 'Paint':
      bodyHTML = `<div class="window-content" style="padding: 5px">`;
      content = customCode ? customCode : `<input type="color"><canvas id="paint-canvas" style="border: 1px solid #000;"></canvas>`;
      win.style.width = '600px';
      win.style.height = '420px';
      break;
    case 'Calculator':
      bodyHTML = `<div class="window-content">`;
      break;
    case 'Hydra App':
      bodyHTML = `<div class="window-content" style="padding: 5px">`;
      content = customCode ? customCode : `<p>This is the Hydra App. Try closing me!</p>`;
      win.style.width = '200px';
      win.style.height = '100px';
      break;
    case 'Calendar':
      bodyHTML = `<div class="window-content">`;
      content = customCode ? customCode : `<div class="window-content-inner"></div>`;
      win.style.width = '350px';
      win.style.height = '400px';
      break;
    case 'Windows Media Player':
      bodyHTML = `<div class="window-body">`;
      content = customCode ? customCode : `<div class="window-content"></div>`;
      win.style.height = '575px';
      break;
    case 'Plants vs Zombies':
      bodyHTML = `<div class="window-body pvz-window">`;
      content = customCode ? customCode : `
        <div style="width: 100%; height: 100%;">
          <iframe src="https://pvz.ee/iframe.php" style="width: 100%; height: 100%; border: none; display: block;"></iframe>
        </div>
      `;
      win.style.width = '920px';
      win.style.height = '645px';
      break;
    case 'Minecraft':
      bodyHTML = `<div class="window-body threeD-window">`;
      content = customCode ? customCode : `<div class="window-content" style="flex:1; overflow: hidden;"></div>`;
      win.style.width = '800px';
      win.style.height = '600px';
      break;
    case 'Roblox':
      bodyHTML = `<div class="window-body threeD-window">`;
      content = customCode ? customCode : `<div class="window-content" style="flex:1; overflow: hidden;"></div>`;
      win.style.width = '800px';
      win.style.height = '600px';
      break;
    case 'AOL Instant Messenger':
      bodyHTML = `<div class="window-content" style="padding: 10px">`;
      content = customCode ? customCode : `<div class="window-content">
        <p>Welcome to AOL Instant Messenger Chat!</p>
      </div>`;
      win.style.width = '600px';
      win.style.height = '400px';
      break;
    case 'Error Takeover':
      bodyHTML = `<div class="window-content" style="padding: 10px">`;
      win.style.height = '180px';
      break;
    case 'You Are An Idiot':
      bodyHTML = `<div class="window-content" style="overflow: hidden;">`;
      content = "";
      win.style.width = '600px';
      win.style.height = '445px';
      break;
    case 'Command Prompt':
      bodyHTML = `<div class="window-content">`;
      content = customCode ? customCode : `<div class="window-content"></div>`;
      win.style.width = '640px';
      win.style.height = '400px';
      break;
    case 'Speak Bonzi, Speak!':
      bodyHTML = `<div class="window-content">`;
      content = customCode ? customCode : `<div class="window-content"></div>`;
      win.style.width = '350px';
      win.style.height = '170px';
      break;
    case 'Mario':
      bodyHTML = `<div class="window-body mario-window"`;
      content = customCode ? customCode : `
        <div style="width: 100%; height: 100%;">
          <iframe src="https://html-classic.itch.zone/html/13102180/Web/index.html" style="width: 100%; height: 100%; border: none; display: block;"></iframe>
        </div>
      `;
      win.style.width = '990px';
      win.style.height = '700px';
      break;
    case 'VirtualBox':
      bodyHTML = `<div class="window-body vm-window">`;
      content = customCode ? customCode : `
        <div style="width: calc(100%-20px); height: 100%;">
          <iframe src="https://websim.ai/@BookwormKevin/windows-xp-simulator/" style="width: 100%; height: 100%; border: none; display: block;"></iframe>
        </div>
      `;
      win.style.width = '900px';
      win.style.height = '600px';
      break;
    case 'Task Manager':
      bodyHTML = `<div class="window-content">`;
      content = customCode ? customCode : `<div class="window-content"></div>`;
      break;
    default:
      bodyHTML = `<div class="window-content">`;
      content = customCode ? customCode : `<p>This is the ${title} window.</p>`;
  }
  bodyHTML += content;
  bodyHTML += `</div>`;
  win.innerHTML = headerHTML + bodyHTML;

  createTaskbarButton(title, win);

  const minimizeBtn = win.querySelector('button[aria-label="Minimize"]');
  const maximizeBtn = win.querySelector('button[aria-label="Maximize"]');
  const closeBtn = win.querySelector('button[aria-label="Close"]');

  if (minimizeBtn) {
    minimizeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      win.style.display = 'none';
      if (window.currentActiveWindowId === win.dataset.id) {
        updateTaskbarButtonState(win.dataset.id, false);
        window.currentActiveWindowId = null;
      }
    });
  }
  
  if (maximizeBtn) {
    maximizeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!win.classList.contains('maximized')) {
        win.dataset.defaultLeft = win.style.left;
        win.dataset.defaultTop = win.style.top;
        win.dataset.defaultWidth = win.style.width;
        win.dataset.defaultHeight = win.style.height;
        win.style.left = '0';
        win.style.top = '0';
        win.style.width = '100%';
        win.style.height = 'calc(100% - 30px)'; // Subtract taskbar height
        win.classList.add('maximized');
        maximizeBtn.setAttribute('aria-label', 'Restore');
      } else {
        win.style.left = win.dataset.defaultLeft;
        win.style.top = win.dataset.defaultTop;
        win.style.width = win.dataset.defaultWidth;
        win.style.height = win.dataset.defaultHeight;
        win.classList.remove('maximized');
        maximizeBtn.setAttribute('aria-label', 'Maximize');
      }
    });
  }
  
  closeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    win.remove();
    const taskbarButtons = document.querySelector('.taskbar-buttons');
    const btnToRemove = taskbarButtons.querySelector(`.taskbar-button[data-id="${win.dataset.id}"]`);
    if(btnToRemove) btnToRemove.remove();
    if (window.currentActiveWindowId === win.dataset.id) {
      window.currentActiveWindowId = null;
    }
    if (win.dataset.title === "File Explorer") {
      window.currentFileExplorer = null;
    }
  });
  
  // Make the title bar draggable.
  const titleBar = win.querySelector('.title-bar');
  if (titleBar) {
    titleBar.style.cursor = 'move';
    let dragging = false, offsetX, offsetY;
    let hasUnmaximized = false;
    titleBar.addEventListener('mousedown', (e) => {
      if (e.button === 2) return;
      // Don't initiate drag if clicking on control buttons
      if (e.target.closest('.title-bar-controls')) return;
      dragging = true;
      offsetX = e.clientX - win.offsetLeft;
      offsetY = e.clientY - win.offsetTop;
      win.style.zIndex = getNextZIndex();
    });
    
    // Add touch support for mobile
    titleBar.addEventListener('touchstart', (e) => {
      if (e.touches.length !== 1) return; // Only handle single touch
      // Don't initiate drag if touching control buttons
      if (e.target.closest('.title-bar-controls')) return;
      const touch = e.touches[0];
      dragging = true;
      offsetX = touch.clientX - win.offsetLeft;
      offsetY = touch.clientY - win.offsetTop;
      win.style.zIndex = getNextZIndex();
      e.preventDefault(); // Prevent scrolling while dragging
    });
    
    document.addEventListener('mousemove', (e) => {
      if (dragging) {
        if (win.classList.contains('maximized') && !hasUnmaximized &&
            (Math.abs(e.clientX - offsetX) > 5 || Math.abs(e.clientY - offsetY) > 5)) {
          win.style.left = win.dataset.defaultLeft;
          win.style.top = win.dataset.defaultTop;
          win.style.width = win.dataset.defaultWidth;
          win.style.height = win.dataset.defaultHeight;
          win.classList.remove('maximized');
          const maxToggleButton = win.querySelector('.toggle-maximize');
          if (maxToggleButton) {
            maxToggleButton.setAttribute('aria-label', 'Maximize');
          }
          hasUnmaximized = true;
        }
        win.style.left = `${e.clientX - offsetX}px`;
        win.style.top = `${e.clientY - offsetY}px`;
      }
    });
    
    // Add touch move handler
    document.addEventListener('touchmove', (e) => {
      if (dragging && e.touches.length === 1) {
        const touch = e.touches[0];
        if (win.classList.contains('maximized') && !hasUnmaximized &&
            (Math.abs(touch.clientX - offsetX) > 5 || Math.abs(touch.clientY - offsetY) > 5)) {
          win.style.left = win.dataset.defaultLeft;
          win.style.top = win.dataset.defaultTop;
          win.style.width = win.dataset.defaultWidth;
          win.style.height = win.dataset.defaultHeight;
          win.classList.remove('maximized');
          const maxToggleButton = win.querySelector('.toggle-maximize');
          if (maxToggleButton) {
            maxToggleButton.setAttribute('aria-label', 'Maximize');
          }
          hasUnmaximized = true;
        }
        win.style.left = `${touch.clientX - offsetX}px`;
        win.style.top = `${touch.clientY - offsetY}px`;
        e.preventDefault(); // Prevent scrolling while dragging
      }
    });
    
    document.addEventListener('mouseup', () => { 
      dragging = false; 
      hasUnmaximized = false;
    });
    
    // Add touch end handler
    document.addEventListener('touchend', () => {
      dragging = false;
      hasUnmaximized = false;
    });
    
    document.addEventListener('touchcancel', () => {
      dragging = false;
      hasUnmaximized = false;
    });
  }
  
  // Add resize handle for Notepad, File Explorer, Internet Explorer, Command Prompt, and VirtualBox
  if (!customCode && (title === 'Notepad' || title === 'File Explorer' || title === 'Internet Explorer' || title === 'Command Prompt' || title === "VirtualBox")) {
    const resizeHandle = document.createElement('div');
    resizeHandle.className = 'resize-handle';
    resizeHandle.style.position = 'absolute';
    resizeHandle.style.width = '15px';
    resizeHandle.style.height = '15px';
    resizeHandle.style.right = '0';
    resizeHandle.style.bottom = '0';
    resizeHandle.style.cursor = 'nwse-resize';
    resizeHandle.style.background = 'rgba(0,0,0,0.2)';
    win.appendChild(resizeHandle);

    resizeHandle.addEventListener('mousedown', (e) => {
      e.stopPropagation();
      e.preventDefault();
      const startWidth = parseFloat(win.style.width);
      const startHeight = parseFloat(win.style.height);
      const startX = e.clientX;
      const startY = e.clientY;

      function doDrag(ev) {
        const newWidth = Math.max(200, startWidth + (ev.clientX - startX));
        const newHeight = Math.max(100, startHeight + (ev.clientY - startY));
        win.style.width = newWidth + 'px';
        win.style.height = newHeight + 'px';
      }
      function stopDrag() {
        document.removeEventListener('mousemove', doDrag);
        document.removeEventListener('mouseup', stopDrag);
      }
      document.addEventListener('mousemove', doDrag);
      document.addEventListener('mouseup', stopDrag);
    });
  }
  
  document.querySelector('.desktop').appendChild(win);

  if (title === 'Internet Explorer') window.initInternetExplorer(win, window.showNotification);
  if (title === 'Snake') window.initSnake(win, window.showNotification);
  if (title === 'Minesweeper') window.initMinesweeper(win, window.showNotification);
  if (title === 'Notepad') window.initNotepad(win, window.showNotification);
  if (title === 'Paint') window.initPaint(win, window.showNotification);
  if (title === 'Calculator') window.initCalculator(win, window.showNotification);
  if (title === 'Hydra App') window.initHydra(win, window.showNotification, createWindow);
  if (title === 'Calendar') window.initCalendar(win, window.showNotification);
  if (title === 'Windows Media Player') window.initMusicPlayer(win, window.showNotification);
  if (title === 'Minecraft') window.initMinecraft(win, window.showNotification);
  if (title === 'Error Takeover') window.initErrorTester(win, window.showNotification);
  if (title === 'You Are An Idiot') window.initIdiot(win, window.showNotification, createWindow);
  if (title === 'Roblox') window.initRoblox(win, window.showNotification);
  if (title === 'AOL Instant Messenger') window.initAIM(win, window.showNotification);
  if (title === 'Command Prompt') window.initCommandPrompt(win, window.showNotification);
  if (title === 'VirtualBox') window.initVirtualBox(win, window.showNotification);
  if (title === 'Task Manager') window.initTaskManager(win, window.showNotification);

  // Set the current file explorer if this is a File Explorer window.
  if (title === "File Explorer") {
    window.currentFileExplorer = win;
  }
  
  // Apply horror mode if active
  if (isHorrorMode && window.applyHorrorToWindow) {
    setTimeout(() => window.applyHorrorToWindow(win), 100);
  }
  
  return win;
}

export function createTaskbarButton(title, win) {
  const taskbarButtons = document.querySelector('.taskbar-buttons');
  const btn = document.createElement('button');
  btn.className = "taskbar-button";
  btn.setAttribute('data-id', win.dataset.id);
  btn.style.border = "none";
  btn.style.outline = "none";
  btn.style.display = "flex";
  btn.style.alignItems = "center";
  btn.style.justifyContent = "flex-start";
  btn.style.padding = "0 5px";
  btn.style.backgroundRepeat = "no-repeat";
  btn.style.backgroundPosition = "center";
  btn.style.backgroundSize = "contain";
  btn.style.userSelect = "none";
  btn.style.boxShadow = "none";
  btn.style.border = "none";

  const iconImg = document.createElement('img');
  iconImg.src = getIcon(title);
  iconImg.style.width = "20px";
  iconImg.style.height = "20px";
  iconImg.style.marginRight = "5px";
  iconImg.style.flexShrink = "0";

  const btnText = document.createElement('span');
  btnText.textContent = title;
  btnText.style.textAlign = "left";
  btnText.style.flexGrow = "1";
  
  btn.appendChild(iconImg);
  btn.appendChild(btnText);
  
  btn.style.backgroundImage = "url('taskbarbutton.png')";
  
  btn.addEventListener('click', () => {
    if (window.currentActiveWindowId && window.currentActiveWindowId !== win.dataset.id) {
      updateTaskbarButtonState(window.currentActiveWindowId, false);
    }
    window.currentActiveWindowId = win.dataset.id;
    updateTaskbarButtonState(win.dataset.id, true);
    
    // When showing a hidden window, use display:flex instead of block
    // This fixes layout issues with windows
    if (win.style.display === 'none') {
      win.style.display = "flex";
    }
    
    win.style.zIndex = getNextZIndex();
  });
  
  btn.addEventListener('mouseover', () => {
    if (window.currentActiveWindowId !== win.dataset.id) {
      btn.style.backgroundImage = "url('taskbarbuttonhighlight.png')";
    }
  });
  btn.addEventListener('mouseout', () => {
    if (window.currentActiveWindowId !== win.dataset.id) {
      btn.style.backgroundImage = "url('taskbarbutton.png')";
    }
  });
  btn.addEventListener('mousedown', () => {
    btn.style.backgroundImage = "url('taskbarbuttonpress.png')";
  });
  btn.addEventListener('mouseup', () => {
    if (window.currentActiveWindowId === win.dataset.id) {
      btn.style.backgroundImage = "url('taskbarbuttonpress.png')";
    } else {
      btn.style.backgroundImage = "url('taskbarbutton.png')";
    }
  });
  
  taskbarButtons.appendChild(btn);
}

function updateTaskbarButtonState(buttonId, isSelected) {
  const btn = document.querySelector(`.taskbar-button[data-id="${buttonId}"]`);
  if (btn) {
    if (isSelected) {
      btn.style.backgroundImage = "url('taskbarbuttonpress.png')";
    } else {
      btn.style.backgroundImage = "url('taskbarbutton.png')";
    }
  }
}

export function openProperties(itemOrPath) {
  if (itemOrPath && itemOrPath.dataset && itemOrPath.dataset.recycleKey) {
    const recycleKey = itemOrPath.dataset.recycleKey;
    if (recycleBin && recycleBin.children && recycleBin.children[recycleKey]) {
      const entry = recycleBin.children[recycleKey];
      const originalPath = entry.originalPath;
      const originalName = entry.originalName;
      const item = entry.item;
      let type = "Unknown";
      let details = "";
      if (item) {
        if (item.type === "file") {
          type = "File";
          details = `File Path: ${originalPath}`;
        } else if (item.type === "folder") {
          type = "Folder";
          details = `Folder Path: ${originalPath}`;
        } else if (item.type === "app") {
          type = "Application";
          details = `Executable/Window: ${originalName}`;
        } else if (item.type === "shortcut") {
          type = "Shortcut";
          details = `Points to: ${item.target || "undefined"}`;
        }
      }
      const content = `
        <div style="padding: 10px; font-family: Tahoma, sans-serif;">
          <h2>Properties — ${originalName}</h2>
          <p><strong>Type:</strong> ${type}</p>
          <p><strong>Details:</strong> ${details}</p>
        </div>
      `;
      createWindow("Properties", content);
      return;
    }
  }
  let filePath = "";
  if (typeof itemOrPath === "string") {
    filePath = itemOrPath;
  } else if (itemOrPath && itemOrPath.dataset && itemOrPath.getAttribute('data-path')) {
    filePath = itemOrPath.getAttribute('data-path');
  } else {
    filePath = itemOrPath.innerText || "";
  }
  if (typeof filePath !== "string") {
    console.error("openProperties: filePath is not a string");
    return;
  }
  const item = getItemByPath(filePath);
  let name = filePath;
  let type = "Unknown";
  let details = "";
  if (item) {
    const segments = filePath.split('/').filter(Boolean);
    name = segments[segments.length - 1];
    if (!name) name = "C:";
    if (item.type === "file") {
      type = "File";
      details = `File Path: ${filePath}`;
    } else if (item.type === "folder") {
      type = "Folder";
      details = `Folder Path: ${filePath}`;
    } else if (item.type === "app") {
      type = "Application";
      details = `Executable/Window: ${name}`;
    } else if (item.type === "shortcut") {
      type = "Shortcut";
      details = `Points to: ${item.target || "undefined"}`;
    }
  }
  const content = `
    <div style="padding: 10px; font-family: Tahoma, sans-serif;">
      <h2>Properties — ${name}</h2>
      <p><strong>Type:</strong> ${type}</p>
      <p><strong>Details:</strong> ${details}</p>
    </div>
  `;
  createWindow("Properties", content);
}