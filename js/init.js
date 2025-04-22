import { fileSystem, getItemByPath, getFolderAndFilename } from "./system.js";
import {
  updateDesktopIcons,
  repositionDesktopIconsInitial,
  addNewAppToDesktop,
  makeDraggable,
  findNextAvailablePosition
} from "./desktop.js";
import { createWindow, createTaskbarButton, openProperties } from "./windowManager.js";
import { getIcon } from "./icons.js"; 
import { initNotepad } from "./notepad.js";
import { initSnake } from "./snake.js";
import { initCalendar } from "./calendar.js";
import { initHydra } from "./hydra.js";
import { initCalculator } from "./calculator.js";
import { initPaint } from "./paint.js";
import { updateFileExplorer } from "./updateFileExplorer.js";
import { initInternetExplorer } from "./internet-explorer.js";
import { initMinesweeper } from "./minesweeper.js";
import { initMusicPlayer } from "./music-player.js";
import { initMinecraft } from "./minecraft.js";
import { initErrorTester } from "./errorTester.js";
import { initIdiot } from "./idiot.js";
import { initRoblox } from "./roblox.js";
import { initAIM } from "./aim.js";
import { openItem } from "./openItem.js";
import { openErrorWindow } from "./errorWindow.js";
import { initCommandPrompt } from "./commandPrompt.js";
import { initBonziBuddy } from "./bonziBuddy.js";
import { initControlPanel } from "./controlPanel.js";
import { initVirtualBox } from "./virtualbox.js";
import { initTaskManager } from "./taskManager.js";

// Make all the necessary functions and objects available globally
window.fileSystem = fileSystem;
window.updateDesktopIcons = updateDesktopIcons;
window.addNewAppToDesktop = addNewAppToDesktop;
window.createWindow = createWindow;
window.createTaskbarButton = createTaskbarButton;
window.openProperties = openProperties;
window.getIcon = getIcon;
window.initNotepad = initNotepad;
window.initSnake = initSnake;
window.initCalendar = initCalendar;
window.initHydra = initHydra;
window.initCalculator = initCalculator;
window.initPaint = initPaint;
window.updateFileExplorer = updateFileExplorer;
window.initInternetExplorer = initInternetExplorer;
window.initMinesweeper = initMinesweeper;
window.initMusicPlayer = initMusicPlayer;
window.initMinecraft = initMinecraft;
window.initErrorTester = initErrorTester;
window.initIdiot = initIdiot;
window.initRoblox = initRoblox;
window.initAIM = initAIM;
window.openItem = openItem;
window.openErrorWindow = openErrorWindow;
window.getItemByPath = getItemByPath;
window.getFolderAndFilename = getFolderAndFilename;  
window.initCommandPrompt = initCommandPrompt;
window.initBonziBuddy = initBonziBuddy;
window.initControlPanel = initControlPanel;
window.initVirtualBox = initVirtualBox;
window.initTaskManager = initTaskManager;

window.showContextMenu = (x, y, options) => {
  import("./contextMenu.js").then(module => module.showContextMenu(x, y, options));
};
window.hideContextMenu = () => {
  import("./contextMenu.js").then(module => module.hideContextMenu());
};

window.showNotification = function(message) {
  const notification = document.createElement('div');
  notification.className = 'notification';
  notification.textContent = message;
  document.body.appendChild(notification);
  setTimeout(() => { notification.remove(); }, 5000);
};

