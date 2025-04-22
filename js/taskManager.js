// Task Manager implementation

export function initTaskManager(win, showNotification) {
  const contentArea = win.querySelector('.window-content');
  contentArea.innerHTML = ""; // Clear existing content
  contentArea.style.padding = "0"; // Remove padding for full control
  contentArea.style.display = 'flex';
  contentArea.style.flexDirection = 'column';
  contentArea.style.backgroundColor = '#ece9d8'; // XP Background color

  // Create tabs container
  const tabContainer = document.createElement('div');
  tabContainer.style.padding = '5px 5px 0 5px'; // Padding around tabs
  tabContainer.style.marginBottom = '0'; // No bottom margin

  const tabMenu = document.createElement('menu');
  tabMenu.setAttribute('role', 'tablist');
  tabMenu.style.display = 'flex';
  tabMenu.style.listStyle = 'none';
  tabMenu.style.padding = '0';
  tabMenu.style.margin = '0';
  tabMenu.style.borderBottom = '1px solid #808080'; // XP style border

  const tabs = [
    { id: 'applications', name: 'Applications', selected: true },
    { id: 'processes', name: 'Processes' }
  ];

  // Create tab buttons
  tabs.forEach(tab => {
    const button = document.createElement('button');
    button.setAttribute('aria-controls', tab.id);
    button.setAttribute('aria-selected', tab.selected ? 'true' : 'false');
    button.textContent = tab.name;
    button.className = 'task-manager-tab'; // Add class for styling
    button.style.padding = '2px 6px'; // XP padding
    button.style.marginRight = '2px';
    button.style.border = '1px solid #c0c0c0';
    button.style.borderBottom = 'none';
    button.style.borderRadius = '2px 2px 0 0';
    button.style.backgroundColor = tab.selected ? '#ece9d8' : '#d4d0c8'; // XP tab colors
    button.style.position = 'relative';
    button.style.top = tab.selected ? '1px' : '0'; // Selected tab slightly lower
    button.style.cursor = 'default';
    button.style.fontFamily = 'Tahoma, sans-serif'; // XP font
    button.style.fontSize = '11px'; // XP font size

    if (tab.selected) {
      button.style.borderBottom = '1px solid #ece9d8'; // Hide bottom border for selected tab
    } else {
      button.style.borderBottom = '1px solid #808080';
    }

    button.addEventListener('click', () => {
      // Update button styles
      tabMenu.querySelectorAll('button').forEach(btn => {
        btn.setAttribute('aria-selected', 'false');
        btn.style.backgroundColor = '#d4d0c8';
        btn.style.borderBottom = '1px solid #808080';
        btn.style.top = '0';
      });
      button.setAttribute('aria-selected', 'true');
      button.style.backgroundColor = '#ece9d8';
      button.style.borderBottom = '1px solid #ece9d8';
      button.style.top = '1px';

      // Update panel visibility
      panelsContainer.querySelectorAll('[role="tabpanel"]').forEach(panel => {
        panel.hidden = true;
      });
      const activePanel = panelsContainer.querySelector(`#${tab.id}`); // Use panelsContainer
      if (activePanel) activePanel.hidden = false;

      // Refresh list when switching tabs
      if (tab.id === 'applications') {
        updateApplicationsList();
      } else if (tab.id === 'processes') {
        updateProcessesList();
      }
      // Reset selection and disable button when switching tabs
      selectedItemId = null;
      selectedItemType = null; // Reset type as well
      endTaskBtn.disabled = true;
      // Remove selection highlight from previously selected row
      // Ensure we target the correct container for removal
      if(appListContent) appListContent.querySelectorAll('.selected').forEach(r => r.classList.remove('selected'));
      if(processListContent) processListContent.querySelectorAll('.selected').forEach(r => r.classList.remove('selected'));
    });

    tabMenu.appendChild(button);
  });

  tabContainer.appendChild(tabMenu);

  // Create tab panels container and individual panels
  const panelsContainer = document.createElement('div');
  panelsContainer.style.flex = '1';
  panelsContainer.style.padding = '5px'; // Padding around the panel content area
  panelsContainer.style.overflow = 'hidden'; // Prevent container scroll, panel scrolls
  panelsContainer.style.display = 'flex';
  panelsContainer.style.flexDirection = 'column';
  panelsContainer.style.minHeight = '0'; // Ensure flex children can shrink

  tabs.forEach(tab => {
    const panel = document.createElement('article');
    panel.setAttribute('role', 'tabpanel');
    panel.id = tab.id;
    panel.hidden = !tab.selected;
    panel.style.border = '1px solid #808080'; // XP panel border
    panel.style.borderTop = 'none'; // Border handled by tab menu
    panel.style.padding = '8px'; // Inner padding for panel content
    panel.style.backgroundColor = 'white'; // White background for content
    panel.style.flex = '1';
    panel.style.overflowY = 'auto'; // Allow panel content to scroll
    panel.style.minHeight = '0'; // Needed for flexbox scrolling

    // Use separate divs for list content to target updates correctly
    const listContentDiv = document.createElement('div');
    listContentDiv.id = `${tab.id}-list-content`; // Unique ID for content div
    listContentDiv.style.height = '100%'; // Ensure it tries to fill the panel
    listContentDiv.style.overflowY = 'auto'; // Let this inner div scroll
    panel.appendChild(listContentDiv);

    panelsContainer.appendChild(panel);
  });

  contentArea.appendChild(tabContainer);
  contentArea.appendChild(panelsContainer);

  // Bottom buttons container
  const buttonContainer = document.createElement('div');
  buttonContainer.style.display = 'flex';
  buttonContainer.style.justifyContent = 'flex-end';
  buttonContainer.style.gap = '6px'; // XP gap
  buttonContainer.style.padding = '8px'; // Padding around buttons
  buttonContainer.style.borderTop = '1px solid #ccc';

  const endTaskBtn = document.createElement('button');
  endTaskBtn.textContent = 'End Task';
  endTaskBtn.disabled = true; // Initially disabled
  endTaskBtn.className = 'task-manager-button'; // Add class
  buttonContainer.appendChild(endTaskBtn);

  contentArea.appendChild(buttonContainer);

  // Get references to the actual content divs within the panels
  const appListContent = contentArea.querySelector('#applications-list-content');
  const processListContent = contentArea.querySelector('#processes-list-content');
  let selectedItemId = null;
  let selectedItemType = null; // 'window' or 'bonzi'

  function updateApplicationsList() {
    if (!appListContent) return; // Ensure the element exists
    appListContent.innerHTML = ''; // Target the correct div
    const windows = document.querySelectorAll('.window');
    const appTable = document.createElement('table');
    appTable.className = 'task-manager-table'; // Add class

    const thead = appTable.createTHead();
    thead.className = 'task-manager-header'; // Add class
    const headerRow = thead.insertRow();
    const thTask = headerRow.insertCell();
    thTask.textContent = 'Task';
    thTask.style.textAlign = 'left';
    thTask.style.padding = '2px 4px'; // XP header padding

    const tbody = appTable.createTBody();

    // Add standard windows
    windows.forEach(w => {
      const title = w.dataset.title || 'Untitled Window';
      if (title === 'Task Manager') return; // Don't list itself

      const row = tbody.insertRow();
      row.dataset.windowId = w.dataset.id;
      row.className = 'task-manager-row'; // Add class
      row.style.cursor = 'default'; // XP cursor

      const cellTask = row.insertCell();
      cellTask.textContent = title;
      cellTask.className = 'task-manager-cell'; // Add class
      cellTask.style.padding = '2px 4px'; // XP cell padding

      row.addEventListener('click', () => {
        tbody.querySelectorAll('tr').forEach(r => r.classList.remove('selected'));
        row.classList.add('selected');
        selectedItemId = w.dataset.id;
        selectedItemType = 'window'; // Set type
        endTaskBtn.disabled = false;
      });
    });

    // Add BonziBuddy instances
    const bonziInstances = document.querySelectorAll('.bonzi-buddy[data-bonzi-instance="true"]');
    bonziInstances.forEach(bonzi => {
        const row = tbody.insertRow();
        row.dataset.bonziId = bonzi.dataset.id; // Use bonziId
        row.className = 'task-manager-row';
        row.style.cursor = 'default';

        const cellTask = row.insertCell();
        cellTask.textContent = 'BonziBuddy'; // Consistent name
        cellTask.className = 'task-manager-cell';
        cellTask.style.padding = '2px 4px';

        row.addEventListener('click', () => {
            tbody.querySelectorAll('tr').forEach(r => r.classList.remove('selected'));
            row.classList.add('selected');
            selectedItemId = bonzi.dataset.id;
            selectedItemType = 'bonzi'; // Set type
            endTaskBtn.disabled = false;
        });
    });


    appListContent.appendChild(appTable); // Append to the correct div
  }

  function updateProcessesList() {
    if (!processListContent) return; // Ensure the element exists
    processListContent.innerHTML = ''; // Target the correct div
    const windows = document.querySelectorAll('.window');
    const processTable = document.createElement('table');
    processTable.className = 'task-manager-table'; // Add class

    const thead = processTable.createTHead();
    thead.className = 'task-manager-header'; // Add class
    const headerRow = thead.insertRow();
    const headers = ['Image Name', 'User Name', 'CPU', 'Mem Usage'];
    headers.forEach(text => {
      const th = headerRow.insertCell();
      th.textContent = text;
      th.style.textAlign = 'left';
      th.style.padding = '2px 4px'; // XP header padding
    });

    const tbody = processTable.createTBody();

    // System Idle Process (Fake)
    const idleRow = tbody.insertRow();
    idleRow.dataset.processId = 'idle'; // Use a different attribute for fake processes
    idleRow.className = 'task-manager-row'; // Add class
    const idleCells = ['System Idle Process', 'SYSTEM', '90+', '8 K'];
    idleCells.forEach((text, index) => {
      const cell = idleRow.insertCell();
      cell.textContent = text;
      cell.className = 'task-manager-cell'; // Add class
      cell.style.padding = '2px 4px'; // XP cell padding
      if (index > 1) cell.style.textAlign = 'right'; // Align numeric columns right
    });
    // Make idle process unselectable/unendable
     idleRow.addEventListener('click', () => {
        tbody.querySelectorAll('tr').forEach(r => r.classList.remove('selected'));
        // Don't select idle row
        selectedItemId = null;
        selectedItemType = null;
        endTaskBtn.disabled = true;
     });


    // Add standard windows as processes
    windows.forEach(w => {
      const title = w.dataset.title || 'Untitled Window';
      let imageName = title.replace(/\s+/g, '').toLowerCase() + '.exe';
      if (imageName === 'taskmanager.exe') return; // Don't list itself

      const row = tbody.insertRow();
      row.dataset.windowId = w.dataset.id;
      row.className = 'task-manager-row'; // Add class
      row.style.cursor = 'default'; // XP cursor

      const cellImage = row.insertCell();
      cellImage.textContent = imageName;
      cellImage.className = 'task-manager-cell';
      cellImage.style.padding = '2px 4px';

      const cellUser = row.insertCell();
      cellUser.textContent = 'User';
      cellUser.className = 'task-manager-cell';
      cellUser.style.padding = '2px 4px';

      const cellCPU = row.insertCell();
      cellCPU.textContent = Math.floor(Math.random() * 5);
      cellCPU.className = 'task-manager-cell';
      cellCPU.style.padding = '2px 4px';
      cellCPU.style.textAlign = 'right';

      const cellMem = row.insertCell();
      cellMem.textContent = `${Math.floor(Math.random() * 50000) + 1000} K`;
      cellMem.className = 'task-manager-cell';
      cellMem.style.padding = '2px 4px';
      cellMem.style.textAlign = 'right';

      row.addEventListener('click', () => {
        tbody.querySelectorAll('tr').forEach(r => r.classList.remove('selected'));
        row.classList.add('selected');
        selectedItemId = w.dataset.id;
        selectedItemType = 'window'; // Set type
        endTaskBtn.disabled = false;
      });
    });

    // Add BonziBuddy instances as processes
    const bonziInstances = document.querySelectorAll('.bonzi-buddy[data-bonzi-instance="true"]');
    bonziInstances.forEach(bonzi => {
        const row = tbody.insertRow();
        row.dataset.bonziId = bonzi.dataset.id;
        row.className = 'task-manager-row';
        row.style.cursor = 'default';

        const cellImage = row.insertCell();
        cellImage.textContent = 'bonzi.exe'; // Process name
        cellImage.className = 'task-manager-cell';
        cellImage.style.padding = '2px 4px';

        const cellUser = row.insertCell();
        cellUser.textContent = 'User';
        cellUser.className = 'task-manager-cell';
        cellUser.style.padding = '2px 4px';

        const cellCPU = row.insertCell();
        cellCPU.textContent = Math.floor(Math.random() * 10) + 5; // Bonzi uses more CPU :)
        cellCPU.className = 'task-manager-cell';
        cellCPU.style.padding = '2px 4px';
        cellCPU.style.textAlign = 'right';

        const cellMem = row.insertCell();
        cellMem.textContent = `${Math.floor(Math.random() * 20000) + 5000} K`; // Bonzi uses some memory
        cellMem.className = 'task-manager-cell';
        cellMem.style.padding = '2px 4px';
        cellMem.style.textAlign = 'right';

        row.addEventListener('click', () => {
            tbody.querySelectorAll('tr').forEach(r => r.classList.remove('selected'));
            row.classList.add('selected');
            selectedItemId = bonzi.dataset.id;
            selectedItemType = 'bonzi'; // Set type
            endTaskBtn.disabled = false;
        });
    });


    processListContent.appendChild(processTable); // Append to the correct div
  }

  // End task button logic
  endTaskBtn.addEventListener('click', () => {
    if (selectedItemId && selectedItemType) {
      let itemEnded = false;
      let itemName = 'Unknown Task';
      let preventedByEvilBonzi = false; // Flag to track if evil Bonzi prevented closure

      if (selectedItemType === 'window') {
          const windowToEnd = document.querySelector(`.window[data-id="${selectedItemId}"]`);
          if (windowToEnd) {
              itemName = windowToEnd.dataset.title || 'Untitled Window';
              const closeBtn = windowToEnd.querySelector('button[aria-label="Close"]');
              if (closeBtn) {
                  closeBtn.click();
              } else {
                  windowToEnd.remove(); // Fallback if no close button
              }
              itemEnded = true;
          }
      } else if (selectedItemType === 'bonzi') {
          const bonziToEnd = document.querySelector(`.bonzi-buddy[data-id="${selectedItemId}"]`);
          if (bonziToEnd) {
              itemName = 'BonziBuddy';
              // Check if this Bonzi instance is in evil mode
              if (bonziToEnd.dataset.evilMode === 'true') {
                  preventedByEvilBonzi = true;
                  // Make Bonzi speak a defiant message
                  if (bonziToEnd.speak) { // Check if the speak function exists
                      bonziToEnd.speak("You can't stop me that easily!");
                  } else {
                      showNotification("Bonzi laughs maniacally!"); // Fallback notification
                  }
              } else {
                  // Only remove if not in evil mode
                  if (bonziToEnd.bonziCleanup) { // Call cleanup function if it exists
                      bonziToEnd.bonziCleanup();
                  }
                  bonziToEnd.remove();
                  itemEnded = true;
              }
          }
      }

      if (itemEnded) {
          showNotification(`Ended task: ${itemName}`);
          // Refresh the currently visible list immediately after ending task
          const selectedTabButton = tabContainer.querySelector('button[aria-selected="true"]');
          if (selectedTabButton) {
              const selectedTabId = selectedTabButton.getAttribute('aria-controls');
              if (selectedTabId === 'applications') {
                  updateApplicationsList();
              } else if (selectedTabId === 'processes') {
                  updateProcessesList();
              }
          }
      } else if (!preventedByEvilBonzi) { // Don't show 'not found' if prevented
          showNotification('Task not found or could not be ended.');
      }

      // Reset selection state only if not prevented by evil Bonzi
      if (!preventedByEvilBonzi) {
        selectedItemId = null;
        selectedItemType = null;
        endTaskBtn.disabled = true;
        // Remove selection highlight (redundant if list refreshes, but safe)
        if(appListContent) appListContent.querySelectorAll('.selected').forEach(r => r.classList.remove('selected'));
        if(processListContent) processListContent.querySelectorAll('.selected').forEach(r => r.classList.remove('selected'));
      } else {
        // Keep button enabled if Bonzi prevented closing
        endTaskBtn.disabled = false;
      }
    }
  });

  // Initial population
  updateApplicationsList();

  // Periodically refresh the lists
  const refreshInterval = setInterval(() => {
    if (!document.body.contains(win)) {
      clearInterval(refreshInterval);
      return;
    }

    // Store the ID before refresh
    const currentSelectedId = selectedItemId;
    const currentSelectedType = selectedItemType;

    const selectedTabButton = tabContainer.querySelector('button[aria-selected="true"]');
    let listContainer; // Define listContainer

    if (selectedTabButton) {
      const selectedTabId = selectedTabButton.getAttribute('aria-controls');
      if (selectedTabId === 'applications') {
        updateApplicationsList();
        listContainer = appListContent; // Assign correct container
      } else if (selectedTabId === 'processes') {
        updateProcessesList();
        listContainer = processListContent; // Assign correct container
      }

      // After list update, try to re-select based on stored ID:
      selectedItemId = null; // Reset before re-finding
      selectedItemType = null;
      endTaskBtn.disabled = true;

      if (currentSelectedId && listContainer) {
          let rowToSelect = null;
          if (currentSelectedType === 'window') {
              rowToSelect = listContainer.querySelector(`tr[data-window-id="${currentSelectedId}"]`);
          } else if (currentSelectedType === 'bonzi') {
              rowToSelect = listContainer.querySelector(`tr[data-bonzi-id="${currentSelectedId}"]`);
          }

          if (rowToSelect) {
              // Ensure only one row is selected visually
              listContainer.querySelectorAll('tr.selected').forEach(r => r.classList.remove('selected'));
              rowToSelect.classList.add('selected');
              selectedItemId = currentSelectedId; // Restore selection state
              selectedItemType = currentSelectedType;
              endTaskBtn.disabled = false;
          }
      }
    } else {
        // Handle case where no tab is selected (shouldn't normally happen)
        endTaskBtn.disabled = true;
    }
  }, 2000); // Refresh every 2 seconds

  // Add resize handle to Task Manager window
  const resizeHandle = document.createElement('div');
  resizeHandle.className = 'resize-handle';
  // Styles are moved to CSS
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