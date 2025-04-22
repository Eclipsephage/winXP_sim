// Horror mode implementation for Windows XP
let horrorModeActive = false;

// Toggle horror mode on/off
export function toggleHorrorMode() {
  horrorModeActive = !horrorModeActive;
  
  if (horrorModeActive) {
    activateHorrorMode();
    window.showNotification("Horror Mode Activated ");
  } else {
    deactivateHorrorMode();
    window.showNotification("Horror Mode Deactivated");
  }
}

// Check if horror mode is active
export function isHorrorModeActive() {
  return horrorModeActive;
}

// Activate horror mode
function activateHorrorMode() {
  // Change background to creepy image
  const desktop = document.querySelector('.desktop');
  if (desktop) {
    desktop.style.backgroundImage = "url('scarybliss.jpg')";
    desktop.style.backgroundSize = "cover";
  }
  
  // Add scary sound effects
  const scaryAmbient = new Audio("https://freesound.org/data/previews/324/324749_5260872-lq.mp3");
  scaryAmbient.loop = true;
  scaryAmbient.volume = 0.3;
  window._horrorAmbient = scaryAmbient;
  scaryAmbient.play().catch(err => console.warn('Could not play audio:', err));
  
  // Apply filter to entire screen
  document.body.classList.add('horror-mode');
  const horrorStyle = document.createElement('style');
  horrorStyle.id = 'horror-mode-style';
  horrorStyle.textContent = `
    .horror-mode .desktop {
      filter: sepia(0.5) hue-rotate(-20deg) contrast(1.1) brightness(0.8);
    }
    .horror-mode .window {
      box-shadow: 0 0 15px #6b0000 !important;
    }
    .horror-mode .window-content, .horror-mode .window-body {
      background-color: rgba(0, 0, 0, 0.85) !important;
      color: #ff5555 !important;
    }
    .horror-mode button, .horror-mode input, .horror-mode select, .horror-mode textarea {
      background-color: #300 !important;
      color: #faa !important;
      border-color: #700 !important;
    }
    .horror-mode .desktop::after {
      content: '';
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      background: repeating-linear-gradient(
        0deg,
        rgba(0, 0, 0, 0) 0px,
        rgba(0, 0, 0, 0) 1px,
        rgba(255, 0, 0, 0.03) 1px,
        rgba(255, 0, 0, 0.03) 2px
      );
      animation: scanline 10s linear infinite;
    }
    @keyframes scanline {
      0% { background-position: 0 0; }
      100% { background-position: 0 100%; }
    }
    .horror-mode .icon span, .horror-mode .start-menu-item span {
      color: #ff9999;
      text-shadow: 1px 1px 3px #f00;
    }
    .horror-mode ::selection {
      background-color: #600;
      color: #fcc;
    }
    .horror-flicker {
      animation: horror-flicker 4s ease-in-out infinite;
    }
    @keyframes horror-flicker {
      0% { opacity: 1; }
      92% { opacity: 1; }
      93% { opacity: 0.3; }
      94% { opacity: 1; }
      95% { opacity: 0.2; }
      96% { opacity: 1; }
      97% { opacity: 0.5; }
      100% { opacity: 1; }
    }
  `;
  document.head.appendChild(horrorStyle);
  
  // Apply to all open windows
  const windows = document.querySelectorAll('.window');
  windows.forEach(applyHorrorToWindow);
  
  // Apply to desktop icons
  const icons = document.querySelectorAll('.icon');
  icons.forEach(icon => {
    icon.classList.add('horror-flicker');
  });
  
  // Replace clock with creepy text
  const clock = document.getElementById('clock');
  if (clock) {
    window._originalClockUpdate = clock._updateFunction;
    clock._updateFunction = function() {
      const hour = new Date().getHours();
      const min = new Date().getMinutes();
      
      // Every 13th minute, show 666
      if (min % 13 === 0) {
        clock.textContent = "6:66";
      } else {
        clock.textContent = `${hour}:${min.toString().padStart(2, '0')}`;
      }
    };
    
    // Start the creepy clock update
    if (window._clockInterval) clearInterval(window._clockInterval);
    window._clockInterval = setInterval(clock._updateFunction, 1000);
  }
  
  // Override window creation to apply horror styles
  const originalCreateWindow = window.createWindow;
  window.createWindow = function(title, customCode) {
    const win = originalCreateWindow(title, customCode);
    
    // Apply horror effects after a small delay
    setTimeout(() => {
      if (horrorModeActive) {
        applyHorrorToWindow(win);
      }
    }, 100);
    
    return win;
  };
  
  // Scary error sound override
  window._originalOpenErrorWindow = window.openErrorWindow;
  window.openErrorWindow = function(message, randomPlacement) {
    // Play a scarier error sound
    const audio = new Audio("https://freesound.org/data/previews/367/367332_6823467-lq.mp3");
    audio.volume = 0.5;
    audio.play().catch(err => console.warn('Could not play audio:', err));
    
    // Use the original function but modify message
    const scarierMessage = message.replace(/error|failed|cannot|invalid/gi, match => `${match} `);
    return window._originalOpenErrorWindow(scarierMessage, true);
  };
}

