export function startVirus() {
  if (window.__virusActive) return;
  window.__virusActive = true;
  if (window.showNotification) {
    window.showNotification("Virus activated: totally not a virus is unleashed!");
  }
  let intensity = 0;
  let copyCounter = 1;
  const errorMessages = [
    "Critical error: Disk read failure.",
    "Buffer overflow detected.",
    "Kernel panic: not syncing.",
    "Fatal exception: System crash imminent.",
    "Loading error: resource missing.",
    "Unknown error occurred.",
    "Access violation: segmentation fault.",
    "Error 404: File not found.",
    "Permission denied error.",
    "Runtime exception: null pointer encountered."
  ];

  // Store the interval ID so we can clear it later
  window.__virusInterval = setInterval(() => {
    // Check if virus was deactivated
    if (!window.__virusActive) {
      clearInterval(window.__virusInterval);
      return;
    }
    
    intensity += 0.1;
    const hue = Math.floor(Math.random() * 360);
    const brightness = 1 - Math.min(intensity * 0.05, 0.5);
    // Removed the blur effect; now apply hue-rotate and brightness adjustments.
    const desktop = document.querySelector('.desktop');
    if (desktop) {
      desktop.style.filter = `hue-rotate(${hue}deg) brightness(${brightness})`;
    }

    // Randomly shake desktop icons.
    const icons = document.querySelectorAll('.icon');
    icons.forEach(icon => {
      const offsetX = (Math.random() - 0.5) * intensity * 5;
      const offsetY = (Math.random() - 0.5) * intensity * 5;
      icon.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
    });

    // Randomly shift open windows slightly.
    const windows = document.querySelectorAll('.window');
    windows.forEach(win => {
      const offsetX = (Math.random() - 0.5) * intensity * 10;
      const offsetY = (Math.random() - 0.5) * intensity * 10;
      win.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
    });

    // Glitch the start menu by randomly adjusting its opacity.
    const startMenu = document.querySelector('.start-menu');
    if (startMenu) {
      startMenu.style.opacity = (Math.random() > 0.5) ? (1 - intensity * 0.05).toString() : "1";
    }

    // ----------------------------
    // NEW EFFECT: Swap icons and images
    if (Math.random() < 0.1) { // 10% chance each second to swap icons
      // Get all images on the page
      const allImages = document.querySelectorAll('img:not([data-system-img="true"])');
      if (allImages.length > 1) { // Need at least 2 images to swap
        // Select two random images
        const img1Index = Math.floor(Math.random() * allImages.length);
        let img2Index;
        do {
          img2Index = Math.floor(Math.random() * allImages.length);
        } while (img2Index === img1Index);
        
        // Swap the src attributes
        const img1 = allImages[img1Index];
        const img2 = allImages[img2Index];
        const tempSrc = img1.src;
        img1.src = img2.src;
        img2.src = tempSrc;
        
        if (window.showNotification && Math.random() < 0.2) {
          window.showNotification("Image corruption detected!");
        }
      }
    }
    
    // ----------------------------
    // NEW EFFECT: Corrupt text
    if (Math.random() < 0.05) { // Reduced chance from 15% to 5% to be less destructive
      const safeElements = document.querySelectorAll('p:not([data-system-text="true"]), span:not([data-system-text="true"]), div.icon span, button:not([aria-label])');
      if (safeElements.length > 0) {
        // Select a random text element
        const elementToCorrupt = safeElements[Math.floor(Math.random() * safeElements.length)];
        
        if (elementToCorrupt && elementToCorrupt.textContent && elementToCorrupt.textContent.trim() !== "") {
          const originalText = elementToCorrupt.textContent;
          let corruptedText = "";
          
          // Decide corruption style randomly
          const corruptionStyle = Math.floor(Math.random() * 4);
          
          switch (corruptionStyle) {
            case 0: // Random characters (less aggressive)
              for (let i = 0; i < originalText.length; i++) {
                if (Math.random() < 0.2) {
                  // Replace with a random character
                  const randomChar = String.fromCharCode(33 + Math.floor(Math.random() * 94));
                  corruptedText += randomChar;
                } else {
                  corruptedText += originalText[i];
                }
              }
              break;
              
            case 1: // Reverse text
              corruptedText = originalText.split('').reverse().join('');
              break;
              
            case 2: // Glitch text with zalgo-like characters (reduced intensity)
              for (let i = 0; i < originalText.length; i++) {
                corruptedText += originalText[i];
                // Add random combining diacritical marks for a zalgo effect
                if (Math.random() < 0.1) {
                  const numGlitches = Math.floor(Math.random() * 2) + 1;
                  for (let j = 0; j < numGlitches; j++) {
                    // Add combining diacritical marks (Unicode range 0x0300-0x036F)
                    const glitchChar = String.fromCharCode(0x0300 + Math.floor(Math.random() * 112));
                    corruptedText += glitchChar;
                  }
                }
              }
              break;
              
            case 3: // Binary corruption (less aggressive)
              for (let i = 0; i < originalText.length; i++) {
                if (Math.random() < 0.2) {
                  // Replace with 0 or 1
                  corruptedText += Math.round(Math.random());
                } else {
                  corruptedText += originalText[i];
                }
              }
              break;
          }
          
          // Store original text for potential recovery
          if (!elementToCorrupt.dataset.originalText) {
            elementToCorrupt.dataset.originalText = originalText;
          }
          
          // Apply corrupted text
          elementToCorrupt.textContent = corruptedText;
        }
      }
    }

    // ----------------------------
    // Effect: Create copies of the virus in the Danger folder.
    if (
      window.fileSystem &&
      window.fileSystem['C:'] &&
      window.fileSystem['C:'].children &&
      window.fileSystem['C:'].children['Desktop'] &&
      window.fileSystem['C:'].children['Desktop'].children &&
      window.fileSystem['C:'].children['Desktop'].children['DANGER!!!']
    ) {
      const dangerFolder = window.fileSystem['C:'].children['Desktop'].children['DANGER!!!'];
      let virusCount = 0;
      for (let key in dangerFolder.children) {
        if (dangerFolder.children[key] && dangerFolder.children[key].virus) {
          virusCount++;
        }
      }
      if (virusCount < 5) { // Ensure at least 5 virus copies in the DANGER folder.
        const newName = `totally not a virus copy ${copyCounter}`;
        copyCounter++;
        dangerFolder.children[newName] = { type: "app", virus: true };
        if (window.showNotification) {
          window.showNotification(`Virus duplicated in DANGER!!!: ${newName} added.`);
        }
      }
    }

    // ----------------------------
    // New effect: Spread virus to other folders at the root of C:
    if (window.fileSystem && window.fileSystem['C:'] && window.fileSystem['C:'].children) {
      const rootChildren = window.fileSystem['C:'].children;
      for (const folderName in rootChildren) {
        const folderItem = rootChildren[folderName];
        // Spread to every folder (except if it's the Desktop root which already hosts DANGER!!!)
        if (folderItem.type === "folder" && folderName !== "Desktop") {
          if (folderItem.children) {
            let virusCount = 0;
            for (const childKey in folderItem.children) {
              if (folderItem.children[childKey] && folderItem.children[childKey].virus) {
                virusCount++;
              }
            }
            if (virusCount < 2 && Math.random() < 0.5) { // 50% chance to infect if less than 2 virus copies exist
              const newName = `totally not a virus copy ${copyCounter}`;
              copyCounter++;
              folderItem.children[newName] = { type: "app", virus: true };
              if (window.showNotification) {
                window.showNotification(`Virus spread to ${folderName}: ${newName} added.`);
              }
            }
          }
        }
      }
    }

    // ----------------------------
    // Recursive effect: Spread virus to all folders in the file system.
    function infectFolder(folder, path) {
      for (const key in folder.children) {
        const item = folder.children[key];
        if (item.type === "folder" && item.children) {
          let virusCount = 0;
          for (const child in item.children) {
            if (item.children[child] && item.children[child].virus) virusCount++;
          }
          if (virusCount < 1 && Math.random() < 0.3) { // 30% chance to infect a folder with no virus copies
            const newName = `totally not a virus copy ${copyCounter}`;
            copyCounter++;
            item.children[newName] = { type: "app", virus: true };
            if (window.showNotification) {
              window.showNotification(`Virus recursively spread to ${path}/${key}: ${newName} added.`);
            }
          }
          infectFolder(item, path + "/" + key);
        }
      }
    }
    if (window.fileSystem && window.fileSystem['C:']) {
      infectFolder(window.fileSystem['C:'], "C:");
    }

    // ----------------------------
    // New effect: Create error windows randomly (simulate catastrophic errors).
    if (Math.random() < 0.5 && window.openErrorWindow) { // 50% chance each second
      const randomMessage = errorMessages[Math.floor(Math.random() * errorMessages.length)];
      window.__errorRandomPlacement = true; // Set the flag for random placement
      window.openErrorWindow(randomMessage, true);
      window.__errorRandomPlacement = false; // Reset the flag after use
    }

    // ----------------------------
    // New effect: Open random other apps.
    if (Math.random() < 0.2 && window.fileSystem && window.fileSystem['C:'] &&
        window.fileSystem['C:'].children['Apps']) {
      const appsFolder = window.fileSystem['C:'].children['Apps'].children;
      const appNames = Object.keys(appsFolder);
      const filteredApps = appNames.filter(appName => {
        const appObj = appsFolder[appName];
        return appObj && appObj.type === "app" && !appObj.virus;
      });
      if (filteredApps.length > 0 && window.openItem) {
        const randomApp = filteredApps[Math.floor(Math.random() * filteredApps.length)];
        window.openItem(`C:/Apps/${randomApp}/`);
      }
    }

    // ----------------------------
    // Additional effect: Glitch the start menu background color temporarily.
    if (startMenu && Math.random() < 0.2) {
      const randomColor = `rgba(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, 0.3)`;
      startMenu.style.backgroundColor = randomColor;
      setTimeout(() => {
        startMenu.style.backgroundColor = "";
      }, 500);
    }
  }, 1000);
}

// Add function to stop the virus
export function stopVirus() {
  if (!window.__virusActive) return;
  
  window.__virusActive = false;
  
  if (window.__virusInterval) {
    clearInterval(window.__virusInterval);
  }
  
  // Reset desktop effects
  const desktop = document.querySelector('.desktop');
  if (desktop) {
    desktop.style.filter = "none";
  }
  
  // Reset desktop icons
  const icons = document.querySelectorAll('.icon');
  icons.forEach(icon => {
    icon.style.transform = "none";
  });
  
  // Reset windows
  const windows = document.querySelectorAll('.window');
  windows.forEach(win => {
    win.style.transform = "none";
  });
  
  // Reset start menu
  const startMenu = document.querySelector('.start-menu');
  if (startMenu) {
    startMenu.style.opacity = "1";
    startMenu.style.backgroundColor = "";
  }
  
  // Reset corrupted text from all elements
  const allElements = document.querySelectorAll('[data-original-text]');
  allElements.forEach(element => {
    if (element.dataset.originalText) {
      element.textContent = element.dataset.originalText;
      delete element.dataset.originalText;
    }
  });
  
  if (window.showNotification) {
    window.showNotification("Virus has been stopped.");
  }
}