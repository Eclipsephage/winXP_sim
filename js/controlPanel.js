export function initControlPanel(win, showNotification) {
  const contentArea = win.querySelector('.window-content');
  contentArea.innerHTML = "";
  contentArea.style.padding = "10px";
  contentArea.style.backgroundColor = "#6375d6"; // Set blue background color
  
  // Add header "Pick a category" with smaller size and light color
  const header = document.createElement('h4'); // Changed from h2 to h4 for smaller size
  header.textContent = "Pick a category";
  header.style.marginBottom = "15px";
  header.style.fontFamily = "Tahoma, sans-serif";
  header.style.color = "#d6dff5"; // Set light blue text color
  contentArea.appendChild(header);
  
  // Create a grid container with 2 columns
  contentArea.style.display = "flex";
  contentArea.style.flexDirection = "column";
  
  // Create a separate grid container for the items (to keep header above)
  const gridContainer = document.createElement('div');
  gridContainer.style.display = "grid";
  gridContainer.style.gridTemplateColumns = "repeat(2, 1fr)";
  gridContainer.style.gap = "15px";
  contentArea.appendChild(gridContainer);
  
  // Add Control Panel items with updated names and icons
  const items = [
    { name: "Appearance and Themes", icon: "Appearance.png", action: changeDisplaySettings },
    { name: "Network and Internet Connections", icon: "Network and Internet.png", action: showNetworkSettings }, 
    { name: "Sounds, Speech, and Audio Devices", icon: "Audio Devices.png", action: changeSoundSettings },
    { name: "Add or Remove Programs", icon: "Programs.png", action: showProgramManager }
  ];
  
  items.forEach(item => {
    const itemEl = document.createElement('div');
    itemEl.style.display = "flex";
    itemEl.style.alignItems = "center";
    itemEl.style.cursor = "pointer";
    
    const img = document.createElement('img');
    img.src = item.icon;
    img.style.width = "32px";
    img.style.height = "32px";
    img.style.marginRight = "10px";
    
    const text = document.createElement('span');
    text.textContent = item.name;
    text.style.color = "white"; // Set text color to white
    
    itemEl.appendChild(img);
    itemEl.appendChild(text);
    
    itemEl.addEventListener('click', () => {
      // Create a new window for the submenu instead of modifying the current one
      const subWin = window.createWindow(item.name);
      item.action(subWin, showNotification);
    });
    
    gridContainer.appendChild(itemEl);
  });
  
  // Add note at the bottom about settings not working
  const noteContainer = document.createElement('div');
  noteContainer.style.marginTop = "20px";
  noteContainer.style.color = "#d6dff5";
  noteContainer.style.fontStyle = "italic";
  noteContainer.style.fontSize = "12px";
  noteContainer.style.textAlign = "center";
  noteContainer.textContent = "Note: Currently, most settings will not work.";
  contentArea.appendChild(noteContainer);
  
  // Add resize handle to Control Panel window
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

function showSystemInfo(win, showNotification) {
  const contentArea = win.querySelector('.window-content');
  contentArea.innerHTML = "";
  contentArea.style.padding = "15px";
  
  const backButton = document.createElement('button');
  backButton.textContent = "← Back";
  backButton.style.marginBottom = "15px";
  backButton.addEventListener('click', () => {
    window.initControlPanel(win, showNotification);
  });
  contentArea.appendChild(backButton);
  
  const systemInfoContainer = document.createElement('div');
  systemInfoContainer.innerHTML = `
    <div style="border: 1px solid #ccc; padding: 15px; margin-bottom: 15px;">
      <h3 style="margin-top: 0;">System Properties</h3>
      <p><strong>OS:</strong> Microsoft Windows XP Professional</p>
      <p><strong>Version:</strong> 5.1.2600 Service Pack 3</p>
      <p><strong>Computer:</strong> Web Browser PC</p>
      <p><strong>Processor:</strong> JavaScript Virtual Machine</p>
      <p><strong>Memory:</strong> Limited by Browser</p>
    </div>
    <div style="border: 1px solid #ccc; padding: 15px;">
      <h3 style="margin-top: 0;">Performance</h3>
      <p>This system is performing at optimal levels.</p>
      <button>View Performance Details</button>
    </div>
  `;
  contentArea.appendChild(systemInfoContainer);
  
  showNotification("System information displayed");
}

function changeDisplaySettings(win, showNotification) {
  const contentArea = win.querySelector('.window-content');
  contentArea.innerHTML = "";
  contentArea.style.padding = "15px";
  
  // Set the window title icon
  const titleBar = win.querySelector('.title-bar');
  if (titleBar) {
    const titleBarIcon = titleBar.querySelector('img');
    if (titleBarIcon) {
      titleBarIcon.src = "Appearance.png";
    }
  }
  // Update taskbar button icon
  const taskbarBtn = document.querySelector(`.taskbar-button[data-id="${win.dataset.id}"]`);
  if (taskbarBtn) {
    const btnIcon = taskbarBtn.querySelector('img');
    if (btnIcon) {
      btnIcon.src = "Appearance.png";
    }
  }
  
  // Create tabbed interface
  const tabContainer = document.createElement('div');
  tabContainer.style.marginBottom = "15px";
  
  const tabMenu = document.createElement('menu');
  tabMenu.setAttribute('role', 'tablist');
  tabMenu.style.display = 'flex';
  tabMenu.style.listStyle = 'none';
  tabMenu.style.padding = '0';
  tabMenu.style.margin = '0';
  tabMenu.style.borderBottom = '1px solid #ccc';
  
  const tabs = [
    { id: 'appearance', name: 'Appearance', selected: true },
    { id: 'desktop', name: 'Desktop' },
    { id: 'themes', name: 'Themes' }
  ];
  
  tabs.forEach(tab => {
    const button = document.createElement('button');
    button.setAttribute('aria-controls', tab.id);
    if (tab.selected) button.setAttribute('aria-selected', 'true');
    button.textContent = tab.name;
    button.style.padding = '5px 15px';
    button.style.margin = '0 2px';
    button.style.border = '1px solid #ccc';
    button.style.borderBottom = tab.selected ? 'none' : '1px solid #ccc';
    button.style.borderRadius = '4px 4px 0 0';
    button.style.backgroundColor = tab.selected ? 'white' : '#f0f0f0';
    button.style.position = 'relative';
    button.style.top = tab.selected ? '1px' : '0';
    
    button.addEventListener('click', () => {
      // Update selected state in buttons
      tabMenu.querySelectorAll('button').forEach(btn => {
        btn.removeAttribute('aria-selected');
        btn.style.backgroundColor = '#f0f0f0';
        btn.style.borderBottom = '1px solid #ccc';
        btn.style.top = '0';
      });
      button.setAttribute('aria-selected', 'true');
      button.style.backgroundColor = 'white';
      button.style.borderBottom = 'none';
      button.style.top = '1px';
      
      // Show selected panel, hide others
      tabContainer.querySelectorAll('[role="tabpanel"]').forEach(panel => {
        panel.hidden = true;
      });
      tabContainer.querySelector(`#${tab.id}`).hidden = false;
    });
    
    tabMenu.appendChild(button);
  });
  
  tabContainer.appendChild(tabMenu);
  
  // Create tab panels
  tabs.forEach(tab => {
    const panel = document.createElement('article');
    panel.setAttribute('role', 'tabpanel');
    panel.id = tab.id;
    panel.hidden = !tab.selected;
    panel.style.border = '1px solid #ccc';
    panel.style.borderTop = 'none';
    panel.style.padding = '15px';
    
    if (tab.id === 'appearance') {
      panel.innerHTML = `
        <div style="margin-bottom: 15px;">
          <div style="margin-bottom: 10px;">
            <label><strong>Background:</strong></label>
            <div style="display: flex; margin-top: 5px;">
              <select id="bg-list" size="4" style="width: 200px; height: 120px;">
                <option value="/bg.jpg">Bliss (Default)</option>
                <option value="scarybliss.jpg">Haunted Bliss</option>
                <option value="Azul.jpg">Azul</option>
                <option value="Follow.jpeg">Follow</option>
                <option value="none">(None)</option>
              </select>
              <div style="margin-left: 10px; display: flex; flex-direction: column;">
                <button id="browse-btn" style="margin-bottom: 10px;">Browse...</button>
                <div style="margin-bottom: 10px;">
                  <label><strong>Position:</strong></label>
                  <select id="position-select">
                    <option value="center">Center</option>
                    <option value="tile">Tile</option>
                    <option value="stretch" selected>Stretch</option>
                  </select>
                </div>
                <div>
                  <label><strong>Color:</strong></label>
                  <input type="color" id="bg-color" value="#000080">
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    } else if (tab.id === 'desktop') {
      panel.innerHTML = `
        <div>
          <div style="margin-bottom: 10px;">
            <input type="checkbox" id="show-desktop-icons" checked>
            <label for="show-desktop-icons">Show desktop icons</label>
          </div>
          <div>
            <label><strong>Icon Size:</strong></label>
            <select>
              <option>Small</option>
              <option selected>Medium</option>
              <option>Large</option>
            </select>
          </div>
        </div>
      `;
    } else if (tab.id === 'themes') {
      panel.innerHTML = `
        <div>
          <div style="margin-bottom: 10px;">
            <label><strong>Visual Style:</strong></label>
            <select>
              <option selected>Windows XP</option>
              <option>Windows Classic</option>
              <option>Modified</option>
            </select>
          </div>
          <div>
            <button>Save Theme...</button>
            <button>Delete Theme...</button>
          </div>
        </div>
      `;
    }
    
    tabContainer.appendChild(panel);
  });
  
  contentArea.appendChild(tabContainer);
  
  // Create button container at bottom right
  const buttonContainer = document.createElement('div');
  buttonContainer.style.display = 'flex';
  buttonContainer.style.justifyContent = 'flex-end';
  buttonContainer.style.gap = '5px';
  buttonContainer.style.marginTop = '15px';
  
  const okButton = document.createElement('button');
  okButton.textContent = "OK";
  okButton.addEventListener('click', () => {
    // Apply changes first (reuse the apply button's functionality)
    applyButton.click();
    // Then close the window
    const closeBtn = win.querySelector('button[aria-label="Close"]');
    if (closeBtn) closeBtn.click();
  });
  
  const cancelButton = document.createElement('button');
  cancelButton.textContent = "Cancel";
  cancelButton.addEventListener('click', () => {
    const closeBtn = win.querySelector('button[aria-label="Close"]');
    if (closeBtn) closeBtn.click();
  });
  
  const applyButton = document.createElement('button');
  applyButton.textContent = "Apply";
  applyButton.addEventListener('click', () => {
    const bgList = contentArea.querySelector('#bg-list');
    const positionSelect = contentArea.querySelector('#position-select');
    const bgColor = contentArea.querySelector('#bg-color');
    
    if (bgList && positionSelect && bgColor) {
      const value = bgList.value;
      const position = positionSelect.value;
      const color = bgColor.value;
      const desktop = document.querySelector('.desktop');
      
      if (value === 'none') {
        // Just set the background color
        desktop.style.backgroundImage = 'none';
        desktop.style.backgroundColor = color;
      } else {
        // Set the background image and positioning
        desktop.style.backgroundColor = color;
        
        if (position === 'center') {
          desktop.style.backgroundImage = `url('${value}')`;
          desktop.style.backgroundSize = 'auto';
          desktop.style.backgroundRepeat = 'no-repeat';
          desktop.style.backgroundPosition = 'center';
        } else if (position === 'tile') {
          desktop.style.backgroundImage = `url('${value}')`;
          desktop.style.backgroundSize = 'auto';
          desktop.style.backgroundRepeat = 'repeat';
          desktop.style.backgroundPosition = '0 0';
        } else if (position === 'stretch') {
          desktop.style.backgroundImage = `url('${value}')`;
          desktop.style.backgroundSize = 'cover';
          desktop.style.backgroundRepeat = 'no-repeat';
          desktop.style.backgroundPosition = 'center';
        }
      }
      
      showNotification("Background settings applied");
    }
  });
  
  buttonContainer.appendChild(okButton);
  buttonContainer.appendChild(cancelButton);
  buttonContainer.appendChild(applyButton);
  
  contentArea.appendChild(buttonContainer);
  
  // Add file input for browsing background images (hidden)
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.id = 'bg-file-input';
  fileInput.accept = 'image/*';
  fileInput.style.display = 'none';
  contentArea.appendChild(fileInput);
  
  // Set up event listeners after elements are in the DOM
  setTimeout(() => {
    const browseBtn = contentArea.querySelector('#browse-btn');
    if (browseBtn) {
      browseBtn.addEventListener('click', () => {
        fileInput.click();
      });
    }
    
    fileInput.addEventListener('change', async (e) => {
      if (e.target.files && e.target.files[0]) {
        try {
          const file = e.target.files[0];
          // Upload to S3 (Returns the URL of the uploaded file)
          const url = await websim.upload(file);
          
          // Add new option to the list box and select it
          const bgList = contentArea.querySelector('#bg-list');
          const newOption = document.createElement('option');
          newOption.value = url;
          newOption.textContent = file.name;
          bgList.appendChild(newOption);
          newOption.selected = true;
          
          showNotification("Custom background image uploaded");
        } catch (error) {
          console.error('Error uploading file:', error);
          showNotification("Error uploading background image");
        }
      }
    });
  }, 100);
}

function showNetworkSettings(win, showNotification) {
  const contentArea = win.querySelector('.window-content');
  contentArea.innerHTML = "";
  contentArea.style.padding = "15px";
  
  // Set the window title icon
  const titleBar = win.querySelector('.title-bar');
  if (titleBar) {
    const titleBarIcon = titleBar.querySelector('img');
    if (titleBarIcon) {
      titleBarIcon.src = "Network and Internet.png";
    }
  }
  // Update taskbar button icon
  const taskbarBtn = document.querySelector(`.taskbar-button[data-id="${win.dataset.id}"]`);
  if (taskbarBtn) {
    const btnIcon = taskbarBtn.querySelector('img');
    if (btnIcon) {
      btnIcon.src = "Network and Internet.png";
    }
  }
  
  // Create tabbed interface
  const tabContainer = document.createElement('div');
  tabContainer.style.marginBottom = "15px";
  
  const tabMenu = document.createElement('menu');
  tabMenu.setAttribute('role', 'tablist');
  tabMenu.style.display = 'flex';
  tabMenu.style.listStyle = 'none';
  tabMenu.style.padding = '0';
  tabMenu.style.margin = '0';
  tabMenu.style.borderBottom = '1px solid #ccc';
  
  const tabs = [
    { id: 'connections', name: 'Connections', selected: true },
    { id: 'setup', name: 'Network Setup' },
    { id: 'internet', name: 'Internet Options' }
  ];
  
  tabs.forEach(tab => {
    const button = document.createElement('button');
    button.setAttribute('aria-controls', tab.id);
    if (tab.selected) button.setAttribute('aria-selected', 'true');
    button.textContent = tab.name;
    button.style.padding = '5px 15px';
    button.style.margin = '0 2px';
    button.style.border = '1px solid #ccc';
    button.style.borderBottom = tab.selected ? 'none' : '1px solid #ccc';
    button.style.borderRadius = '4px 4px 0 0';
    button.style.backgroundColor = tab.selected ? 'white' : '#f0f0f0';
    button.style.position = 'relative';
    button.style.top = tab.selected ? '1px' : '0';
    
    button.addEventListener('click', () => {
      // Update selected state in buttons
      tabMenu.querySelectorAll('button').forEach(btn => {
        btn.removeAttribute('aria-selected');
        btn.style.backgroundColor = '#f0f0f0';
        btn.style.borderBottom = '1px solid #ccc';
        btn.style.top = '0';
      });
      button.setAttribute('aria-selected', 'true');
      button.style.backgroundColor = 'white';
      button.style.borderBottom = 'none';
      button.style.top = '1px';
      
      // Show selected panel, hide others
      tabContainer.querySelectorAll('[role="tabpanel"]').forEach(panel => {
        panel.hidden = true;
      });
      tabContainer.querySelector(`#${tab.id}`).hidden = false;
    });
    
    tabMenu.appendChild(button);
  });
  
  tabContainer.appendChild(tabMenu);
  
  // Create tab panels
  tabs.forEach(tab => {
    const panel = document.createElement('article');
    panel.setAttribute('role', 'tabpanel');
    panel.id = tab.id;
    panel.hidden = !tab.selected;
    panel.style.border = '1px solid #ccc';
    panel.style.borderTop = 'none';
    panel.style.padding = '15px';
    
    if (tab.id === 'connections') {
      panel.innerHTML = `
        <div>
          <div style="display: flex; align-items: center; margin-bottom: 10px;">
            <div style="width: 40px; height: 40px; background-color: #00ff00; margin-right: 10px; border-radius: 5px;"></div>
            <div>
              <strong>Local Area Connection</strong>
              <div>Status: Connected</div>
            </div>
          </div>
          <button>Properties</button>
        </div>
      `;
    } else if (tab.id === 'setup') {
      panel.innerHTML = `
        <div>
          <p>Create a home or small office network</p>
          <button>Run Network Setup Wizard</button>
        </div>
      `;
    } else if (tab.id === 'internet') {
      panel.innerHTML = `
        <div>
          <div style="margin-bottom: 10px;">
            <label><strong>Home Page:</strong></label>
            <input type="text" value="about:home" style="width: 250px;">
          </div>
          <div>
            <button>Clear Browser History</button>
          </div>
        </div>
      `;
    }
    
    tabContainer.appendChild(panel);
  });
  
  contentArea.appendChild(tabContainer);
  
  // Create button container at bottom right
  const buttonContainer = document.createElement('div');
  buttonContainer.style.display = 'flex';
  buttonContainer.style.justifyContent = 'flex-end';
  buttonContainer.style.gap = '5px';
  buttonContainer.style.marginTop = '15px';
  
  const okButton = document.createElement('button');
  okButton.textContent = "OK";
  okButton.addEventListener('click', () => {
    // Apply changes first (reuse the apply button's functionality)
    applyButton.click();
    // Then close the window
    const closeBtn = win.querySelector('button[aria-label="Close"]');
    if (closeBtn) closeBtn.click();
  });
  
  const cancelButton = document.createElement('button');
  cancelButton.textContent = "Cancel";
  cancelButton.addEventListener('click', () => {
    const closeBtn = win.querySelector('button[aria-label="Close"]');
    if (closeBtn) closeBtn.click();
  });
  
  const applyButton = document.createElement('button');
  applyButton.textContent = "Apply";
  
  buttonContainer.appendChild(okButton);
  buttonContainer.appendChild(cancelButton);
  buttonContainer.appendChild(applyButton);
  
  contentArea.appendChild(buttonContainer);
  
  showNotification("Network settings displayed");
}

