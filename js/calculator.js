export function initCalculator(win, showNotification) {
  // Disable maximize button immediately
  const maximizeBtn = win.querySelector('button[aria-label="Maximize"]');
  if (maximizeBtn) {
    maximizeBtn.disabled = true;
    maximizeBtn.style.opacity = "0.5";
    maximizeBtn.style.cursor = "not-allowed";
  }

  const container = win.querySelector('.window-content');
  container.innerHTML = `
    <div style="padding: 10px;">
      <!-- Display Box (full width) -->
      <input type="text" id="calc-display" style="text-align: right; margin-bottom: 10px; width: 100%" readonly>

      <!-- First row grid (adjusted for shorter buttons and correct left gap) -->
      <div style="display: grid; grid-template-columns: 32px 1fr 1fr 1fr; gap: 5px;">
        <div id="memory-indicator" style="border: 1px solid #888; display: flex; align-items: center; justify-content: center;"></div>
        <button class="calc-btn" style="color: #FF0000; grid-column: span 1;">Backspace</button>
        <button class="calc-btn" style="color: #FF0000; grid-column: span 1;">CE</button>
        <button class="calc-btn" style="color: #FF0000; grid-column: span 1;">C</button>
      </div>

      <!-- Spacer row (extra gap between first and other rows) -->
      <div style="height: 10px;"></div>

      <!-- Main calculator grid (adjusted column sizes) -->
      <div style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 5px;">
        <!-- Memory and number buttons grid -->
        <button class="calc-btn" style="color: #FF0000;">MC</button>
        <button class="calc-btn" style="color: #0000FF;">7</button>
        <button class="calc-btn" style="color: #0000FF;">8</button>
        <button class="calc-btn" style="color: #0000FF;">9</button>
        <button class="calc-btn" style="color: #FF0000;">/</button>
        <button class="calc-btn" style="color: #0000FF;">sqrt</button>

        <button class="calc-btn" style="color: #FF0000;">MR</button>
        <button class="calc-btn" style="color: #0000FF;">4</button>
        <button class="calc-btn" style="color: #0000FF;">5</button>
        <button class="calc-btn" style="color: #0000FF;">6</button>
        <button class="calc-btn" style="color: #FF0000;">*</button>
        <button class="calc-btn" style="color: #0000FF;">%</button>

        <button class="calc-btn" style="color: #FF0000;">MS</button>
        <button class="calc-btn" style="color: #0000FF;">1</button>
        <button class="calc-btn" style="color: #0000FF;">2</button>
        <button class="calc-btn" style="color: #0000FF;">3</button>
        <button class="calc-btn" style="color: #FF0000;">-</button>
        <button class="calc-btn" style="color: #0000FF;">1/x</button>

        <button class="calc-btn" style="color: #FF0000;">M+</button>
        <button class="calc-btn" style="color: #0000FF;">0</button>
        <button class="calc-btn" style="color: #0000FF;">+/-</button>
        <button class="calc-btn" style="color: #0000FF;">.</button>
        <button class="calc-btn" style="color: #FF0000;">+</button>
        <button class="calc-btn" style="color: #FF0000;">=</button>
      </div>
    </div>
  `;

  // Set the display value to "0" initially
  const display = container.querySelector('#calc-display');
  display.value = "0";

  win.style.width = "250px";
  win.style.height = "240px";

  // Get the display AFTER creating the HTML content
  const buttons = container.querySelectorAll('.calc-btn');
  const memoryIndicator = container.querySelector('#memory-indicator');

  let currentNumber = "0";
  let storedNumber = null;
  let currentOperation = null;
  let clearOnNextInput = false;
  let negativeInput = false;
  let memoryValue = 0;
  let lastNumber = null; // Store the last number for repeat operations

  function updateMemoryIndicator() {
    memoryIndicator.textContent = memoryValue !== 0 ? "M" : "";
  }

  function showError(message) {
    display.value = message;
    clearOnNextInput = true;
  }

  buttons.forEach(btn => {
    // Remove fixed width/height, let grid handle sizing
    btn.style.height = '25px';
    btn.style.padding = '0';
    btn.style.minWidth = '20px'; // still need minWidth to override the xp.css styling

    btn.addEventListener('click', () => {
      const buttonText = btn.textContent;

      // Handle memory operations
      if (buttonText === 'MC') {
        memoryValue = 0;
        updateMemoryIndicator();
        return;
      }
      if (buttonText === 'MR') {
        updateDisplay(memoryValue);
        clearOnNextInput = true;
        return;
      }
      if (buttonText === 'MS') {
        memoryValue = parseFloat(currentNumber);
        updateMemoryIndicator();
        return;
      }
      if (buttonText === 'M+') {
        memoryValue += parseFloat(currentNumber);
        updateMemoryIndicator();
        return;
      }

      // Handle special function buttons
      if (buttonText === 'sqrt') {
        const num = parseFloat(currentNumber);
        if (num >= 0) {
          updateDisplay(Math.sqrt(num));
          clearOnNextInput = true;
        } else {
          showError("Invalid input");
        }
        return;
      }

      if (buttonText === '%') {
        updateDisplay(parseFloat(currentNumber) / 100);
        clearOnNextInput = true;
        return;
      }

      if (buttonText === '1/x') {
        const num = parseFloat(currentNumber);
        if (num !== 0) {
          updateDisplay(1 / num);
          clearOnNextInput = true;
        } else {
          showError("Cannot divide by zero");
        }
        return;
      }

      if (buttonText === '+/-') {
        updateDisplay(-parseFloat(currentNumber));
        return;
      }

      if (buttonText === 'Backspace') {
        if (currentNumber.length > 1) {
          updateDisplay(currentNumber.slice(0, -1));
        } else {
          updateDisplay('0');
        }
        return;
      }

      if (buttonText === 'CE' || buttonText === 'C') {
        currentNumber = "0";
        if (buttonText === 'C') {
          storedNumber = null;
          currentOperation = null;
          lastNumber = null;  // Reset last number on Clear
        }
        clearOnNextInput = false;
        updateDisplay(currentNumber);
        return;
      }

      // Handle numbers and decimal
      if (!isNaN(buttonText) || buttonText === '.') {
        if (clearOnNextInput) {
          currentNumber = buttonText;
          clearOnNextInput = false;
        } else {
          if (buttonText === '.' && currentNumber.includes('.')) {
            return;
          }
          if (currentNumber === "0" && buttonText !== '.') {
            currentNumber = buttonText;
          } else {
            currentNumber += buttonText;
          }
        }
        display.value = currentNumber;
        return;
      }

      // Handle operations
      if (['+', '-', '*', '/'].includes(buttonText)) {
        if (storedNumber === null) {
          storedNumber = parseFloat(currentNumber);
        } else if (!clearOnNextInput) {
          storedNumber = calculate(storedNumber, parseFloat(currentNumber), currentOperation);
          if (storedNumber === null) return; // Error occurred in calculation
          display.value = storedNumber.toString();
        }
        currentOperation = buttonText;
        clearOnNextInput = true;
        return;
      }

      // Handle equals
      if (buttonText === '=') {
        const currentNum = parseFloat(currentNumber);
        if (storedNumber !== null && currentOperation !== null && !clearOnNextInput) {
          lastNumber = currentNum;  // Store the second number
          const result = calculate(storedNumber, currentNum, currentOperation);
          if (result === null) return; // Error occurred in calculation
          updateDisplay(result);
          storedNumber = result;
        } else if (storedNumber !== null && lastNumber !== null) {
          // Repeat the last operation
          const result = calculate(storedNumber, lastNumber, currentOperation);
          if (result === null) return; // Error occurred in calculation
          updateDisplay(result);
          storedNumber = result;
        }
        clearOnNextInput = true;
      }
    });
  });

  function updateDisplay(num) {
    currentNumber = num.toString();
    display.value = currentNumber;
  }

  function calculate(num1, num2, operation) {
    switch (operation) {
      case '+':
        return num1 + num2;
      case '-':
        return num1 - num2;
      case '*':
        return num1 * num2;
      case '/':
        if (num2 === 0) {
          showError("Cannot divide by zero");
          return null;
        }
        return num1 / num2;
      default:
        return num2;
    }
  }

  // Initialize memory indicator
  updateMemoryIndicator();
}