// Special horror effects for specific apps
function applyHorrorToWindow(win) {
  if (!win) return;
  
  // Add horror flicker to all windows
  win.classList.add('horror-flicker');
  
  // Get the title to identify the app
  const titleBar = win.querySelector('.title-bar-text');
  if (!titleBar) return;
  
  const title = titleBar.textContent;
  console.log(`Applying horror to: ${title}`);
  
  // Play a random scary sound
  const randomScarySounds = [
    "https://freesound.org/data/previews/324/324749_5260872-lq.mp3", // Whisper
    "https://freesound.org/data/previews/513/513688_4930652-lq.mp3", // Creaky door
    "https://freesound.org/data/previews/274/274782_5014159-lq.mp3", // Scary drone
    "https://freesound.org/data/previews/124/124922_1099028-lq.mp3"  // Horror hit
  ];
  
  const randomSound = new Audio(randomScarySounds[Math.floor(Math.random() * randomScarySounds.length)]);
  randomSound.volume = 0.3;
  randomSound.play().catch(err => console.warn('Could not play audio:', err));
  
  // Apply specific horror effects based on app
  const contentArea = win.querySelector('.window-content') || win.querySelector('.window-body');
  if (!contentArea) return;
  
  // Change title with scary emojis
  titleBar.textContent = `${title} `;
  
  // Custom effects per app type
  if (title.includes("Notepad")) {
    applyNotepadHorror(win, contentArea);
  } else if (title.includes("Internet Explorer")) {
    applyIEHorror(win, contentArea);
  } else if (title.includes("Paint")) {
    applyPaintHorror(win, contentArea);
  } else if (title.includes("Calculator")) {
    applyCalculatorHorror(win, contentArea);
  } else if (title.includes("Minesweeper")) {
    applyMinesweeperHorror(win, contentArea);
  } else if (title.includes("Calendar")) {
    applyCalendarHorror(win, contentArea);
  } else if (title.includes("Media Player")) {
    applyMediaPlayerHorror(win, contentArea);
  } else if (title.includes("File Explorer")) {
    applyFileExplorerHorror(win, contentArea);
  } else if (title.includes("Command Prompt")) {
    applyCommandPromptHorror(win, contentArea);
  } else if (title.includes("Mario")) {
    applyMarioHorror(win, contentArea);
  }
  
  // Add blood drips to window
  addBloodDrips(win);
}

// Deactivate horror mode
function deactivateHorrorMode() {
  // Reset background
  const desktop = document.querySelector('.desktop');
  if (desktop) {
    desktop.style.backgroundImage = "url('/bg.jpg')";
  }
  
  // Stop scary sound
  if (window._horrorAmbient) {
    window._horrorAmbient.pause();
    window._horrorAmbient = null;
  }
  
  // Remove horror styles
  document.body.classList.remove('horror-mode');
  const horrorStyle = document.getElementById('horror-mode-style');
  if (horrorStyle) {
    horrorStyle.remove();
  }
  
  // Reset all windows
  const windows = document.querySelectorAll('.window');
  windows.forEach(win => {
    win.classList.remove('horror-flicker');
    
    // Remove blood drips
    const drips = win.querySelectorAll('.blood-drip');
    drips.forEach(drip => drip.remove());
    
    // Reset title
    const titleBar = win.querySelector('.title-bar-text');
    if (titleBar && titleBar.textContent.includes(' ')) {
      titleBar.textContent = titleBar.textContent.replace(' ', '');
    }
  });
  
  // Reset desktop icons
  const icons = document.querySelectorAll('.icon');
  icons.forEach(icon => {
    icon.classList.remove('horror-flicker');
  });
  
  // Reset clock
  const clock = document.getElementById('clock');
  if (clock) {
    // Clear the horror mode clock interval if it exists
    if (window._clockInterval) {
      clearInterval(window._clockInterval);
      window._clockInterval = null;
    }
    // Create new interval for normal clock updates
    setInterval(function() {
      const now = new Date();
      const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      clock.textContent = timeString;
    }, 1000);

    // Update immediately
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    clock.textContent = timeString;
  }
  
  // Reset window creation override
  if (window._originalCreateWindow) {
    window.createWindow = window._originalCreateWindow;
  }
  
  // Reset error window function
  if (window._originalOpenErrorWindow) {
    window.openErrorWindow = window._originalOpenErrorWindow;
  }
}

