let completeMessage = '';
let previousMessage = '';
let previousMessageTimestamp = 0;
let monitoringChat = false;
let intervalId = null;
let config = null;
let ws;

// Load config.json
fetch(chrome.runtime.getURL('config.json'))
  .then((response) => response.json())
  .then((loadedConfig) => {
    config = loadedConfig;
  })
  .catch((error) => {
    console.error('Error loading config:', error);
  });

function checkForNewCommands() {
  if (!config) return;

  const messageElement = document.querySelector('div.group:nth-last-child(2) div.markdown.prose');
  
  if (!messageElement) return;

  const newMessage = messageElement.innerText.trim();

  // Continue reading the most recent received message until it doesn't change during the defined time
  if (newMessage !== previousMessage) {
    if (config.streamingMode) {      
      appendedMessage = newMessage.slice(previousMessage.length).trim();
      console.log(appendedMessage);
      sendMessageToWebSocketServer(appendedMessage);

    }
    previousMessage = newMessage;
    previousMessageTimestamp = Date.now();
  } else if (Date.now() - previousMessageTimestamp >= config.messageCompletionTime && !config.streamingMode) {
    if (newMessage !== completeMessage) {
      completeMessage = newMessage;
      console.log('Most recent received message:', completeMessage);
      sendMessageToWebSocketServer(completeMessage);
    }
  }
}

function sendFeedBack(message) {
  const textarea = document.querySelector('textarea[placeholder="Send a message..."]');
  const sendButton = document.querySelector('textarea[placeholder="Send a message..."]').parentElement.parentElement.querySelector('button');

  if (!textarea || !sendButton) {
    console.error('Unable to find textarea or send button.');
    return;
  }

  textarea.value = message;

  // Trigger the input event to let the website know the textarea value has changed
  const inputEvent = new Event('input', { bubbles: true });
  textarea.dispatchEvent(inputEvent);

  // Check if the send button is active and click it
  if (!sendButton.hasAttribute('disabled')) {
    sendButton.click();
  } else {
    console.log("Send button is not active.");
  }
}

function sendMessageToWebSocketServer(message) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(message);
  } else {
    console.log('WebSocket is not connected or not in the open state.');
  }
}

function startWebSocket() {
  ws = new WebSocket('ws://127.0.0.1:8181');

  ws.addEventListener('message', (event) => {
    const output = event.data;
    sendFeedBack(output);
  });
  
  ws.addEventListener('open', (event) => {
    console.log('WebSocket connection opened:', event);
  });

  ws.addEventListener('close', (event) => {
    console.log('WebSocket connection closed:', event);
  });

  ws.addEventListener('error', (event) => {
    console.log('WebSocket error:', event);

  });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.start) {
    if (!monitoringChat) {
      monitoringChat = true;
      intervalId = setInterval(checkForNewCommands, config.pollingFrequency);
      startWebSocket();
      sendResponse({ message: 'Started monitoring chat' });
    } else {
      sendResponse({ message: 'Already monitoring chat' });
    }
  } else if (request.stop) {
    if (monitoringChat) {
      monitoringChat = false;
      clearInterval(intervalId);
      if (ws) {
        ws.close();
        ws = null;
      }
      sendResponse({ message: 'Stopped monitoring chat' });
    } else {
      sendResponse({ message: 'Not currently monitoring chat' });
    }
  }
});
