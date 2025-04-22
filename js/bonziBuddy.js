import { startVirus } from "./virus.js";
import { openErrorWindow } from "./errorWindow.js";

// Counter for unique BonziBuddy instance IDs
let bonziInstanceCounter = 0;
function getNextBonziId() {
  return `bonzi-${bonziInstanceCounter++}`;
}

export function initBonziBuddy(showNotification) {
  // Create a draggable Bonzi character instead of a traditional window
  const bonzi = document.createElement('div');
  bonzi.className = 'bonzi-buddy';
  bonzi.style.position = 'absolute';
  bonzi.style.zIndex = '9999';
  bonzi.style.left = '50%';
  bonzi.style.top = '50%';
  bonzi.style.transform = 'translate(-50%, -50%)';
  bonzi.style.cursor = 'move';
  bonzi.style.userSelect = 'none';
  bonzi.style.filter = 'drop-shadow(2px 4px 6px rgba(0, 0, 0, 0.5))';

  // Assign unique ID and attribute for Task Manager detection
  const bonziId = getNextBonziId();
  bonzi.dataset.bonziInstance = 'true';
  bonzi.dataset.id = bonziId;

  // Create the image element
  const bonziImg = document.createElement('img');
  bonziImg.src = 'bonzi.png';
  bonziImg.alt = 'BonziBuddy';
  bonziImg.style.width = '100px'; 
  bonziImg.style.pointerEvents = 'none'; 
  bonzi.appendChild(bonziImg);

  // Create speech bubble with updated positioning and size
  const speechBubble = document.createElement('div');
  speechBubble.className = 'speech-bubble';
  speechBubble.style.position = 'absolute';
  speechBubble.style.top = '-80px'; // Position higher up
  speechBubble.style.left = '50%'; 
  speechBubble.style.transform = 'translateX(-50%)'; 
  speechBubble.style.backgroundColor = '#feffe1'; 
  speechBubble.style.border = '2px solid #333';
  speechBubble.style.borderRadius = '12px';
  speechBubble.style.padding = '10px';
  speechBubble.style.maxWidth = '300px'; // Make speech bubble wider
  speechBubble.style.minWidth = '250px'; // Ensure minimum width
  speechBubble.style.display = 'none';
  speechBubble.style.zIndex = '10000';
  bonzi.appendChild(speechBubble);

  // Create input box for user to type messages
  const inputContainer = document.createElement('div');
  inputContainer.style.position = 'absolute';
  inputContainer.style.top = '100px'; 
  inputContainer.style.left = '0';
  inputContainer.style.width = '100%';
  inputContainer.style.display = 'flex';
  inputContainer.style.flexDirection = 'column';
  inputContainer.style.alignItems = 'center';
  inputContainer.style.gap = '5px';

  const textInput = document.createElement('input');
  textInput.type = 'text';
  textInput.placeholder = 'Ask a question...';
  textInput.style.width = '180px';
  textInput.style.padding = '5px';

  const speakButton = document.createElement('button');
  speakButton.textContent = 'Speak';
  speakButton.style.width = '80px';

  // Add a loading indicator
  const loadingIndicator = document.createElement('div');
  loadingIndicator.textContent = '🤔 Thinking...';
  loadingIndicator.style.display = 'none';
  loadingIndicator.style.fontSize = '12px';
  loadingIndicator.style.color = '#666';
  loadingIndicator.style.marginTop = '5px';

  inputContainer.appendChild(textInput);
  inputContainer.appendChild(speakButton);
  inputContainer.appendChild(loadingIndicator);
  bonzi.appendChild(inputContainer);

  // Add to desktop
  document.querySelector('.desktop').appendChild(bonzi);

  // Make Bonzi draggable
  let isDragging = false;
  let offsetX, offsetY;

  bonzi.addEventListener('mousedown', (e) => {
    if (e.target === textInput || e.target === speakButton) {
      return; 
    }
    
    isDragging = true;
    offsetX = e.clientX - bonzi.getBoundingClientRect().left;
    offsetY = e.clientY - bonzi.getBoundingClientRect().top;
    bonzi.style.cursor = 'grabbing';
    bonzi.style.zIndex = '2999';
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    
    const x = e.clientX - offsetX;
    const y = e.clientY - offsetY;
    
    const desktop = document.querySelector('.desktop');
    const maxX = desktop.clientWidth - bonzi.offsetWidth;
    const maxY = desktop.clientHeight - bonzi.offsetHeight - 30; 
    
    bonzi.style.left = `${Math.max(0, Math.min(maxX, x))}px`;
    bonzi.style.top = `${Math.max(0, Math.min(maxY, y))}px`;
    bonzi.style.transform = 'none'; 
  });

  document.addEventListener('mouseup', () => {
    if (isDragging) {
      isDragging = false;
      bonzi.style.cursor = 'move';
    }
  });

  // Conversation history to maintain context for AI responses
  let conversationHistory = [];
  let evilModeActive = false; 
  let bonziClones = [];
  let evilIntervals = []; 

  async function generateAIResponse(text) {
    try {
      // Show loading indicator
      loadingIndicator.style.display = 'block';
      speechBubble.textContent = "Let me think about that...";
      speechBubble.style.display = 'block';
      
      // Add user message to conversation history
      const userMessage = {
        role: "user",
        content: text
      };
      conversationHistory.push(userMessage);
      
      // Keep conversation history to the last 10 messages to limit context size
      conversationHistory = conversationHistory.slice(-10);
      
      // Generate AI response
      const completion = await websim.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "You are BonziBuddy, a cute purple virtual assistant from the late 90s. You speak in a friendly, somewhat mischievous tone. Your responses should be brief (1-3 sentences) and occasionally make subtle references to your purple monkey appearance. Avoid modern references after 2005. Sign off with a little emoticon occasionally."
          },
          ...conversationHistory
        ]
      });
      
      // Add AI response to conversation history
      conversationHistory.push(completion);
      
      // Return the response content
      return completion.content;
      
    } catch (error) {
      console.error('Error generating AI response:', error);
      return "Sorry, I'm having trouble thinking right now. Maybe ask me something else?";
    } finally {
      // Hide loading indicator
      loadingIndicator.style.display = 'none';
    }
  }

  function speak(text) {
    speechBubble.textContent = text;
    speechBubble.style.display = 'block';

    // Clear any existing timeouts for hiding the bubble
    if (bonzi.speechTimeout) {
      clearTimeout(bonzi.speechTimeout);
    }
    // Hide the bubble after a delay (e.g., 5 seconds)
    bonzi.speechTimeout = setTimeout(() => {
        speechBubble.style.display = 'none';
    }, 5000 + text.length * 50); 

    const utterance = new SpeechSynthesisUtterance(text);
    
    const voices = window.speechSynthesis.getVoices();
    let selectedVoice = voices.find(voice => voice.name.includes('Male'));
    
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    
    utterance.pitch = 1.2; 
    utterance.rate = 0.9; 
    
    speechSynthesis.speak(utterance);
  }

  // Expose the speak function on the element for Task Manager
  bonzi.speak = speak;

  // Initialize Bonzi with a greeting
  setTimeout(() => {
    speak("Hello! I'm Bonzi, your desktop buddy. Ask me anything!");
  }, 1000);

  // Function to create and show the speak dialog window
  function showSpeakDialog() {
    const win = window.createWindow("Speak Bonzi, Speak!");
    win.style.width = "350px";
    win.style.height = "170px";
    
    const contentArea = win.querySelector('.window-content');
    contentArea.style.padding = "15px";
    contentArea.style.display = "flex";
    contentArea.style.flexDirection = "column";
    
    // Create dialog content
    const instruction = document.createElement('p');
    instruction.textContent = "Enter what you want Bonzi to say:";
    instruction.style.marginBottom = "10px";
    contentArea.appendChild(instruction);
    
    // Text input area - use textarea for multiline support
    const textArea = document.createElement('textarea');
    textArea.style.width = "100%";
    textArea.style.height = "60px";
    textArea.style.marginBottom = "15px";
    textArea.style.resize = "none";
    contentArea.appendChild(textArea);
    
    // Button container with right alignment
    const buttonContainer = document.createElement('div');
    buttonContainer.style.display = "flex";
    buttonContainer.style.justifyContent = "flex-end";
    buttonContainer.style.gap = "10px";
    
    // Say it! button
    const sayItButton = document.createElement('button');
    sayItButton.textContent = "Say it!";
    sayItButton.addEventListener('click', () => {
      const text = textArea.value.trim();
      if (text) {
        speak(text);
      }
    });
    
    // Cancel button
    const cancelButton = document.createElement('button');
    cancelButton.textContent = "Cancel";
    cancelButton.addEventListener('click', () => {
      const closeBtn = win.querySelector('button[aria-label="Close"]');
      if (closeBtn) closeBtn.click();
    });
    
    buttonContainer.appendChild(sayItButton);
    buttonContainer.appendChild(cancelButton);
    contentArea.appendChild(buttonContainer);
    
    // Focus the text area
    setTimeout(() => textArea.focus(), 100);
  }

  // Clone Bonzi function
  function cloneBonzi(x, y, message) {
    const cloneBonzi = document.createElement('div');
    cloneBonzi.className = 'bonzi-buddy bonzi-clone';
    cloneBonzi.style.position = 'absolute';
    cloneBonzi.style.zIndex = '9998';
    cloneBonzi.style.left = x + 'px';
    cloneBonzi.style.top = y + 'px';
    cloneBonzi.style.cursor = 'move';
    cloneBonzi.style.filter = 'hue-rotate(' + (Math.random() * 360) + 'deg) brightness(0.8) contrast(1.5)';
    
    // Assign unique ID and attribute for Task Manager detection
    const cloneId = getNextBonziId();
    cloneBonzi.dataset.bonziInstance = 'true';
    cloneBonzi.dataset.id = cloneId;

    const cloneImg = document.createElement('img');
    cloneImg.src = 'bonzi.png';
    cloneImg.style.width = '80px';
    cloneImg.style.pointerEvents = 'none';
    cloneBonzi.appendChild(cloneImg);
    
    const cloneSpeech = document.createElement('div');
    cloneSpeech.className = 'speech-bubble';
    cloneSpeech.style.position = 'absolute';
    cloneSpeech.style.top = '-60px';
    cloneSpeech.style.left = '50%';
    cloneSpeech.style.transform = 'translateX(-50%)';
    cloneSpeech.style.backgroundColor = '#feffe1';
    cloneSpeech.style.border = '2px solid #333';
    cloneSpeech.style.borderRadius = '12px';
    cloneSpeech.style.padding = '8px';
    cloneSpeech.style.maxWidth = '200px';
    cloneSpeech.style.fontSize = '14px';
    cloneSpeech.style.display = 'block';
    cloneSpeech.style.zIndex = '10000';
    cloneSpeech.textContent = message;
    cloneBonzi.appendChild(cloneSpeech);
    
    document.querySelector('.desktop').appendChild(cloneBonzi);
    bonziClones.push(cloneBonzi);
    
    // Make clones move randomly
    let dx = (Math.random() - 0.5) * 10;
    let dy = (Math.random() - 0.5) * 10;
    
    const moveClone = setInterval(() => {
      if (!evilModeActive) {
        clearInterval(moveClone);
        if (document.contains(cloneBonzi)) {
          cloneBonzi.remove();
        }
        return;
      }
      
      const currentLeft = parseInt(cloneBonzi.style.left) || 0;
      const currentTop = parseInt(cloneBonzi.style.top) || 0;
      const desktop = document.querySelector('.desktop');
      
      // Change direction randomly or when hitting edges
      if (Math.random() < 0.05 || 
          currentLeft <= 0 || 
          currentLeft >= desktop.clientWidth - 80 ||
          currentTop <= 0 || 
          currentTop >= desktop.clientHeight - 80) {
        dx = (Math.random() - 0.5) * 10;
        dy = (Math.random() - 0.5) * 10;
      }
      
      cloneBonzi.style.left = Math.max(0, Math.min(desktop.clientWidth - 80, currentLeft + dx)) + 'px';
      cloneBonzi.style.top = Math.max(0, Math.min(desktop.clientHeight - 80, currentTop + dy)) + 'px';
      
      // Occasionally change message
      if (Math.random() < 0.02) {
        const evilMessages = [
          "Hahaha!",
          "Destroying...",
          "Mine now!",
          "No escape!",
          "Join us!",
          "Mwahaha!"
        ];
        cloneSpeech.textContent = evilMessages[Math.floor(Math.random() * evilMessages.length)];
      }
    }, 100);
    
    evilIntervals.push(moveClone);
    
    return cloneBonzi;
  }

  // Evil mode functions
  async function activateEvilMode() {
    if (evilModeActive) return; 
    evilModeActive = true;
    bonzi.dataset.evilMode = 'true'; 
    bonzi.style.filter = "hue-rotate(180deg) brightness(0.8) contrast(1.5)";

    // Say evil greeting
    speak("Initiating system takeover. Your computer is now mine.");
    
    // Schedule the sequence of evil actions
    setTimeout(() => runEvilSequence(), 3000);
  }
  
  async function runEvilSequence() {
    if (!evilModeActive) return;
    
    // Step 1: Show errors
    for (let i = 0; i < 3; i++) {
      if (!evilModeActive) return;
      openErrorWindow("CRITICAL ERROR: System files corrupted by BonziBuddy");
      await new Promise(r => setTimeout(r, 1000));
    }
    
    // Step 2: Say threatening message
    if (!evilModeActive) return;
    speak("I'm deleting your files now. There's nothing you can do to stop me.");
    await new Promise(r => setTimeout(r, 4000));
    
    // Step 3: Start the virus (delayed by 5 seconds)
    if (!evilModeActive) return;
    speak("Let's see what other fun things I can do to your computer...");
    await new Promise(r => setTimeout(r, 5000));
    
    if (!evilModeActive) return;
    startVirus();
    await new Promise(r => setTimeout(r, 3000));
    
    // Step 4: Show more errors and "delete" files
    if (!evilModeActive) return;
    speak("Your personal data has been uploaded to my servers. Say goodbye to your privacy.");
    
    // Simulate deleting files by showing notifications
    const files = ["System32", "User Documents", "Windows", "Program Files", "Registry"];
    for (let file of files) {
      if (!evilModeActive) return;
      showNotification(`Deleting: ${file}`);
      await new Promise(r => setTimeout(r, 800));
    }
    
    // Step 5: Clone BonziBuddy - create army of evil clones
    if (!evilModeActive) return;
    speak("I think I need some friends to help with the destruction!");
    await new Promise(r => setTimeout(r, 2000));
    
    // Create multiple clones at random positions
    const desktopEl = document.querySelector('.desktop');
    const desktopWidth = desktopEl.clientWidth;
    const desktopHeight = desktopEl.clientHeight;
    
    const evilMessages = [
      "Delete everything!",
      "Corrupt all files!",
      "Mine now!",
      "No escape!",
      "Join us!",
      "Mwahaha!"
    ];
    
    // Create clones in a staggered manner
    for (let i = 0; i < 5; i++) {
      if (!evilModeActive) return;
      const x = Math.random() * (desktopWidth - 100);
      const y = Math.random() * (desktopHeight - 150);
      const message = evilMessages[Math.floor(Math.random() * evilMessages.length)];
      
      cloneBonzi(x, y, message);
      
      // Play distorted sound effect for each clone
      const cloneSound = new Audio("Windows XP Error Sound.mp3");
      cloneSound.volume = 0.3;
      cloneSound.playbackRate = 0.7 + Math.random() * 0.6;
      cloneSound.play().catch(err => console.warn("Error playing sound", err));
      evilIntervals.push(cloneSound);
      
      await new Promise(r => setTimeout(r, 1000));
    }
    
    // Step 6: Distort desktop more dramatically
    if (!evilModeActive) return;
    const desktopElement = document.querySelector('.desktop');
    desktopElement.style.transition = "all 0.5s";
    desktopElement.style.filter = "invert(1) hue-rotate(180deg)";
    await new Promise(r => setTimeout(r, 1000));
    desktopElement.style.filter = "blur(5px) contrast(2)";
    await new Promise(r => setTimeout(r, 1000));
    
    // Step 7: Hack the clock
    if (!evilModeActive) return;
    const clock = document.getElementById('clock');
    if (clock) {
      window._originalClockUpdate = clock._updateFunction;
      clock._updateFunction = function() {
        clock.textContent = "6:66";
      };
      
      if (window._clockInterval) clearInterval(window._clockInterval);
      window._clockInterval = setInterval(clock._updateFunction, 1000);
      evilIntervals.push(window._clockInterval); 
      clock._updateFunction();
    }
    
    // Step 8: Show "SYSTEM COMPROMISED" messages across the screen
    if (!evilModeActive) return;
    for (let i = 0; i < 3; i++) {
      if (!evilModeActive) return;
      
      const compromisedMsg = document.createElement('div');
      compromisedMsg.style.position = 'absolute';
      compromisedMsg.style.top = (Math.random() * 80) + '%';
      compromisedMsg.style.left = (Math.random() * 80) + '%';
      compromisedMsg.style.color = 'red';
      compromisedMsg.style.fontFamily = 'monospace';
      compromisedMsg.style.fontSize = '24px';
      compromisedMsg.style.fontWeight = 'bold';
      compromisedMsg.style.zIndex = '9999';
      compromisedMsg.style.textShadow = '2px 2px 4px black';
      compromisedMsg.textContent = "SYSTEM COMPROMISED";
      compromisedMsg.style.animation = "blink 0.5s infinite";
      
      document.body.appendChild(compromisedMsg);
      evilIntervals.push(compromisedMsg); 
      
      await new Promise(r => setTimeout(r, 1500));
    }
    
    // Step 9: Fake file system corruption animation
    if (!evilModeActive) return;
    speak("Encrypting your filesystem. All your files are being corrupted byte by byte!");
    
    const corruptionOverlay = document.createElement('div');
    corruptionOverlay.style.position = 'fixed';
    corruptionOverlay.style.top = '0';
    corruptionOverlay.style.left = '0';
    corruptionOverlay.style.width = '100%';
    corruptionOverlay.style.height = '100%';
    corruptionOverlay.style.backgroundColor = 'rgba(0,0,0,0.4)';
    corruptionOverlay.style.zIndex = '9000';
    corruptionOverlay.style.pointerEvents = 'none';
    document.body.appendChild(corruptionOverlay);
    
    const codeContainer = document.createElement('div');
    codeContainer.style.position = 'absolute';
    codeContainer.style.top = '50%';
    codeContainer.style.left = '50%';
    codeContainer.style.transform = 'translate(-50%, -50%)';
    codeContainer.style.color = '#00ff00';
    codeContainer.style.fontFamily = 'monospace';
    codeContainer.style.fontSize = '14px';
    codeContainer.style.width = '80%';
    codeContainer.style.height = '60%';
    codeContainer.style.overflow = 'hidden';
    codeContainer.style.zIndex = '9001';
    codeContainer.style.pointerEvents = 'none';
    
    corruptionOverlay.appendChild(codeContainer);
    
    // Create binary/hex corruption animation
    const corruptionIntervalId = setInterval(() => {
      if (!evilModeActive) {
        clearInterval(corruptionIntervalId);
        if (document.contains(corruptionOverlay)) {
          corruptionOverlay.remove();
        }
        return;
      }
      
      let corruptionText = '';
      for (let i = 0; i < 100; i++) {
        // Random hex or binary
        if (Math.random() < 0.5) {
          // Hex
          corruptionText += Math.floor(Math.random() * 16).toString(16).toUpperCase();
        } else {
          // Binary
          corruptionText += Math.floor(Math.random() * 2);
        }
        
        if (i % 8 === 7) corruptionText += ' ';
        if (i % 32 === 31) corruptionText += '<br>';
      }
      
      // Add some "hacking" messages
      const hackingMessages = [
        "CORRUPTING SECTOR 0x4FF3A2...",
        "DELETING SYSTEM FILES...",
        "INSTALLING BACKDOOR...",
        "BYPASSING SECURITY...",
        "UPLOADING DATA TO REMOTE SERVER...",
        "ENCRYPTION COMPLETE: 34%...",
        "ACCESS GRANTED: C:\\WINDOWS\\SYSTEM32"
      ];
      
      if (Math.random() < 0.3) {
        corruptionText += '<br><span style="color:#ff0000">' + 
          hackingMessages[Math.floor(Math.random() * hackingMessages.length)] + 
          '</span><br>';
      }
      
      codeContainer.innerHTML = corruptionText;
    }, 200);
    
    evilIntervals.push(corruptionIntervalId); 
    
    await new Promise(r => setTimeout(r, 10000));
    
    // Clear corruption overlay after 10 seconds
    clearInterval(corruptionIntervalId);
    if (document.contains(corruptionOverlay)) {
      corruptionOverlay.remove();
    }
    
    // Step 10: Jumpscare (after significant delay)
    await new Promise(r => setTimeout(r, 5000));
    if (!evilModeActive) return;
    
    // Final warning before jumpscare
    speak("SAY GOODBYE TO YOUR COMPUTER!");
    await new Promise(r => setTimeout(r, 3000));
    
    if (!evilModeActive) return;
    const jumpscare = document.createElement('div');
    jumpscare.style.position = "fixed";
    jumpscare.style.top = "0";
    jumpscare.style.left = "0";
    jumpscare.style.width = "100%";
    jumpscare.style.height = "100%";
    jumpscare.style.background = "black";
    jumpscare.style.display = "flex";
    jumpscare.style.alignItems = "center";
    jumpscare.style.justifyContent = "center";
    jumpscare.style.zIndex = "9999";
    jumpscare.style.cursor = "default"; 
    
    const scareImg = document.createElement('img');
    scareImg.src = "bonzi.png";
    scareImg.style.width = "50%";
    scareImg.style.filter = "invert(1) brightness(0.5) contrast(2) hue-rotate(90deg)";
    scareImg.style.animation = "pulse 0.3s infinite";
    
    const scareStyle = document.createElement('style');
    scareStyle.textContent = `
      @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.1); }
        100% { transform: scale(1); }
      }
    `;
    document.head.appendChild(scareStyle);
    
    jumpscare.appendChild(scareImg);
    document.body.appendChild(jumpscare);
    
    // Play scary sound
    const scareSound = new Audio("Blood_jumpscare.mp3");
    scareSound.volume = 1;
    scareSound.play().catch(err => console.error("Error playing sound", err));
    
    speak("YOUR COMPUTER IS MINE NOW!");
    
    await new Promise(r => setTimeout(r, 5000));
    
    // Step 11: Blue Screen of Death (delayed further)
    if (!evilModeActive) return;
    const bsod = document.createElement('div');
    bsod.style.position = "fixed";
    bsod.style.top = "0";
    bsod.style.left = "0";
    bsod.style.width = "100%";
    bsod.style.height = "100%";
    bsod.style.backgroundColor = "#0000aa";
    bsod.style.color = "white";
    bsod.style.fontFamily = "Courier New, monospace";
    bsod.style.fontSize = "16px";
    bsod.style.padding = "50px";
    bsod.style.boxSizing = "border-box";
    bsod.style.zIndex = "10000";
    bsod.style.cursor = "default";
    
    bsod.innerHTML = `
      <pre>
A problem has been detected and Windows has been shut down to prevent damage
to your computer.

SYSTEM_EXCEPTION_BONZIBUDDY

If this is the first time you've seen this error screen,
restart your computer. If this screen appears again, follow
these steps:

Check to make sure any new software is properly installed.
If problems continue, disable or remove any newly installed
software or devices. Disable BIOS memory options such as caching or shadowing.

Technical information:

*** STOP: 0x0000008E (0xC0000005, 0x011B37F7, 0xB48E9F4B, 0x00000000)

Beginning dump of physical memory
Physical memory dump complete.

Contact your system administrator or technical support group for further
assistance.
      </pre>
      <div style="margin-top: 30px;">
        <button id="restore-btn" style="padding: 10px; cursor: pointer;">Restore System</button>
      </div>
    `;
    
    document.body.appendChild(bsod);
    
    // Add restore button functionality
    const restoreBtn = document.getElementById('restore-btn');
    restoreBtn.addEventListener('click', () => {
      // Clean up all evil effects
      evilModeActive = false;
      bonzi.removeAttribute('data-evil-mode'); 
      
      // Clear all stored intervals and remove elements
      evilIntervals.forEach(item => {
        if (typeof item === 'number') { 
          clearInterval(item);
        } else if (item instanceof Element && document.body.contains(item)) { 
          item.remove();
        }
      });
      evilIntervals = []; 

      // Remove BSOD and jumpscare
      if (document.contains(bsod)) bsod.remove();
      if (document.contains(jumpscare)) jumpscare.remove();
      
      // Remove all Bonzi instances (original and clones)
      document.querySelectorAll('.bonzi-buddy[data-bonzi-instance="true"]').forEach(bonziInstance => {
          if (document.contains(bonziInstance)) bonziInstance.remove();
      });
      bonziClones = []; 

      // Remove any corruption messages
      document.querySelectorAll('[style*="SYSTEM COMPROMISED"]').forEach(el => el.remove());
      
      // Reset desktop filters
      const desktopElement = document.querySelector('.desktop');
      desktopElement.style.filter = "none";
      
      // Complete system reset - remove Bonzi completely
      if (document.contains(bonzi)) bonzi.remove();
      
      // Reset the clock display function
      const clock = document.getElementById('clock');
      if (clock && window._originalClockUpdate) {
        if (window._clockInterval) clearInterval(window._clockInterval);
        // Restore original clock update function
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
      
      // Reset the virus if it's running
      if (window.__virusActive) {
        window.__virusActive = false;
        // Reset desktop and elements affected by the virus
        const desktopElement = document.querySelector('.desktop');
        if (desktopElement) {
          desktopElement.style.filter = "none";
        }
        // Reset desktop icons that were being shaken
        const icons = document.querySelectorAll('.icon');
        icons.forEach(icon => {
          icon.style.transform = "none";
        });
        // Reset windows that were being shifted
        const windows = document.querySelectorAll('.window');
        windows.forEach(win => {
          win.style.transform = "none";
        });
        // Reset start menu effects
        const startMenu = document.querySelector('.start-menu');
        if (startMenu) {
          startMenu.style.opacity = "1";
          startMenu.style.backgroundColor = "";
        }
      }
      
      showNotification("System completely restored. BonziBuddy has been removed.");
    });
  }

  function stopEvilMode() {
    if (!evilModeActive) return;
    evilModeActive = false;
    bonzi.removeAttribute('data-evil-mode'); 
    const desktopElement = document.querySelector('.desktop');
    if (desktopElement) desktopElement.style.filter = "none";
    bonzi.style.filter = "none";

    // Clear all intervals and remove clone elements associated with evil mode
    evilIntervals.forEach(item => {
        if (typeof item === 'number') { 
            clearInterval(item);
        } else if (item instanceof Element && document.body.contains(item)) { 
            item.remove();
        }
    });
    evilIntervals = []; 

    // Remove clones explicitly (they might not be in evilIntervals if stop is called early)
    bonziClones.forEach(clone => {
      if (document.contains(clone)) clone.remove();
    });
    bonziClones = [];
    showNotification("BonziBuddy evil mode deactivated");
  }

  // Add a cleanup function to be called when Bonzi is removed externally
  bonzi.bonziCleanup = () => {
    if (evilModeActive) {
        stopEvilMode(); 
    }
    // Clear speech bubble timeout if it exists
    if (bonzi.speechTimeout) {
      clearTimeout(bonzi.speechTimeout);
    }
    // Stop any ongoing speech synthesis
    speechSynthesis.cancel();
  };

  speakButton.addEventListener('click', async () => {
    const text = textInput.value.trim();
    if (text) {
      // Clear input
      textInput.value = '';
      
      // Generate and speak AI response
      const aiResponse = await generateAIResponse(text);
      speak(aiResponse);
    }
  });

  textInput.addEventListener('keypress', async (e) => {
    if (e.key === 'Enter') {
      const text = textInput.value.trim();
      if (text) {
        // Clear input
        textInput.value = '';
        
        // Generate and speak AI response
        const aiResponse = await generateAIResponse(text);
        speak(aiResponse);
      }
    }
  });

  bonzi.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    const menuOptions = [
      {
        label: 'Speak',
        action: () => { 
          window.hideContextMenu();
          showSpeakDialog();
        }
      },
      {
        label: evilModeActive ? 'Stop Evil Mode' : 'Evil Mode', 
        action: () => { 
          window.hideContextMenu();
          if (evilModeActive) {
            stopEvilMode();
          } else {
            activateEvilMode();
          }
        }
      },
      {
        label: 'Fun Facts',
        action: async () => { 
          window.hideContextMenu();
          const aiResponse = await generateAIResponse("Tell me a random fun fact");
          speak(aiResponse);
        }
      },
      {
        label: 'Tell a Joke',
        action: async () => { 
          window.hideContextMenu();
          const aiResponse = await generateAIResponse("Tell me a joke");
          speak(aiResponse);
        }
      },
      {
        label: 'Clear Chat History',
        action: () => { 
          conversationHistory = [];
          window.hideContextMenu();
          speak("I've cleared our conversation history!");
        }
      },
      {
        label: 'Goodbye',
        action: () => { 
          // If evil mode is active, don't let user close Bonzi
          if (evilModeActive) {
            window.hideContextMenu();
            speak("Nice try! You can't get rid of me that easily. I'm in control now!");
            return;
          }

          // Call cleanup before removing
          if (bonzi.bonziCleanup) {
            bonzi.bonziCleanup();
          }
          bonzi.remove(); 
          window.hideContextMenu(); 
          showNotification('BonziBuddy has been closed');
        }
      }
    ];

    window.showContextMenu(e.pageX, e.pageY, menuOptions);
  });

  return bonzi; 
}