// App-specific horror effects
function applyNotepadHorror(win, contentArea) {
  const textarea = contentArea.querySelector('textarea');
  if (!textarea) return;
  
  // Save original text
  const originalText = textarea.value;
  
  // Add creepy text
  const creepyMessages = [
    "I see you typing...",
    "Don't look behind you...",
    "I'm trapped in this computer...",
    "Save me... save me... save me...",
    "Your words will be your last...",
    "Every keystroke brings it closer...",
    "HE COMES "
  ];
  
  // Insert creepy text randomly
  let positionToInsert = Math.min(Math.floor(originalText.length * Math.random()), originalText.length);
  const messageToInsert = "\n\n" + creepyMessages[Math.floor(Math.random() * creepyMessages.length)] + "\n\n";
  
  let newText = originalText.slice(0, positionToInsert) + messageToInsert + originalText.slice(positionToInsert);
  textarea.value = newText;
  
  // Occasionally have the text move by itself
  const randomTypeInterval = setInterval(() => {
    if (!horrorModeActive || !document.body.contains(textarea)) {
      clearInterval(randomTypeInterval);
      return;
    }
    
    // 30% chance to type a creepy character
    if (Math.random() < 0.3) {
      const creepyChars = [' ', ' ', '', '', '', 'H', 'E', 'L', 'P'];
      textarea.value += creepyChars[Math.floor(Math.random() * creepyChars.length)];
    }
  }, 10000);
}

function applyIEHorror(win, contentArea) {
  const iframe = contentArea.querySelector('iframe');
  if (!iframe) return;
  
  // Modify iframe content to show creepy page
  iframe.srcdoc = `
    <style>
      body {
        background-color: black;
        color: #ff0000;
        font-family: monospace;
        text-align: center;
        margin: 0;
        overflow: hidden;
      }
      .container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100vh;
      }
      h1 {
        font-size: 30px;
        letter-spacing: 2px;
        animation: flicker 3s infinite;
      }
      @keyframes flicker {
        0% { opacity: 1; }
        92% { opacity: 1; }
        93% { opacity: 0.3; }
        94% { opacity: 1; }
        95% { opacity: 0.2; }
        96% { opacity: 1; }
      }
      .eye {
        font-size: 80px;
        animation: pulse 2s infinite;
      }
      @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.2); }
        100% { transform: scale(1); }
      }
      .message {
        font-size: 18px;
        margin-top: 20px;
        max-width: 80%;
      }
      .blood {
        position: absolute;
        top: 0;
        width: 10px;
        height: 50px;
        background: linear-gradient(to bottom, transparent, #f00, #900);
        animation: drip 10s infinite;
      }
      @keyframes drip {
        0% { height: 0; top: 0; }
        70% { height: 50px; top: 0; }
        100% { height: 50px; top: 100%; }
      }
    </style>
    <div class="container">
      <h1>CONNECTION TERMINATED</h1>
      <div class="eye"></div>
      <p class="message">Your browsing history has been recorded. We know what you did.</p>
      <p class="message">Your IP: ${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}</p>
      <p class="message">Location: <span id="location">Accessing...</span></p>
    </div>
    <script>
      // Add random blood drips
      for (let i = 0; i < 10; i++) {
        const blood = document.createElement('div');
        blood.className = 'blood';
        blood.style.left = Math.random() * 100 + '%';
        blood.style.animationDelay = Math.random() * 5 + 's';
        document.body.appendChild(blood);
      }
      
      // Simulate "finding location"
      setTimeout(() => {
        document.getElementById('location').textContent = 'Found You.';
      }, 3000);
      
      // Add creepy sounds
      setTimeout(() => {
        const audio = new Audio('https://freesound.org/data/previews/367/367802_1763234-lq.mp3');
        audio.volume = 0.2;
        audio.play().catch(e => console.log('Audio failed to play:', e));
      }, 1000);
    </script>
  `;
  
  // Modify address bar
  const urlBar = contentArea.querySelector('#url-bar');
  if (urlBar) {
    urlBar.value = "http://trapped.in.the.web";
  }
}

