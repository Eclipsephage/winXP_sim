export async function initAIM(win, showNotification) { 
  // Play the AIM open sound when the window opens
  const openSound = new Audio("AIM-open.mp3");
  openSound.play().catch(err => {
    console.warn('Could not play AIM open sound:', err);
  });

  const container = win.querySelector('.window-content');
  container.innerHTML = "";

  // Create chat display area with pure white background and black border
  const chatArea = document.createElement('div');
  chatArea.style.height = "calc(100% - 112px)";
  chatArea.style.overflowY = "auto";
  chatArea.style.padding = "10px";
  chatArea.style.backgroundColor = "#ffffff";
  chatArea.style.fontFamily = "Times New Roman, serif";
  chatArea.style.fontSize = "16px";
  chatArea.style.borderLeft = "1px solid black";
  chatArea.style.borderTop = "1px solid black";
  container.appendChild(chatArea);

  // Create input container for message input and send button with new layout
  const inputContainer = document.createElement('div');
  inputContainer.style.display = "flex";
  inputContainer.style.flexDirection = "column";
  inputContainer.style.paddingTop = "5px";
  inputContainer.style.paddingBottom = "5px";
  inputContainer.style.height = "80px";
  container.appendChild(inputContainer);

  // Wrap the textarea in its own div for border control
  const textareaWrapper = document.createElement('div');
  textareaWrapper.style.borderLeft = "1px solid black";
  textareaWrapper.style.borderTop = "1px solid black";
  textareaWrapper.style.flexGrow = "1";

  const chatInput = document.createElement('textarea');
  chatInput.style.width = "100%";
  chatInput.style.height = "100%";
  chatInput.style.resize = "none";
  chatInput.style.fontFamily = "Times New Roman, serif";
  chatInput.style.fontSize = "16px";
  chatInput.style.border = "none";
  chatInput.style.padding = "5px";
  chatInput.style.boxSizing = "border-box";
  textareaWrapper.appendChild(chatInput);
  inputContainer.appendChild(textareaWrapper);

  const sendBtn = document.createElement('button');
  sendBtn.textContent = "Send";
  sendBtn.style.padding = "5px 10px";
  sendBtn.style.alignSelf = "flex-end";
  sendBtn.style.width = "100px";
  sendBtn.style.marginTop = "5px";
  inputContainer.appendChild(sendBtn);

  // --- Initialize WebsimSocket connection for chat ---
  const room = new WebsimSocket();
  await room.initialize(); // Wait for initialization

  let lastProcessedMessageKey = null; // Track the last message key processed
  let initialMessagesLoaded = false; // Flag to track initial message load

  // Function to display a single message
  function displayMessage(key, messageData, isInitialLoad = false) {
      const msgElem = document.createElement('div');
      msgElem.style.marginBottom = "5px";

      const username = document.createElement('span');
      // Use the username directly from messageData, fallback to fetching if needed (though unlikely with this structure)
      username.textContent = (messageData.username || 'Unknown') + ": ";
      username.style.color = (messageData.clientId === room.clientId) ? '#FF0000' : '#0000FF';
      username.style.fontWeight = 'bold';

      const message = document.createElement('span');
      message.textContent = messageData.message;

      msgElem.appendChild(username);
      msgElem.appendChild(message);
      chatArea.appendChild(msgElem);

      // Scroll to bottom only if user is already near the bottom
      const isScrolledToBottom = chatArea.scrollHeight - chatArea.clientHeight <= chatArea.scrollTop + 10;
      if (isScrolledToBottom) {
          chatArea.scrollTop = chatArea.scrollHeight;
      }

      // Play sound for incoming messages ONLY if they are new (not initial load)
      if (!isInitialLoad && messageData.clientId !== room.clientId) {
        const receiveSound = new Audio("AIM-message-receive.mp3");
        receiveSound.play().catch(err => {
          console.warn('Could not play receive sound:', err);
        });
      }
  }

  // Function to process and display messages from roomState
  function processMessages(messages, isInitialLoad = false) {
      if (!messages) return;

      // Get message keys and sort them chronologically (using timestamp prefix)
      const sortedKeys = Object.keys(messages).sort();

      // Find the index of the last processed message key
      const startIndex = lastProcessedMessageKey ? sortedKeys.indexOf(lastProcessedMessageKey) + 1 : 0;

      // Display new messages
      for (let i = startIndex; i < sortedKeys.length; i++) {
          const key = sortedKeys[i];
          displayMessage(key, messages[key], isInitialLoad);
      }

      // Update the last processed message key if new messages were processed
      if (sortedKeys.length > 0) {
          lastProcessedMessageKey = sortedKeys[sortedKeys.length - 1];
      }
  }

  // --- Handle initial state and updates ---
  // Process initial messages without playing sounds
  if (room.roomState && room.roomState.messages) {
      processMessages(room.roomState.messages, true); // Pass true for initial load
  }
  initialMessagesLoaded = true; // Set the flag after initial processing

  // Subscribe to room state updates
  const unsubscribeRoomState = room.subscribeRoomState((currentRoomState) => {
      if (currentRoomState && currentRoomState.messages) {
          processMessages(currentRoomState.messages, false); // Pass false for updates
      }
  });

  function sendMessage() {
    const text = chatInput.value.trim();
    if (text === "") return;

    // Play the send sound
    const sendSound = new Audio("AIM-message-send.mp3");
    sendSound.play().catch(err => {
      console.warn('Could not play send sound:', err);
    });

    // Create a unique key using timestamp and client ID
    const messageKey = `${Date.now()}_${room.clientId}`;
    const messageData = {
      clientId: room.clientId,
      username: room.peers[room.clientId]?.username || 'Anonymous',
      message: text
    };

    // Update room state with the new message
    room.updateRoomState({
      messages: {
        [messageKey]: messageData
      }
    });

    chatInput.value = "";
  }

  sendBtn.addEventListener("click", sendMessage);
  chatInput.addEventListener("keypress", (e) => {
    if(e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  showNotification("AIM Chat connected. You can now chat with other users!");

  const closeBtn = win.querySelector('button[aria-label="Close"]');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      openSound.pause();
      openSound.currentTime = 0;
      unsubscribeRoomState(); // Unsubscribe from room state updates on close
    });
  }
}