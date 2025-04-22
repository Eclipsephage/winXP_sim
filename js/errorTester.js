import { openErrorWindow } from "./errorWindow.js";

export function initErrorTester(win, showNotification) {
  const contentArea = win.querySelector('.window-content');
  contentArea.innerHTML = "";
  
  // Add a scary warning message at the top of the Error Takeover program
  const warning = document.createElement("p");
  warning.textContent = "WARNING: Proceeding with Error Takeover may trigger catastrophic system failures. Proceed at your own risk!";
  warning.style.color = "red";
  warning.style.fontWeight = "bold";
  warning.style.marginBottom = "10px";
  contentArea.appendChild(warning);

  // Create a container for the slider control and label
  const sliderContainer = document.createElement("div");
  sliderContainer.style.marginBottom = "10px";
  sliderContainer.style.display = "flex";
  sliderContainer.style.alignItems = "center";
  sliderContainer.style.gap = "10px";
  
  const sliderLabel = document.createElement("label");
  sliderLabel.textContent = "Error Speed:";
  sliderLabel.style.fontSize = "14px";
  
  const slider = document.createElement("input");
  slider.type = "range";
  slider.min = "200";
  slider.max = "2000";
  slider.value = "1000";
  slider.style.cursor = "pointer";
  
  const speedDisplay = document.createElement("span");
  speedDisplay.textContent = slider.value + " ms";
  speedDisplay.style.fontSize = "14px";
  
  slider.addEventListener("input", () => {
    speedDisplay.textContent = slider.value + " ms";
  });
  
  sliderContainer.appendChild(sliderLabel);
  sliderContainer.appendChild(slider);
  sliderContainer.appendChild(speedDisplay);
  contentArea.appendChild(sliderContainer);
  
  // Change the button text to "Start the Takeover"
  const btn = document.createElement("button");
  btn.textContent = "Start the Takeover";
  btn.style.padding = "10px 15px";
  btn.style.fontSize = "14px";
  btn.style.cursor = "pointer";
  
  // Array of random error messages for variety.
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
  
  let takeoverInterval = null;
  
  btn.addEventListener("click", () => {
    if (takeoverInterval !== null) return; // Prevent multiple intervals
    btn.disabled = true; // Disable the button after starting the takeover
    // Use the slider value as the interval delay.
    const delay = parseInt(slider.value);
    takeoverInterval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * errorMessages.length);
      const randomMessage = errorMessages[randomIndex];
      // For Error Takeover, spawn the error window at a random position.
      openErrorWindow(randomMessage, true);
    }, delay);
  });
  
  contentArea.appendChild(btn);
}