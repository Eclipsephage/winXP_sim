export function initIdiot(win, showNotification, createWindow) {
  // Use window-content (or window-body) as container
  const contentArea = win.querySelector('.window-content') || win.querySelector('.window-body');
  contentArea.innerHTML = "";

  // Create a large image element for the GIF
  const img = document.createElement('img');
  img.src = "You are an idiot.gif";
  img.style.width = "100%";
  img.style.height = "auto";
  contentArea.appendChild(img);

  // Create and start an audio element playing on loop
  const audio = new Audio("You are an idiot.mp3");
  audio.loop = true;
  audio.play().catch(() => {
    // Some browsers require a user gesture to start audio
    showNotification("Audio playback was prevented; please interact with the page.");
  });

  // Override the Close button event to trigger the idiotic barrage
  const closeBtn = win.querySelector('button[aria-label="Close"]');
  if (closeBtn) {
    closeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      // Stop the audio in this main window
      audio.pause();
      // Remove the main window
      win.remove();
      // Start spawning a barrage of bouncing, small windows
      startIdioticBarrage(createWindow, showNotification);
    });
  }
}

function startIdioticBarrage(createWindow, showNotification) {
  showNotification("You just closed 'You Are An Idiot'. Enjoy the idiocy!");
  // Spawn a new small window every 500ms
  const spawnInterval = setInterval(() => {
    spawnIdiotWindow(createWindow, showNotification);
  }, 500);

  // If not already started, begin the bouncing update loop (runs every 20ms)
  if (!window._idiotBouncingInterval) {
    window._idiotBouncingInterval = setInterval(updateIdioticWindows, 20);
  }
}

function spawnIdiotWindow(createWindow, showNotification) {
  // Create a new window with the title "You Are An Idiot"
  const idiotWin = createWindow("You Are An Idiot");
  // Mark as an "idiot" window so it can be updated later for bouncing
  idiotWin.setAttribute('data-idiot', 'true');
  // Force a small window size
  idiotWin.style.width = "150px";
  idiotWin.style.height = "130px";

  // Set up content: a full-size gif image and an audio element playing on loop
  const contentArea = idiotWin.querySelector('.window-content') || idiotWin.querySelector('.window-body');
  contentArea.innerHTML = "";
  const img = document.createElement('img');
  img.src = "You are an idiot.gif";
  img.style.width = "100%";
  img.style.height = "auto";
  contentArea.appendChild(img);

  const audio = new Audio("You are an idiot.mp3");
  audio.loop = true;
  audio.volume = 0.5;
  audio.play().catch(() => {});
  
  // Place the window at a random position within the desktop boundaries
  const desktop = document.querySelector('.desktop');
  const dWidth = desktop.clientWidth;
  const dHeight = desktop.clientHeight;
  const left = Math.random() * (dWidth - 150);
  const top = Math.random() * (dHeight - 150);
  idiotWin.style.left = left + "px";
  idiotWin.style.top = top + "px";

  // Assign random horizontal and vertical velocities (in pixels per update)
  idiotWin._idiotVX = (Math.random() * 10 + 5) * (Math.random() < 0.5 ? -1 : 1);
  idiotWin._idiotVY = (Math.random() * 10 + 5) * (Math.random() < 0.5 ? -1 : 1);

  // Disable dragging on the title bar so the window strictly bounces
  const titleBar = idiotWin.querySelector('.title-bar');
  if (titleBar) {
    titleBar.style.cursor = 'default';
    titleBar.onmousedown = function(e) { e.stopPropagation(); e.preventDefault(); };
  }
}

function updateIdioticWindows() {
  const idiotWins = document.querySelectorAll('.window[data-idiot="true"]');
  const desktop = document.querySelector('.desktop');
  const dWidth = desktop.clientWidth;
  const dHeight = desktop.clientHeight;
  idiotWins.forEach(win => {
    let left = parseFloat(win.style.left) || 0;
    let top = parseFloat(win.style.top) || 0;
    let vx = win._idiotVX || 0;
    let vy = win._idiotVY || 0;

    left += vx;
    top += vy;

    // Bounce off left/right edges
    if (left < 0) {
      left = 0;
      win._idiotVX = -vx;
    } else if (left + win.offsetWidth > dWidth) {
      left = dWidth - win.offsetWidth;
      win._idiotVX = -vx;
    }
    // Bounce off top/bottom edges
    if (top < 0) {
      top = 0;
      win._idiotVY = -vy;
    } else if (top + win.offsetHeight > dHeight) {
      top = dHeight - win.offsetHeight;
      win._idiotVY = -vy;
    }

    win.style.left = left + "px";
    win.style.top = top + "px";
  });
}