function applyPaintHorror(win, contentArea) {
  const canvas = contentArea.querySelector('canvas');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  
  // Draw creepy face on the canvas
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  ctx.fillStyle = 'red';
  ctx.beginPath();
  
  // Draw pentagram
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const radius = Math.min(canvas.width, canvas.height) * 0.3;
  const points = [];
  
  for (let i = 0; i < 5; i++) {
    const angle = (i * 2 * Math.PI / 5) - Math.PI / 2;
    points.push({
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle)
    });
  }
  
  ctx.moveTo(points[0].x, points[0].y);
  ctx.lineTo(points[2].x, points[2].y);
  ctx.lineTo(points[4].x, points[4].y);
  ctx.lineTo(points[1].x, points[1].y);
  ctx.lineTo(points[3].x, points[3].y);
  ctx.closePath();
  
  ctx.strokeStyle = 'red';
  ctx.lineWidth = 5;
  ctx.stroke();
  
  // Add bloody eyes
  ctx.fillStyle = 'red';
  ctx.beginPath();
  ctx.arc(centerX - radius/2, centerY - radius/2, radius/8, 0, 2 * Math.PI);
  ctx.arc(centerX + radius/2, centerY - radius/2, radius/8, 0, 2 * Math.PI);
  ctx.fill();
  
  // Add dripping effect
  const drips = 8;
  for (let i = 0; i < drips; i++) {
    const x = Math.random() * canvas.width;
    const height = 50 + Math.random() * 100;
    
    ctx.fillStyle = 'red';
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x + 10, 0);
    ctx.lineTo(x + 5, height);
    ctx.closePath();
    ctx.fill();
  }
  
  // Add text
  ctx.font = '30px Arial';
  ctx.fillStyle = 'white';
  ctx.fillText("DON'T DRAW HERE", centerX - 120, canvas.height - 50);
}

function applyCalculatorHorror(win, contentArea) {
  const display = contentArea.querySelector('#calc-display');
  if (!display) return;
  
  // Set creepy initial value
  display.value = "666";
  
  // Override button clicks
  const buttons = contentArea.querySelectorAll('.calc-btn');
  buttons.forEach(btn => {
    const originalClick = btn.onclick;
    btn.onclick = function(e) {
      // 30% chance to replace result with creepy message
      if (Math.random() < 0.3) {
        setTimeout(() => {
          const creepyValues = ["666", "13", "HELP", "DIE", "7734"];
          display.value = creepyValues[Math.floor(Math.random() * creepyValues.length)];
        }, 100);
      }
      
      if (originalClick) {
        originalClick.call(this, e);
      }
    };
  });
}

function applyMinesweeperHorror(win, contentArea) {
  // Make all cells look like skulls or blood
  const cells = contentArea.querySelectorAll('#minesweeper-grid div');
  cells.forEach(cell => {
    if (Math.random() < 0.3) {
      cell.textContent = "";
      cell.style.backgroundColor = "#300";
    } else if (Math.random() < 0.2) {
      cell.textContent = "";
      cell.style.backgroundColor = "#300";
    }
  });
  
  // Change difficulty text
  const difficultySelect = contentArea.querySelector('#difficulty-select');
  if (difficultySelect) {
    const options = difficultySelect.querySelectorAll('option');
    options.forEach(option => {
      if (option.value === 'easy') option.textContent = "Deadly (9x9, 10 traps)";
      if (option.value === 'medium') option.textContent = "Fatal (16x16, 40 traps)";
      if (option.value === 'hard') option.textContent = "Nightmare (16x30, 99 traps)";
    });
  }
}

function applyCalendarHorror(win, contentArea) {
  // Make calendar show Friday the 13th
  const monthDisplay = contentArea.querySelector('.window-content-inner span');
  if (monthDisplay) {
    monthDisplay.textContent = "October 2023";
  }
  
  // Mark Friday the 13th on calendar
  const cells = contentArea.querySelectorAll('td');
  cells.forEach(cell => {
    if (cell.textContent === '13') {
      cell.style.backgroundColor = '#f00';
      cell.style.color = '#000';
      cell.style.fontWeight = 'bold';
    } else if (Math.random() < 0.1) {
      cell.style.backgroundImage = 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'20\' height=\'20\'><text x=\'0\' y=\'15\' fill=\'%23f00\'></text></svg>")';
      cell.style.backgroundRepeat = 'no-repeat';
      cell.style.backgroundPosition = 'center';
    }
  });
}

