let lastCommand = '';
let previousMessage = '';
let previousMessageTimestamp = 0;
let monitoringChat = false;
let intervalId = null;
let config = null;

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

  const newMessage = document.querySelector('div.group:nth-last-child(2) div.markdown.prose').innerText.trim();

  // Continue reading the most recent received message until it doesn't change during the defined time
  if (newMessage !== previousMessage) {
    previousMessage = newMessage;
    previousMessageTimestamp = Date.now();
  } else if (Date.now() - previousMessageTimestamp >= config.messageCompleteTime) {
    if (newMessage !== lastCommand) {
      lastCommand = newMessage;
      console.log('Most recent received message:', lastCommand);
      sendFeedBack('needs more details');
    }
  }
}

function sendFeedBack(message) {
  const textarea = document.querySelector('textarea[placeholder="Send a message..."]');
  const sendButton = document.querySelector('textarea[placeholder="Send a message..."]').parentElement.parentElement.querySelector('button');

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



chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.start) {
    if (!monitoringChat) {
      monitoringChat = true;
      intervalId = setInterval(checkForNewCommands, config.pollingFrequency);
      sendResponse({ message: 'Started monitoring chat' });
    } else {
      sendResponse({ message: 'Already monitoring chat' });
    }
  } else if (request.stop) {
    if (monitoringChat) {
      monitoringChat = false;
      clearInterval(intervalId);
      sendResponse({ message: 'Stopped monitoring chat' });
    } else {
      sendResponse({ message: 'Not currently monitoring chat' });
    }
  }
});
