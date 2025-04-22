export function openErrorWindow(message, randomPlacement = false) {
  // Play the error sound.
  const audio = new Audio("Windows XP Error Sound.mp3");
  audio.play();

  // Create content for the Error window with an error icon, message, and an OK button.
  const content = `
    <div class="window-content" style="padding: 10px; font-family: Tahoma, sans-serif; display: flex; align-items: center;">
      <img src="error.png" alt="Error Icon" style="width:50px; height:50px; margin-right: 10px;">
      <div style="flex-grow: 1; font-size: 14px;">${message}</div>
    </div>
    <div style="padding: 5px; text-align: right;">
      <button id="error-ok-btn" style="padding: 5px 10px; cursor: pointer;">OK</button>
    </div>
  `;

  // Temporarily set a global flag indicating whether the error window should be randomly placed.
  window.__errorRandomPlacement = randomPlacement;
  // Create the error window using the window manager (which will check the flag)
  const errWin = window.createWindow("Error", content);
  // Restore the previous flag value
  window.__errorRandomPlacement = false;

  errWin.style.height = '150px';

  // Attach event handler to the OK button to close the error window properly.
  const okBtn = errWin.querySelector("#error-ok-btn");
  if (okBtn) {
    okBtn.addEventListener("click", () => {
      const closeBtn = errWin.querySelector('button[aria-label="Close"]');
      if (closeBtn) {
        closeBtn.click();
      } else {
        errWin.remove();
      }
    });
  }
}