// Global system state: file system and utility functions.
export const fileSystem = {
  'C:': {
    type: "folder",
    children: {
      'Desktop': {
        type: "folder",
        children: {
          'My Computer': { type: "app" },
          'Recycle Bin': { type: "app" },  
          'Internet Explorer': { type: "shortcut", target: "C:/Apps/Internet Explorer/" },
          'Notepad': { type: "shortcut", target: "C:/Apps/Notepad/" },
          'Paint': { type: "shortcut", target: "C:/Apps/Paint/" },
          'Calculator': { type: "shortcut", target: "C:/Apps/Calculator/" },
          'Calendar': { type: "shortcut", target: "C:/Apps/Calendar/" },
          'Windows Media Player': { type: "shortcut", target: "C:/Apps/Windows Media Player/" },
          'Snake': { type: "shortcut", target: "C:/Games/Snake/" },
          'Minesweeper': { type: "shortcut", target: "C:/Games/Minesweeper/" },
          'Plants vs Zombies': { type: "shortcut", target: "C:/Games/Plants vs Zombies/" },
          'Minecraft': { type: "shortcut", target: "C:/Games/Minecraft/" },
          'Roblox': { type: "shortcut", target: "C:/Games/Roblox/" },
          'Mario': { type: "shortcut", target: "C:/Games/Mario/" },
          'AOL Instant Messenger': { type: "shortcut", target: "C:/Apps/AOL Instant Messenger/" },
          'Command Prompt': { type: "shortcut", target: "C:/Apps/Command Prompt/" },
          'BonziBuddy': { type: "shortcut", target: "C:/Apps/BonziBuddy/" },
          'VirtualBox': { type: "shortcut", target: "C:/Apps/VirtualBox/" },
          'README.txt': { 
            type: "file", 
            content: "I hope you enjoy this Windows XP recreation made by me, BookwormKevin. Be careful with the programs located in the Danger folder, because some of them have flashing lights and loud sounds. Some of the icons come from this HD icon pack: https://www.deviantart.com/marchmountain/art/Windows-XP-High-Resolution-Icon-Pack-916042853. I am planning to add apps to this over time, so please comment what you want to see me add!"
          },
          'DANGER!!!': {
            type: "folder",
            children: {
              'Hydra App': { type: "shortcut", target: "C:/Apps/Hydra App/" },
              'Error Takeover': { type: "shortcut", target: "C:/Apps/Error Takeover/" },
              'You Are An Idiot': { type: "shortcut", target: "C:/Apps/You Are An Idiot/" },
              'totally not a virus': { type: "app", virus: true }
            }
          }
        }
      },
      'Games': {
        type: "folder",
        children: {
          'Snake': { type: "app" },
          'Minesweeper': { type: "app" },
          'Hydra App': { type: "app" },
          'Plants vs Zombies': { type: "app" },
          'Minecraft': { type: "app" },
          'Roblox': { type: "app" },
          'Mario': { type: "app" }
        }
      },
      'Apps': {
        type: "folder",
        children: {
          'Internet Explorer': { type: "app" },
          'Notepad': { type: "app" },
          'Paint': { type: "app" },
          'Calculator': { type: "app" },
          'Calendar': { type: "app" },
          'Windows Media Player': { type: "app" },
          'Error Takeover': { type: "app" },
          'Hydra App': { type: "app" },
          'You Are An Idiot': { type: "app" },
          'AOL Instant Messenger': { type: "app" },
          'Command Prompt': { type: "app" },
          'BonziBuddy': { type: "app" },
          'VirtualBox': { type: "app" },
          'Control Panel': { type: "app" },
          'Task Manager': { type: "app" }
        }
      },
      'Program Files': {
        type: "folder",
        children: {
          'Paint': { type: "app" }
        }
      },
      'Users': {
        type: "folder",
        children: {
          'User': {
            type: "folder",
            children: {
              'Documents': {
                type: "folder",
                children: {
                  'readme.txt': { type: "file", content: "This is a sample text file in My Documents." },
                  'notepad.txt': { type: "file", content: "Some text content for Notepad" }
                }
              },
              'Pictures': { type: "folder", children: {} },
              'Music': { type: "folder", children: {} }
            }
          }
        }
      }
    }
  }
};

// Internal counter for window z-index management.
let internalZIndex = 1;
export function getNextZIndex() {
  return internalZIndex++;
}

let windowCounter = 0; 
export function getNextWindowId() {
  return windowCounter++;
}

export function getItemByPath(path) {
  const cleanPath = path.replace(/^[A-Za-z]:[\\/]/, '');
  const parts = cleanPath.split(/[\\/]/).filter(Boolean);
  let current = fileSystem['C:'];
  for (let part of parts) {
    if (current && current.children && current.children.hasOwnProperty(part)) {
      current = current.children[part];
    } else {
      return null;
    }
  }
  return current;
}

// New helper: splits a full file path into its parent folder and filename.
export function getFolderAndFilename(path) {
  if (!path.startsWith("C:/")) return { folder: null, filename: null };
  const withoutRoot = path.slice(3); // Remove "C:/"
  const parts = withoutRoot.split('/').filter(Boolean);
  if (parts.length === 0) return { folder: fileSystem['C:'], filename: "" };
  const filename = parts.pop();
  let current = fileSystem['C:'];
  parts.forEach(part => {
    if (current && current.children && current.children[part]) {
      current = current.children[part];
    } else {
      current = null;
    }
  });
  return { folder: current, filename: filename };
}

// Added recycleBin as a special, separate folder.
export const recycleBin = {
  type: "recyclebin",
  children: {}
};