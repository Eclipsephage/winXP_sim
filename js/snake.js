export function initSnake(win, showNotification) {
  // Use .window-content if available, otherwise fallback to .window-body
  const contentArea = win.querySelector('.window-content') || win.querySelector('.window-body');
  // Create a container that holds both canvas and controls
  const container = document.createElement('div');
  container.style.display = 'flex';
  container.style.flexDirection = 'column';
  container.style.alignItems = 'center';
  container.style.gap = '10px';
  container.style.padding = '5px';
  contentArea.innerHTML = '';
  contentArea.appendChild(container);

  // Create the canvas with a black background
  const canvas = document.createElement('canvas');
  canvas.id = "snake-canvas";
  canvas.width = 300;
  canvas.height = 300;
  canvas.style.border = '1px solid #000';
  canvas.style.backgroundColor = 'black';
  container.appendChild(canvas);

  const ctx = canvas.getContext('2d');

  // Create a score display element with black text
  const scoreContainer = document.createElement('div');
  scoreContainer.textContent = "Score: 0";
  scoreContainer.style.fontSize = '16px';
  scoreContainer.style.color = 'black'; 
  container.appendChild(scoreContainer);
  const scoreElement = scoreContainer.querySelector('#snake-score') || scoreContainer;

  // Create a Start button
  const startButton = document.createElement('button');
  startButton.id = "snake-start";
  startButton.textContent = "Start Game";
  container.appendChild(startButton);

  // Create the arrow control container with a responsive layout
  const controlsContainer = document.createElement('div');
  controlsContainer.style.display = 'grid';
  controlsContainer.style.gridTemplateAreas = `
    ". up ."
    "left . right"
    ". down ."
  `;
  controlsContainer.style.gridGap = '5px';
  controlsContainer.style.justifyContent = 'center';
  controlsContainer.style.alignItems = 'center';
  container.appendChild(controlsContainer);

  // Create Up button
  const upButton = document.createElement('button');
  upButton.id = "snake-up";
  upButton.textContent = "↑";
  upButton.style.gridArea = "up";
  controlsContainer.appendChild(upButton);

  // Create Left button
  const leftButton = document.createElement('button');
  leftButton.id = "snake-left";
  leftButton.textContent = "←";
  leftButton.style.gridArea = "left";
  controlsContainer.appendChild(leftButton);

  // Create Right button
  const rightButton = document.createElement('button');
  rightButton.id = "snake-right";
  rightButton.textContent = "→";
  rightButton.style.gridArea = "right";
  controlsContainer.appendChild(rightButton);

  // Create Down button
  const downButton = document.createElement('button');
  downButton.id = "snake-down";
  downButton.textContent = "↓";
  downButton.style.gridArea = "down";
  controlsContainer.appendChild(downButton);

  let snake = [{x: 150, y: 150}];
  let food = {x: 0, y: 0};
  let dx = 10, dy = 0, score = 0, gameLoop;

  function drawSnakePart(part) {
    ctx.fillStyle = 'green';
    ctx.fillRect(part.x, part.y, 10, 10);
  }
  function drawFood() {
    ctx.fillStyle = 'red';
    ctx.fillRect(food.x, food.y, 10, 10);
  }
  function moveSnake() {
    const head = {x: snake[0].x + dx, y: snake[0].y + dy};
    snake.unshift(head);
    if (head.x === food.x && head.y === food.y) {
      score++;
      scoreContainer.textContent = "Score: " + score;
      generateFood();
    } else {
      snake.pop();
    }
  }
  function generateFood() {
    food.x = Math.floor(Math.random() * 30) * 10;
    food.y = Math.floor(Math.random() * 30) * 10;
  }
  function gameOver() {
    clearInterval(gameLoop);
    // Draw game over text centered on the canvas
    ctx.fillStyle = 'white';
    ctx.font = '30px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2);
    startButton.disabled = false;
  }
  function checkCollision() {
    const head = snake[0];
    if (head.x < 0 || head.x >= canvas.width || head.y < 0 || head.y >= canvas.height) return true;
    for (let i = 1; i < snake.length; i++) {
      if (head.x === snake[i].x && head.y === snake[i].y) return true;
    }
    return false;
  }
  function gameStep() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Redraw black background in case clearRect resets it visually on some browsers
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawFood();
    moveSnake();
    snake.forEach(drawSnakePart);
    if (checkCollision()) gameOver();
  }
  window.addEventListener('keydown', (e) => {
    switch(e.key) {
      case 'ArrowUp': if (dy === 0) { dx = 0; dy = -10; } break;
      case 'ArrowDown': if (dy === 0) { dx = 0; dy = 10; } break;
      case 'ArrowLeft': if (dx === 0) { dx = -10; dy = 0; } break;
      case 'ArrowRight': if (dx === 0) { dx = 10; dy = 0; } break;
    }
  });
  startButton.addEventListener('click', () => {
    snake = [{x: 150, y: 150}];
    dx = 10; dy = 0; score = 0;
    scoreContainer.textContent = "Score: " + score;
    generateFood();
    if (gameLoop) clearInterval(gameLoop);
    gameLoop = setInterval(gameStep, 100);
    startButton.disabled = true;
  });
  upButton.addEventListener('click', () => { if (dy === 0) { dx = 0; dy = -10; } });
  downButton.addEventListener('click', () => { if (dy === 0) { dx = 0; dy = 10; } });
  leftButton.addEventListener('click', () => { if (dx === 0) { dx = -10; dy = 0; } });
  rightButton.addEventListener('click', () => { if (dx === 0) { dx = 10; dy = 0; } });
}