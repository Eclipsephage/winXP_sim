// Consolidated icon mapping for all apps and folders.
const iconMapping = {
  "my computer": "My Computer.ico",
  "recycle bin": "recycle-bin-683244_960_720.webp",
  "internet explorer": "Internet Explorer 6.png", 
  "paint": "21w0apjl-removebg-preview.png",
  "notepad": "46db106a40ebe01622b1694521444a59-removebg-preview(1).png",
  "snake": "54965.jpg",
  "hydra app": "hydra.webp",
  "windows media player": "media player icon.webp",
  "calculator": "Calculator.png",  
  "calendar": "https://win98icons.alexmeub.com/icons/png/calendar-4.png",
  "plants vs zombies": "ZombieHead.png",
  "minesweeper": "Minesweeper.png",
  "my documents": "MyDocuments[1].png",
  "my pictures": "fig-05_1_-removebg-preview.png",
  "my music": "My_Music_WinXP.webp",
  "minecraft": "minecraft.png",
  "roblox": "Roblox_icon_2006.svg",
  "mario": "LUMMM_icon_512px.png",
  "aol instant messenger": "aim.webp",
  "folder": "folder.png",
  "error takeover": "error.png",
  "you are an idiot": "Idioticon.png",
  "totally not a virus": "exe-icon.png",
  "bonzibuddy": "bonzi-icon.png",
  "virtualbox": "Virtualbox_logo.png",
  ".txt": "TXT.png",
  ".bmp": "Bitmap.png",
  "command prompt": "Command Prompt.png",
  "control panel": "Control Panel.png",
  "task manager": "Task Manager.png"
};

export function getIcon(appName) {
  const name = appName.toLowerCase();
  // Check for file extensions first
  if(name.endsWith('.txt')) {
    return iconMapping[".txt"];
  }
  if(name.endsWith('.bmp')) {
    return iconMapping[".bmp"];
  }
  if (name === "my computer" || name === "recycle bin") {
    return iconMapping[name];
  }
  if (name === "my documents") {
    return iconMapping["my documents"];
  }
  if (name === "my pictures") {
    return iconMapping["my pictures"];
  }
  if (name === "my music") {
    return iconMapping["my music"];
  }
  if (iconMapping.hasOwnProperty(name)) {
    return iconMapping[name];
  }
  return iconMapping["folder"];
}