document.addEventListener('DOMContentLoaded', async () => {
  // Play Windows XP startup sound
  const startupSound = new Audio("Windows XP Startup.mp3");
  startupSound.play().catch(err => {
    console.warn('Could not play startup sound:', err);
  });

  updateDesktopIcons();

  // Get the currently logged in user's username and avatar if available
  let username = "User";
  let avatarUrl = "frog.bmp"; // Default avatar
  try {
    const user = await window.websim.getUser();
    if (user) {
      if (user.username) {
        username = user.username;
      }
      if (user.username) {
        // Use the websim avatar URL format
        avatarUrl = `https://images.websim.ai/avatar/${user.username}`;
      }
    }
  } catch (err) {
    console.warn('Could not get user info:', err);
  }

  // Update the start menu header with the username and avatar
  const startMenuHeader = document.querySelector('.start-menu-header');
  if (startMenuHeader) {
    const avatarImg = startMenuHeader.querySelector('img');
    if (avatarImg) {
      avatarImg.src = avatarUrl;
      // Add error handler to fall back to default avatar if user avatar fails to load
      avatarImg.onerror = () => {
        avatarImg.src = "frog.bmp";
      };
    }
    const usernameSpan = startMenuHeader.querySelector('span');
    if (usernameSpan) {
      usernameSpan.textContent = username;
    }
  }

  // Make the start menu wider to accommodate two columns properly.
  const startMenu = document.querySelector('.start-menu');
  startMenu.style.width = "300px";

  // -------------------- Start Menu Setup --------------------
  const startMenuItemsContainer = document.querySelector('.start-menu-items');
  startMenuItemsContainer.innerHTML = "";
  startMenuItemsContainer.style.display = "flex";
  startMenuItemsContainer.style.flexDirection = "row";

  // First column: contains desktop items except those that should appear in the second column.
  const firstColumn = document.createElement('div');
  firstColumn.className = "start-menu-column first-column";
  firstColumn.style.flex = "1";
  firstColumn.style.display = "flex";
  firstColumn.style.flexDirection = "column";
  firstColumn.style.padding = "10px";

  // Separator: thin line between columns.
  const separator = document.createElement('div');
  separator.style.width = "1px";
  separator.style.backgroundColor = "#95bdee";
  separator.style.margin = "0";

  // Second column: set to #d3e5fa colored background; will contain My Documents, My Pictures, My Music, My Computer.
  const secondColumn = document.createElement('div');
  secondColumn.className = "start-menu-column second-column";
  secondColumn.style.flex = "1";
  secondColumn.style.display = "flex";
  secondColumn.style.flexDirection = "column";
  secondColumn.style.backgroundColor = "#d3e5fa";
  secondColumn.style.padding = "10px";
  secondColumn.style.margin = "0";  

  startMenuItemsContainer.appendChild(firstColumn);
  startMenuItemsContainer.appendChild(separator);
  startMenuItemsContainer.appendChild(secondColumn);

  const desktopFolder = window.fileSystem['C:'].children['Desktop'];
  if (desktopFolder && desktopFolder.children) {
    Object.keys(desktopFolder.children).forEach(appName => {
      // Remove "My Documents" and "DANGER!!!" (and also "My Computer" and "Recycle Bin") from the left column.
      if (appName === "My Computer" || appName === "Recycle Bin" || appName === "My Documents" || appName === "DANGER!!!") return;
      
      // Skip games and text files
      if (appName.endsWith('.txt')) return;
      const gameNames = ['Snake', 'Minesweeper', 'Plants vs Zombies', 'Minecraft', 'Roblox', 'Mario'];
      if (gameNames.includes(appName)) return;
      
      const appData = desktopFolder.children[appName];
      const smItem = document.createElement('div');
      smItem.className = 'start-menu-item';
      
      // Determine correct path based on app type and name
      let targetPath;
      if (appData.type === "file") {
        targetPath = `C:/Desktop/${appName}`;
      } else if (appData.type === 'app' || appData.type === 'shortcut') {
        // Check if it's a game
        const gameNames = ['Snake', 'Minesweeper', 'Plants vs Zombies', 'Minecraft', 'Roblox'];
        if (gameNames.includes(appName)) {
          targetPath = `C:/Games/${appName}/`;
        } else {
          targetPath = `C:/Apps/${appName}/`;
        }
      } else {
        targetPath = `C:/Desktop/${appName}`;
      }
      
      smItem.setAttribute('data-path', targetPath);
      
      smItem.innerHTML = `
        <img src="${getIcon(appName)}" alt="${appName} icon" width="32" height="32">
        <span>${appName}</span>
      `;
      smItem.addEventListener('click', () => { 
        const path = smItem.getAttribute('data-path');
        if(path) openItem(path);
        startMenu.style.display = 'none';
      });
      smItem.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        let smOptions = [
          { label: 'Open', action: () => { 
              const path = smItem.getAttribute('data-path');
              if(path) openItem(path);
              window.hideContextMenu();
            }},
          { label: 'Remove', action: () => { smItem.remove(); window.hideContextMenu(); } },
          { label: 'Add to Desktop', action: () => { 
              const fullPath = smItem.getAttribute('data-path') || appName;
              addNewAppToDesktop(appName, appName, fullPath);
              window.hideContextMenu();
            }},
          { label: 'Properties', action: () => { openProperties(smItem.getAttribute('data-path')); window.hideContextMenu(); } }
        ];
        window.showContextMenu(e.pageX, e.pageY, smOptions);
      });
      firstColumn.appendChild(smItem);
    });
  }

  // Find the first column for later use when pinning new items
  const firstColumnForPinning = startMenuItemsContainer.querySelector('.first-column');

  const secondItems = [
    { name: "My Documents", path: "C:/Users/User/Documents/" },
    { name: "My Pictures", path: "C:/Users/User/Pictures/" },
    { name: "My Music", path: "C:/Users/User/Music/" },
    { name: "My Computer", path: "C:/" },
    { name: "Control Panel", path: "C:/Apps/Control Panel/" },
    { name: "Task Manager", path: "C:/Apps/Task Manager/" } 
  ];
  secondItems.forEach(item => {
    const smItem = document.createElement('div');
    smItem.className = 'start-menu-item';
    smItem.setAttribute('data-path', item.path);
    smItem.innerHTML = `
      <img src="${getIcon(item.name)}" alt="${item.name} icon" width="32" height="32">
      <span>${item.name}</span>
    `;
    smItem.addEventListener('click', () => {
      const path = smItem.getAttribute('data-path');
      if(path) openItem(path);
      startMenu.style.display = 'none';
    });
    smItem.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      let smOptions = [
        { label: 'Open', action: () => { 
            const path = smItem.getAttribute('data-path');
            if(path) openItem(path);
            window.hideContextMenu();
          }},
        { label: 'Remove', action: () => { smItem.remove(); window.hideContextMenu(); } },
        { label: 'Add to Desktop', action: () => { 
            const fullPath = smItem.getAttribute('data-path') || item.name;
            addNewAppToDesktop(item.name, item.name, fullPath);
            window.hideContextMenu();
          }},
        { label: 'Properties', action: () => { openProperties(smItem.getAttribute('data-path')); window.hideContextMenu(); } }
      ];
      window.showContextMenu(e.pageX, e.pageY, smOptions);
    });
    secondColumn.appendChild(smItem);
  });

  const startButton = document.querySelector('.start-button');
  startButton.addEventListener('click', (e) => {
    e.stopPropagation();
    startMenu.style.display = startMenu.style.display === 'block' ? 'none' : 'block';
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.start-menu') && !e.target.closest('.start-button')) {
      startMenu.style.display = 'none';
    }
  });

  function updateClock() {
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    document.getElementById('clock').style.marginRight = "20px";
    document.getElementById('clock').textContent = timeString;
  }
  setInterval(updateClock, 1000);
  updateClock();
});