function applyMediaPlayerHorror(win, contentArea) {
  // Change song titles to creepy titles
  const playlist = contentArea.querySelector(`#mp-playlist-${win.dataset.id}`);
  if (playlist) {
    const items = playlist.querySelectorAll('li');
    const creepySongs = [
      "Screams from the Basement",
      "They're Inside the Walls",
      "Your Last Night",
      "Don't Look Behind You",
      "The Whispers",
      "I'm Under Your Bed",
      "What's That Noise?",
      "It Follows",
      "Midnight Visitor",
      "Never Sleep Again",
      "The Thing in the Closet",
      "You're Next"
    ];
    
    items.forEach((item, index) => {
      const creepyIndex = index % creepySongs.length;
      item.textContent = creepySongs[creepyIndex];
      // Store original title for restoration
      if (!item.dataset.originalTitle) {
        item.dataset.originalTitle = item.textContent;
      }
    });
    
    // Change current song info
    const songInfo = contentArea.querySelector(`#mp-song-info-${win.dataset.id}`);
    if (songInfo) {
      if (!songInfo.dataset.originalTitle) {
        songInfo.dataset.originalTitle = songInfo.textContent;
      }
      songInfo.textContent = "Now Playing: " + creepySongs[0];
    }
  }
}

function applyFileExplorerHorror(win, contentArea) {
  // Change file and folder names
  const items = contentArea.querySelectorAll('.window-content > div:last-child > div');
  const creepyNames = [
    "DO_NOT_OPEN",
    "HELP_ME_PLEASE",
    "HIDDEN_BODIES",
    "LAST_WORDS",
    "IT_SEES_YOU",
    "DELETE_ME",
    "CURSED_FILE",
    "INFECTION",
    "BEHIND_YOU",
    "YOUR_END",
    "WATCHING"
  ];
  
  items.forEach(item => {
    const nameElement = item.querySelector('div:last-child');
    if (nameElement && Math.random() < 0.3) {
      nameElement.textContent = creepyNames[Math.floor(Math.random() * creepyNames.length)];
    }
  });
}