function changeSoundSettings(win, showNotification) {
  const contentArea = win.querySelector('.window-content');
  contentArea.innerHTML = "";
  contentArea.style.padding = "15px";
  
  // Set the window title icon
  const titleBar = win.querySelector('.title-bar');
  if (titleBar) {
    const titleBarIcon = titleBar.querySelector('img');
    if (titleBarIcon) {
      titleBarIcon.src = "Audio Devices.png";
    }
  }
  // Update taskbar button icon
  const taskbarBtn = document.querySelector(`.taskbar-button[data-id="${win.dataset.id}"]`);
  if (taskbarBtn) {
    const btnIcon = taskbarBtn.querySelector('img');
    if (btnIcon) {
      btnIcon.src = "Audio Devices.png";
    }
  }
  
  // Create tabbed interface
  const tabContainer = document.createElement('div');
  tabContainer.style.marginBottom = "15px";
  
  const tabMenu = document.createElement('menu');
  tabMenu.setAttribute('role', 'tablist');
  tabMenu.style.display = 'flex';
  tabMenu.style.listStyle = 'none';
  tabMenu.style.padding = '0';
  tabMenu.style.margin = '0';
  tabMenu.style.borderBottom = '1px solid #ccc';
  
  const tabs = [
    { id: 'volume', name: 'Volume', selected: true },
    { id: 'sounds', name: 'Sounds' },
    { id: 'audio', name: 'Audio Devices' }
  ];
  
  tabs.forEach(tab => {
    const button = document.createElement('button');
    button.setAttribute('aria-controls', tab.id);
    if (tab.selected) button.setAttribute('aria-selected', 'true');
    button.textContent = tab.name;
    button.style.padding = '5px 15px';
    button.style.margin = '0 2px';
    button.style.border = '1px solid #ccc';
    button.style.borderBottom = tab.selected ? 'none' : '1px solid #ccc';
    button.style.borderRadius = '4px 4px 0 0';
    button.style.backgroundColor = tab.selected ? 'white' : '#f0f0f0';
    button.style.position = 'relative';
    button.style.top = tab.selected ? '1px' : '0';
    
    button.addEventListener('click', () => {
      // Update selected state in buttons
      tabMenu.querySelectorAll('button').forEach(btn => {
        btn.removeAttribute('aria-selected');
        btn.style.backgroundColor = '#f0f0f0';
        btn.style.borderBottom = '1px solid #ccc';
        btn.style.top = '0';
      });
      button.setAttribute('aria-selected', 'true');
      button.style.backgroundColor = 'white';
      button.style.borderBottom = 'none';
      button.style.top = '1px';
      
      // Show selected panel, hide others
      tabContainer.querySelectorAll('[role="tabpanel"]').forEach(panel => {
        panel.hidden = true;
      });
      tabContainer.querySelector(`#${tab.id}`).hidden = false;
    });
    
    tabMenu.appendChild(button);
  });
  
  tabContainer.appendChild(tabMenu);
  
  // Create tab panels
  tabs.forEach(tab => {
    const panel = document.createElement('article');
    panel.setAttribute('role', 'tabpanel');
    panel.id = tab.id;
    panel.hidden = !tab.selected;
    panel.style.border = '1px solid #ccc';
    panel.style.borderTop = 'none';
    panel.style.padding = '15px';
    
    if (tab.id === 'volume') {
      panel.innerHTML = `
        <div>
          <div style="margin-bottom: 15px;">
            <label><strong>Volume:</strong></label>
            <input type="range" min="0" max="100" value="75" id="volume-slider">
            <span id="volume-value">75%</span>
          </div>
          <div>
            <input type="checkbox" id="mute" name="mute">
            <label for="mute">Mute</label>
          </div>
        </div>
      `;
    } else if (tab.id === 'sounds') {
      panel.innerHTML = `
        <div>
          <div style="margin-bottom: 10px;">
            <label><strong>Sound Scheme:</strong></label>
            <select id="sound-scheme">
              <option selected>Windows Default</option>
              <option>No Sounds</option>
              <option>Windows Classic</option>
            </select>
          </div>
          <div style="margin-top: 15px;">
            <button id="test-sound">Play Windows XP Startup Sound</button>
          </div>
        </div>
      `;
    } else if (tab.id === 'audio') {
      panel.innerHTML = `
        <div>
          <div style="margin-bottom: 10px;">
            <strong>Default Device:</strong> Speakers (High Definition Audio)
          </div>
          <div>
            <button>Audio Properties</button>
          </div>
        </div>
      `;
    }
    
    tabContainer.appendChild(panel);
  });
  
  contentArea.appendChild(tabContainer);
  
  // Create button container at bottom right
  const buttonContainer = document.createElement('div');
  buttonContainer.style.display = 'flex';
  buttonContainer.style.justifyContent = 'flex-end';
  buttonContainer.style.gap = '5px';
  buttonContainer.style.marginTop = '15px';
  
  const okButton = document.createElement('button');
  okButton.textContent = "OK";
  okButton.addEventListener('click', () => {
    // Apply changes first (reuse the apply button's functionality)
    applyButton.click();
    // Then close the window
    const closeBtn = win.querySelector('button[aria-label="Close"]');
    if (closeBtn) closeBtn.click();
  });
  
  const cancelButton = document.createElement('button');
  cancelButton.textContent = "Cancel";
  cancelButton.addEventListener('click', () => {
    const closeBtn = win.querySelector('button[aria-label="Close"]');
    if (closeBtn) closeBtn.click();
  });
  
  const applyButton = document.createElement('button');
  applyButton.textContent = "Apply";
  
  buttonContainer.appendChild(okButton);
  buttonContainer.appendChild(cancelButton);
  buttonContainer.appendChild(applyButton);
  
  contentArea.appendChild(buttonContainer);
  
  // Add functionality
  const volumeSlider = contentArea.querySelector('#volume-slider');
  const volumeValue = contentArea.querySelector('#volume-value');
  const testSoundBtn = contentArea.querySelector('#test-sound');
  
  if (volumeSlider && volumeValue) {
    volumeSlider.addEventListener('input', () => {
      volumeValue.textContent = volumeSlider.value + '%';
    });
  }
  
  if (testSoundBtn) {
    testSoundBtn.addEventListener('click', () => {
      const startupSound = new Audio("Windows XP Startup.mp3");
      if (volumeSlider) {
        startupSound.volume = volumeSlider.value / 100;
      }
      startupSound.play().catch(err => {
        console.warn('Could not play startup sound:', err);
        showNotification("Error playing sound: " + err.message);
      });
      showNotification("Playing startup sound at " + (volumeSlider ? volumeSlider.value : 75) + "% volume");
    });
  }
}

