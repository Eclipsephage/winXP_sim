export function initMinesweeper(win, showNotification) {
  // Use .window-content if available, otherwise fall back to .window-body
  const container = win.querySelector('.window-content') || win.querySelector('.window-body');
  container.innerHTML = '';
  container.style.backgroundColor = '#c0c0c0';
  container.style.display = 'flex';
  container.style.flexDirection = 'column';
  container.style.padding = '0';
  
  // Add menu bar at the top
  const menuBar = document.createElement('div');
  menuBar.style.display = 'flex';
  menuBar.style.padding = '2px 0';
  menuBar.style.backgroundColor = '#ece9d8';
  menuBar.style.borderBottom = '1px solid #808080';
  
  const gameMenu = document.createElement('div');
  gameMenu.textContent = 'Game';
  gameMenu.style.padding = '2px 10px';
  gameMenu.style.cursor = 'pointer';
  gameMenu.style.position = 'relative';
  
  menuBar.appendChild(gameMenu);
  container.appendChild(menuBar);
  
  // Create dropdown for Game menu
  const gameDropdown = document.createElement('div');
  gameDropdown.className = 'game-dropdown';
  gameDropdown.style.display = 'none';
  gameDropdown.style.position = 'absolute';
  gameDropdown.style.top = '100%';
  gameDropdown.style.left = '0';
  gameDropdown.style.backgroundColor = 'white';
  gameDropdown.style.border = '1px solid #808080';
  gameDropdown.style.zIndex = '1000';
  gameDropdown.style.width = '150px';
  gameDropdown.style.boxShadow = '2px 2px 5px rgba(0,0,0,0.3)';
  
  const menuItems = [
    { label: 'New', action: 'new' },
    { label: 'Beginner', action: 'beginner' },
    { label: 'Intermediate', action: 'intermediate' },
    { label: 'Expert', action: 'expert' }
  ];
  
  menuItems.forEach(item => {
    const menuItem = document.createElement('div');
    menuItem.textContent = item.label;
    menuItem.style.padding = '5px 10px';
    menuItem.style.cursor = 'pointer';
    menuItem.style.hover = 'backgroundColor: #c0c0c0';
    
    menuItem.addEventListener('mouseover', () => {
      menuItem.style.backgroundColor = '#c0c0c0';
    });
    
    menuItem.addEventListener('mouseout', () => {
      menuItem.style.backgroundColor = 'white';
    });
    
    menuItem.addEventListener('click', () => {
      if (item.action === 'new') {
        resetGame();
      } else if (item.action === 'beginner') {
        difficultySelect.value = 'easy';
        updateDifficulty();
        resetGame();
      } else if (item.action === 'intermediate') {
        difficultySelect.value = 'medium';
        updateDifficulty();
        resetGame();
      } else if (item.action === 'expert') {
        difficultySelect.value = 'hard';
        updateDifficulty();
        resetGame();
      }
      gameDropdown.style.display = 'none';
    });
    
    gameDropdown.appendChild(menuItem);
  });
  
  gameMenu.appendChild(gameDropdown);
  
  gameMenu.addEventListener('click', () => {
    if (gameDropdown.style.display === 'none') {
      gameDropdown.style.display = 'block';
    } else {
      gameDropdown.style.display = 'none';
    }
  });
  
  document.addEventListener('click', (e) => {
    if (!gameMenu.contains(e.target)) {
      gameDropdown.style.display = 'none';
    }
  });
  
  // Create controls container
  const controlsContainer = document.createElement('div');
  controlsContainer.style.display = 'flex';
  controlsContainer.style.justifyContent = 'space-between';
  controlsContainer.style.alignItems = 'center';
  controlsContainer.style.padding = '5px';
  controlsContainer.style.backgroundColor = '#c0c0c0';
  controlsContainer.style.borderBottom = '2px solid #808080';
  controlsContainer.style.borderRight = '2px solid #808080';
  controlsContainer.style.borderTop = '2px solid #ffffff';
  controlsContainer.style.borderLeft = '2px solid #ffffff';
  controlsContainer.style.margin = '6px';
  
  // Mine counter display
  const mineCounter = document.createElement('div');
  mineCounter.id = 'mine-count';
  mineCounter.style.backgroundColor = 'black';
  mineCounter.style.color = 'red';
  mineCounter.style.fontFamily = 'Digital-7, monospace';
  mineCounter.style.fontSize = '22px';
  mineCounter.style.padding = '0 2px';
  mineCounter.style.fontWeight = 'bold';
  mineCounter.style.width = '50px';  
  mineCounter.style.textAlign = 'center';
  mineCounter.style.border = '2px inset #808080';
  
  // Face button for reset - updated styling to match sprite exactly
  const faceButton = document.createElement('button');
  faceButton.id = 'face-button';
  faceButton.style.width = '26px'; // Match sprite width
  faceButton.style.height = '26px'; // Match sprite height
  faceButton.style.minWidth = '26px'; // Override xp.css defaults
  faceButton.style.minHeight = '26px'; // Override xp.css defaults
  faceButton.style.backgroundColor = '#c0c0c0';
  faceButton.style.border = '2px outset #ffffff';
  faceButton.style.borderRight = '2px outset #808080';
  faceButton.style.borderBottom = '2px outset #808080';
  faceButton.style.display = 'flex';
  faceButton.style.justifyContent = 'center';
  faceButton.style.alignItems = 'center';
  faceButton.style.cursor = 'pointer';
  faceButton.style.padding = '0';
  faceButton.style.margin = '0 10px'; // Add margin for spacing
  
  const faceImg = document.createElement('img');
  faceImg.src = 'minesweeper-smile-normal.png';
  faceImg.style.width = '26px';
  faceImg.style.height = '26px';
  faceImg.style.pointerEvents = 'none';
  faceButton.appendChild(faceImg);
  
  // Timer display
  const timerDisplay = document.createElement('div');
  timerDisplay.id = 'timer-display';
  timerDisplay.style.backgroundColor = 'black';
  timerDisplay.style.color = 'red';
  timerDisplay.style.fontFamily = 'Digital-7, monospace';
  timerDisplay.style.fontSize = '22px';
  timerDisplay.style.padding = '0 2px';
  timerDisplay.style.fontWeight = 'bold';
  timerDisplay.style.width = '50px';  
  timerDisplay.style.textAlign = 'center';
  timerDisplay.style.border = '2px inset #808080';
  
  controlsContainer.appendChild(mineCounter);
  controlsContainer.appendChild(faceButton);
  controlsContainer.appendChild(timerDisplay);
  container.appendChild(controlsContainer);
  
  // Create grid container with border
  const gridOuterContainer = document.createElement('div');
  gridOuterContainer.style.margin = '0 6px 6px 6px';
  gridOuterContainer.style.border = '3px solid #808080';
  gridOuterContainer.style.borderRightColor = '#ffffff';
  gridOuterContainer.style.borderBottomColor = '#ffffff';
  
  const gridContainer = document.createElement('div');
  gridContainer.id = 'minesweeper-grid';
  gridContainer.style.border = '3px solid #808080';
  gridContainer.style.borderTopColor = '#404040';
  gridContainer.style.borderLeftColor = '#404040';
  gridContainer.style.backgroundColor = '#c0c0c0';
  
  gridOuterContainer.appendChild(gridContainer);
  container.appendChild(gridOuterContainer);
  
  // Hidden difficulty select for internal use
  const difficultySelect = document.createElement('select');
  difficultySelect.id = 'difficulty-select';
  difficultySelect.style.display = 'none';
  difficultySelect.innerHTML = `
    <option value="easy" selected>Easy (9x9, 10 mines)</option>
    <option value="medium">Medium (16x16, 40 mines)</option>
    <option value="hard">Hard (16x30, 99 mines)</option>
  `;
  container.appendChild(difficultySelect);

  // Default parameters for each difficulty
  const difficulties = {
    easy: { rows: 9, cols: 9, mines: 10 },
    medium: { rows: 16, cols: 16, mines: 40 },
    hard: { rows: 16, cols: 30, mines: 99 }
  };
  
  let rows, cols, MINE_COUNT;
  let cells = [];
  let mineLocations = [];
  let gameOverFlag = false;
  let timeElapsed = 0;
  let timerInterval = null;
  let firstClick = false; // Ensure board is generated on first click
  let flaggedCount = 0;
  
  function updateDifficulty() {
    const diff = difficultySelect.value;
    const settings = difficulties[diff];
    rows = settings.rows;
    cols = settings.cols;
    MINE_COUNT = settings.mines;
    flaggedCount = 0;
  }
  
  updateDifficulty();
  
  function updateMineCounter() {
    const remainingMines = MINE_COUNT - flaggedCount;
    mineCounter.textContent = remainingMines.toString().padStart(3, '0');
  }
  
  function updateTimer() {
    timerDisplay.textContent = timeElapsed.toString().padStart(3, '0');
  }
  
  function createGrid() {
    gridContainer.innerHTML = '';
    cells = [];
    
    // Use CSS Grid to avoid wrapping problems
    gridContainer.style.display = 'grid';
    gridContainer.style.gridTemplateColumns = `repeat(${cols}, 16px)`;
    gridContainer.style.gridAutoRows = '16px';
    
    for (let i = 0; i < rows * cols; i++) {
      const cell = document.createElement('div');
      cell.style.width = '16px';
      cell.style.height = '16px';
      cell.style.boxSizing = 'border-box';
      cell.style.backgroundColor = '#c0c0c0';
      cell.style.border = '1px solid #ffffff';
      cell.style.borderRight = '1px solid #7b7b7b';
      cell.style.borderBottom = '1px solid #7b7b7b';
      cell.style.textAlign = 'center';
      cell.style.lineHeight = '16px';
      cell.style.fontSize = '12px';
      cell.style.fontWeight = 'bold';
      cell.style.userSelect = 'none';
      
      // Calculate row and col based on i index
      const rowNum = Math.floor(i / cols);
      const colNum = i % cols;
      cell.dataset.row = rowNum;
      cell.dataset.col = colNum;
      gridContainer.appendChild(cell);
      cells.push(cell);
    }
    
    // Auto-resize the Minesweeper window to fit the grid and controls
    const desiredWidth = cols * 16 + 26;
    const desiredHeight = rows * 16 + 125;
    win.style.width = `${desiredWidth}px`;
    win.style.height = `${desiredHeight}px`;
  }
  
  // Place mines, guaranteed safeZone from (safeRow-1, safeCol-1) to (safeRow+1, safeCol+1)
  function placeMines(safeRow, safeCol) {
    mineLocations = [];
    const safeZone = new Set();
    for (let i = safeRow - 1; i <= safeRow + 1; i++) {
      for (let j = safeCol - 1; j <= safeCol + 1; j++) {
        if (i >= 0 && i < rows && j >= 0 && j < cols) {
          safeZone.add(i * cols + j);
        }
      }
    }
    while (mineLocations.length < MINE_COUNT) {
      const idx = Math.floor(Math.random() * (rows * cols));
      if (mineLocations.includes(idx) || safeZone.has(idx)) continue;
      mineLocations.push(idx);
    }
  }
  
  function countAdjacentMines(row, col) {
    let count = 0;
    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        const newRow = parseInt(row) + i;
        const newCol = parseInt(col) + j;
        if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols) {
          const index = newRow * cols + newCol;
          if (mineLocations.includes(index)) count++;
        }
      }
    }
    return count;
  }

  function revealCell(cell) {
    if (cell.classList.contains('revealed') || gameOverFlag) return;
    // Do not reveal flagged cells
    if (cell.getAttribute('data-flagged') === 'true') return;
    
    const row = parseInt(cell.dataset.row);
    const col = parseInt(cell.dataset.col);
    const index = row * cols + col;
    cell.classList.add('revealed');
    
    // Style for revealed cells
    cell.style.border = '1px solid #7b7b7b';
    cell.style.borderRight = '1px solid #7b7b7b';
    cell.style.borderBottom = '1px solid #7b7b7b';
    
    if (mineLocations.includes(index)) {
      // Show all mines and mark wrong flags
      cell.textContent = "💣";
      cell.style.backgroundColor = '#ff0000'; // Red background for the clicked mine
      gameOverFlag = true;
      clearInterval(timerInterval);
      
      // Change face to dead
      faceImg.src = 'minesweeper-smile-lose.png';
      
      // Reveal all other mines
      mineLocations.forEach(idx => {
        const mineCell = cells[idx];
        if (!mineCell.classList.contains('revealed')) {
          if (mineCell.getAttribute('data-flagged') !== 'true') {
            mineCell.textContent = "💣";
            mineCell.classList.add('revealed');
            mineCell.style.border = '1px solid #7b7b7b';
          }
        }
      });
      
      // Mark incorrect flags
      cells.forEach((c, idx) => {
        if (c.getAttribute('data-flagged') === 'true' && !mineLocations.includes(idx)) {
          c.innerHTML = "💣❌"; // Wrong flag
          c.style.backgroundColor = '#ff8080';
          c.classList.add('revealed');
          c.style.border = '1px solid #7b7b7b';
        }
      });
      
      showNotification('Game Over! You hit a mine.');
    } else {
      const mines = countAdjacentMines(row, col);
      if (mines > 0) {
        cell.textContent = mines;
        // Set color based on number
        const colors = ['', 'blue', 'green', 'red', 'darkblue', 'darkred', 'darkcyan', 'black', 'gray'];
        cell.style.color = colors[mines];
      } else {
        // Empty cell, recursively reveal adjacent cells
        for (let i = -1; i <= 1; i++) {
          for (let j = -1; j <= 1; j++) {
            const newRow = row + i;
            const newCol = col + j;
            if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols) {
              const adjacentIndex = newRow * cols + newCol;
              const adjacentCell = cells[adjacentIndex];
              if (!adjacentCell.classList.contains('revealed')) {
                revealCell(adjacentCell);
              }
            }
          }
        }
      }
    }
    checkWinCondition();
  }
  
  function checkWinCondition() {
    const unrevealed = cells.filter(cell => !cell.classList.contains('revealed')).length;
    if (unrevealed === MINE_COUNT && !gameOverFlag) {
      gameOverFlag = true;
      clearInterval(timerInterval);
      
      // Flag all mines automatically
      mineLocations.forEach(idx => {
        const mineCell = cells[idx];
        if (mineCell.getAttribute('data-flagged') !== 'true') {
          mineCell.textContent = "🚩";
          mineCell.setAttribute('data-flagged', 'true');
        }
      });
      
      // Update flag count to match the mine count
      flaggedCount = MINE_COUNT;
      updateMineCounter();
      
      // Change face to cool glasses
      faceImg.src = 'minesweeper-smile-win.png';
      
      showNotification('Congratulations! You won!');
    }
  }
  
  function startTimer() {
    timeElapsed = 0;
    updateTimer();
    
    if (timerInterval) {
      clearInterval(timerInterval);
    }
    
    timerInterval = setInterval(() => {
      timeElapsed++;
      if (timeElapsed > 999) timeElapsed = 999; // Cap at 999
      updateTimer();
    }, 1000);
  }
  
  function resetGame() {
    clearInterval(timerInterval);
    gameOverFlag = false;
    firstClick = false;
    timeElapsed = 0;
    flaggedCount = 0;
    
    updateMineCounter();
    updateTimer();
    createGrid();
    
    // Reset face
    faceImg.src = 'minesweeper-smile-normal.png';
  }

  let leftButtonDown = false;
  let rightButtonDown = false;

  gridContainer.addEventListener('mousedown', (e) => {
    if (e.button === 0) { // Left button
      leftButtonDown = true;
    } else if (e.button === 2) { // Right button
      rightButtonDown = true;
    }

    // Check for chording (both buttons pressed)
    if (leftButtonDown && rightButtonDown) {
      handleChord(e);
    } else if (e.button === 0 && !gameOverFlag) { // Left button only
      // Only change to surprised face if not clicking on face button itself
      if (!e.target.closest('#face-button')) {
        faceImg.src = 'minesweeper-smile-surprise.png';
      }
    }
  });

  gridContainer.addEventListener('mouseup', (e) => {
    if (e.button === 0) { // Left button released
      leftButtonDown = false;
    } else if (e.button === 2) { // Right button released
      rightButtonDown = false;
    }
  });

  gridContainer.addEventListener('auxclick', (e) => {
    if (e.button === 1) { // Middle button
      handleChord(e);
    }
  });

  function handleChord(e) {
    if (gameOverFlag) return;

    const cell = e.target;
    if (cell.tagName !== 'DIV' || !cell.dataset.row || !cell.classList.contains('revealed')) return;

    const row = parseInt(cell.dataset.row);
    const col = parseInt(cell.dataset.col);
    const mines = countAdjacentMines(row, col);

    // Count flags around this cell
    let flags = 0;
    const adjacentCells = [];

    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        if (i === 0 && j === 0) continue;

        const newRow = row + i;
        const newCol = col + j;

        if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols) {
          const adjacentIndex = newRow * cols + newCol;
          const adjacentCell = cells[adjacentIndex];

          if (adjacentCell.getAttribute('data-flagged') === 'true') {
            flags++;
          } else if (!adjacentCell.classList.contains('revealed')) {
            adjacentCells.push(adjacentCell);
          }
        }
      }
    }

    // If flags match the number, reveal all unflagged adjacent cells
    if (flags === mines) {
      adjacentCells.forEach(adjacentCell => {
        revealCell(adjacentCell);
      });
    }
  }

  // Initialize the game board
  createGrid();
  updateMineCounter();
  updateTimer();
  
  // Add global mousedown handler to show surprise face when clicking anywhere in the window
  win.addEventListener('mousedown', (e) => {
    if (e.button === 0 && !gameOverFlag) { // Left button only
      // Only change to surprised face if not clicking on face button itself
      if (!e.target.closest('#face-button')) {
        faceImg.src = 'minesweeper-smile-surprise.png';
      }
    }
  });
  
  // Handle specific mousedown on the face button
  faceButton.addEventListener('mousedown', (e) => {
    if (e.button === 0 && !gameOverFlag) { // Left button only
      faceImg.src = 'minesweeper-smile-press.png';
      e.stopPropagation(); // Prevent window mousedown handler
    }
  });
  
  // Global mouseup to reset face
  document.addEventListener('mouseup', () => {
    if (!gameOverFlag) {
      faceImg.src = 'minesweeper-smile-normal.png';
    }
  });
  
  gridContainer.addEventListener('click', (e) => {
    if (gameOverFlag) return;
    
    const cell = e.target;
    if (cell.tagName !== 'DIV' || !cell.dataset.row) return;
    
    if (!firstClick) {
      firstClick = true;
      const row = parseInt(cell.dataset.row);
      const col = parseInt(cell.dataset.col);
      placeMines(row, col);
      startTimer();
    }
    
    revealCell(cell);
  });
  
  // Right click for flagging
  gridContainer.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    if (gameOverFlag) return;
    
    const cell = e.target;
    if (cell.tagName !== 'DIV' || !cell.dataset.row) return;
    // Do not flag revealed cells
    if (cell.classList.contains('revealed')) return;
    
    if (cell.getAttribute('data-flagged') === 'true') {
      cell.removeAttribute('data-flagged');
      cell.textContent = '';
      flaggedCount--;
    } else {
      cell.setAttribute('data-flagged', 'true');
      cell.textContent = "🚩";
      flaggedCount++;
    }
    
    updateMineCounter();
  });
  
  // Reset button click
  faceButton.addEventListener('click', () => {
    resetGame();
  });
}