function applyCommandPromptHorror(win, contentArea) {
  // Add creepy messages to command prompt
  const terminal = contentArea.querySelector('pre');
  if (terminal) {
    const originalText = terminal.textContent;
    const creepyAscii = `
    
                  .....
               .dKWMMMMNKd.
              .XMMMMMMMMMMMx
              kMMMMMMMMMMMMM'
              'NMMMMMMMMMMMx
               'NMMMMMMMMMMMK.
         .:o:.   .dNMMMMMMMMMMXl  .;ox;
        cNMMMX,    .oXMMMMMMMMMMWx.lWMMMO
       .WMMMMMO.     .oNMMMMMMMMMMMkdMMMMN'
       oMMMMMMWl       :XMMMMMMMMMMMWMMMMM:
       kMMMMMMMWo.      ;KMMMMMMMMMMMMMMMMK
       oMMMMMMMMM0:.     ,0MMMMMMMMMMMMMMX
       .NMMMMMMMMMNk;.    ,0MMMMMMMMMMMMMMX
        lMMMMMMMMMMMMXd;.  ;KMMMMMMMMMMMMMX
         dMMMMMMMMMMMMMMNkc;dNMMMMMMMMMMMW:
          :XMMMMMMMMMMMMMMMMMMMMMMMMMMMMWl
           .xNMMMMMMMMMMMMMMMMMMMMMMMMM0,
             .cONMMMMMMMMMMMMWNKkl,.
                     
ACCESS DENIED: UNAUTHORIZED USER DETECTED
SYSTEM LOCK INITIATED
...
SECURITY PROTOCOL BREACHED
UNKNOWN ENTITY DETECTED IN SYSTEM
...
`;
    terminal.textContent = originalText + creepyAscii;
    
    // Add blinking cursor that moves slower for horror effect
    const cursor = document.createElement('span');
    cursor.textContent = "";
    cursor.style.animation = "blink 1s step-end infinite";
    terminal.appendChild(cursor);
    
    // Create style for blinking cursor
    const style = document.createElement('style');
    style.textContent = `
      @keyframes blink {
        0%, 50% { opacity: 1; }
        51%, 100% { opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }
}

function applyMarioHorror(win, contentArea) {
  // For Mario, we'll distort the iframe by adding a filter layer on top
  const iframe = contentArea.querySelector('iframe');
  if (!iframe) return;
  
  // Create a distortion overlay
  const overlay = document.createElement('div');
  overlay.style.position = 'absolute';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100%';
  overlay.style.height = '100%';
  overlay.style.background = 'rgba(100, 0, 0, 0.2)';
  overlay.style.pointerEvents = 'none';
  overlay.style.zIndex = '10';
  overlay.style.mixBlendMode = 'multiply';
  overlay.style.animation = 'flicker 3s infinite';
  contentArea.style.position = 'relative';
  contentArea.appendChild(overlay);
  
  // Create random static flashes
  setInterval(() => {
    if (Math.random() < 0.1) {
      overlay.style.background = 'rgba(255, 255, 255, 0.1)';
      setTimeout(() => {
        overlay.style.background = 'rgba(100, 0, 0, 0.2)';
      }, 50);
    }
  }, 2000);
  
  // Add spooky message
  const message = document.createElement('div');
  message.style.position = 'absolute';
  message.style.bottom = '20px';
  message.style.left = '50%';
  message.style.transform = 'translateX(-50%)';
  message.style.color = '#ff0000';
  message.style.textShadow = '2px 2px 4px #000';
  message.style.fontFamily = 'serif';
  message.style.fontSize = '24px';
  message.style.opacity = '0';
  message.style.pointerEvents = 'none';
  message.style.zIndex = '11';
  message.style.whiteSpace = 'nowrap';
  message.textContent = "He shouldn't be here...";
  message.style.animation = 'horror-flicker 20s ease-in-out infinite';
  contentArea.appendChild(message);
}

// Add blood drip effect to window
function addBloodDrips(win) {
  const numberOfDrips = 3 + Math.floor(Math.random() * 4);
  
  for (let i = 0; i < numberOfDrips; i++) {
    const drip = document.createElement('div');
    drip.className = 'blood-drip';
    drip.style.position = 'absolute';
    drip.style.top = '0';
    drip.style.left = (Math.random() * 100) + '%';
    drip.style.width = (5 + Math.random() * 10) + 'px';
    drip.style.height = (50 + Math.random() * 100) + 'px';
    drip.style.background = 'linear-gradient(to bottom, rgba(255,0,0,0), rgba(128,0,0,0.8))';
    drip.style.zIndex = '1000';
    drip.style.pointerEvents = 'none';
    win.appendChild(drip);
  }
}

// Initialize horror mode button in system menu
document.addEventListener('DOMContentLoaded', () => {
  // Add horror mode toggle to start menu
  setTimeout(() => {
    const startMenuSecondColumn = document.querySelector('.start-menu .second-column');
    if (startMenuSecondColumn) {
      const horrorModeItem = document.createElement('div');
      horrorModeItem.className = 'start-menu-item';
      horrorModeItem.style.marginTop = '20px';
      horrorModeItem.innerHTML = `
        <span style="color: #f00; font-weight: bold;">Toggle Horror Mode </span>
      `;
      horrorModeItem.addEventListener('click', () => {
        toggleHorrorMode();
        const startMenu = document.querySelector('.start-menu');
        if (startMenu) startMenu.style.display = 'none';
      });
      startMenuSecondColumn.appendChild(horrorModeItem);
    }
    
    // Add horror mode context menu option to desktop
    const desktop = document.querySelector('.desktop');
    if (desktop) {
      desktop.addEventListener('contextmenu', (e) => {
        if (e.target === desktop) {
          e.preventDefault();
          const options = [
            { 
              label: horrorModeActive ? ' Disable Horror Mode' : ' Enable Horror Mode', 
              action: () => { 
                toggleHorrorMode();
                window.hideContextMenu();
              }
            }
          ];
          
          // Add the horror mode option to the beginning of the context menu
          if (window.showContextMenu) {
            // Get original context menu options
            const originalOptions = [];
            // Combine options
            window.showContextMenu(e.pageX, e.pageY, [...options, ...originalOptions]);
          }
        }
      });
    }
  }, 1000);
});