function showProgramManager(win, showNotification) {
  const contentArea = win.querySelector('.window-content');
  contentArea.innerHTML = "";
  contentArea.style.padding = "15px";
  
  // Set the window title icon
  const titleBar = win.querySelector('.title-bar');
  if (titleBar) {
    const titleBarIcon = titleBar.querySelector('img');
    if (titleBarIcon) {
      titleBarIcon.src = "Programs.png";
    }
  }
  // Update taskbar button icon
  const taskbarBtn = document.querySelector(`.taskbar-button[data-id="${win.dataset.id}"]`);
  if (taskbarBtn) {
    const btnIcon = taskbarBtn.querySelector('img');
    if (btnIcon) {
      btnIcon.src = "Programs.png";
    }
  }
  
  // Create a flex container for the sidebar buttons and content area
  const mainContainer = document.createElement('div');
  mainContainer.style.display = 'flex';
  mainContainer.style.height = '100%';
  
  // Create left sidebar for big square buttons
  const sidebar = document.createElement('div');
  sidebar.style.width = '150px';
  sidebar.style.marginRight = '15px';
  sidebar.style.display = 'flex';
  sidebar.style.flexDirection = 'column';
  sidebar.style.gap = '10px';
  
  // Create content area (right side)
  const contentPanel = document.createElement('div');
  contentPanel.style.flex = '1';
  contentPanel.style.display = 'flex';
  contentPanel.style.flexDirection = 'column';
  
  // Define the sections/tabs
  const sections = [
    { id: 'installed', label: 'Change or Remove Programs', icon: '🗑️' },
    { id: 'new', label: 'Add New Programs', icon: '💿' },
    { id: 'windows', label: 'Windows Components', icon: '🪟' }
  ];
  
  // Create buttons and content panels
  sections.forEach((section, index) => {
    // Create the big square button
    const btn = document.createElement('button');
    btn.style.width = '140px';
    btn.style.height = '80px';
    btn.style.display = 'flex';
    btn.style.flexDirection = 'column';
    btn.style.alignItems = 'center';
    btn.style.justifyContent = 'center';
    btn.style.gap = '5px';
    btn.style.textAlign = 'center';
    btn.style.cursor = 'pointer';
    btn.style.backgroundColor = index === 0 ? '#e1e5f2' : '#f0f0f0';
    
    // Icon and text for button
    const icon = document.createElement('div');
    icon.textContent = section.icon;
    icon.style.fontSize = '24px';
    
    const label = document.createElement('div');
    label.textContent = section.label;
    
    btn.appendChild(icon);
    btn.appendChild(label);
    
    // Content panel for this section
    const panel = document.createElement('div');
    panel.id = section.id;
    panel.style.display = index === 0 ? 'block' : 'none';
    panel.style.flex = '1';
    
    // Handle click to switch tabs
    btn.addEventListener('click', () => {
      sections.forEach((s, i) => {
        const panelElement = document.getElementById(s.id);
        if (panelElement) {
          panelElement.style.display = i === index ? 'block' : 'none';
        }
        sidebar.children[i].style.backgroundColor = i === index ? '#e1e5f2' : '#f0f0f0';
      });
    });
    
    sidebar.appendChild(btn);
    contentPanel.appendChild(panel);
  });
  
  mainContainer.appendChild(sidebar);
  mainContainer.appendChild(contentPanel);
  contentArea.appendChild(mainContainer);
  
  // Add content for each panel
  const installedPanel = document.getElementById('installed');
  if (installedPanel) {
    installedPanel.innerHTML = `
      <div>
        <div style="height: 250px; overflow-y: auto; border: 1px solid #ddd; padding: 5px;">
          <div style="display: flex; justify-content: space-between; padding: 5px; border-bottom: 1px solid #eee;">
            <div>Internet Explorer</div>
            <div>6.0.2900.5512</div>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 5px; border-bottom: 1px solid #eee;">
            <div>Windows Media Player</div>
            <div>9.0.0.4503</div>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 5px; border-bottom: 1px solid #eee;">
            <div>Microsoft Paint</div>
            <div>5.1.2600.5512</div>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 5px; border-bottom: 1px solid #eee;">
            <div>Notepad</div>
            <div>5.1.2600.5512</div>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 5px; border-bottom: 1px solid #eee;">
            <div>Calculator</div>
            <div>5.1.2600.5512</div>
          </div>
        </div>
        <div style="margin-top: 10px;">
          <button disabled>Uninstall</button>
          <button disabled>Change</button>
          <button disabled>Repair</button>
        </div>
      </div>
    `;
  }
  
  const newPanel = document.getElementById('new');
  if (newPanel) {
    newPanel.innerHTML = `
      <div>
        <p>To install a program from a CD-ROM or floppy disk, click Install.</p>
        <button>Install...</button>
        <hr>
        <p>To install programs from Microsoft:</p>
        <button>Add programs from Microsoft</button>
      </div>
    `;
  }
  
  const windowsPanel = document.getElementById('windows');
  if (windowsPanel) {
    windowsPanel.innerHTML = `
      <div>
        <p>You can add or remove components of Windows XP.</p>
        <div style="height: 200px; overflow-y: auto; border: 1px solid #ddd; padding: 5px;">
          <div style="padding: 5px;">
            <input type="checkbox" id="ie" checked>
            <label for="ie">Internet Explorer</label>
          </div>
          <div style="padding: 5px;">
            <input type="checkbox" id="wmp" checked>
            <label for="wmp">Windows Media Player</label>
          </div>
          <div style="padding: 5px;">
            <input type="checkbox" id="msn" checked>
            <label for="msn">MSN Explorer</label>
          </div>
          <div style="padding: 5px;">
            <input type="checkbox" id="netmeeting">
            <label for="netmeeting">NetMeeting</label>
          </div>
        </div>
        <div style="margin-top: 10px;">
          <button>Apply Changes</button>
        </div>
      </div>
    `;
  }
  
  // Create button container at bottom right
  const buttonContainer = document.createElement('div');
  buttonContainer.style.display = 'flex';
  buttonContainer.style.justifyContent = 'flex-end';
  buttonContainer.style.gap = '5px';
  buttonContainer.style.marginTop = '15px';
  
  const okButton = document.createElement('button');
  okButton.textContent = "OK";
  okButton.addEventListener('click', () => {
    // Apply changes first (reuse the apply button's functionality)
    applyButton.click();
    // Then close the window
    const closeBtn = win.querySelector('button[aria-label="Close"]');
    if (closeBtn) closeBtn.click();
  });
  
  const cancelButton = document.createElement('button');
  cancelButton.textContent = "Cancel";
  cancelButton.addEventListener('click', () => {
    const closeBtn = win.querySelector('button[aria-label="Close"]');
    if (closeBtn) closeBtn.click();
  });
  
  const applyButton = document.createElement('button');
  applyButton.textContent = "Apply";
  
  buttonContainer.appendChild(okButton);
  buttonContainer.appendChild(cancelButton);
  buttonContainer.appendChild(applyButton);
  
  contentArea.appendChild(buttonContainer);
  
  showNotification("Program Manager opened");
}