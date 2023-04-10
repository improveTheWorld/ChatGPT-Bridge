let lastCommand = '';
let previousMessage = '';
let previousMessageTimestamp = 0;

function checkForNewCommands() {
  const newMessage = document.querySelector('div.group:nth-last-child(2) div.markdown.prose').innerText.trim();

  // Continue reading the most recent received message until it doesn't change during 4 seconds
  if (newMessage !== previousMessage) {
    previousMessage = newMessage;
    previousMessageTimestamp = Date.now();
  } else if (Date.now() - previousMessageTimestamp >= 3000) {
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


// function sendFeedBack(message) {
  // const textarea = document.querySelector('textarea[placeholder="Send a message..."]');
  // const sendButton = document.querySelector('textarea[placeholder="Send a message..."]').parentElement.parentElement.querySelector('button');;

  // textarea.value = message;

  // // Trigger the input event to let the website know the textarea value has changed
  // const inputEvent = new Event('input', { bubbles: true });
  // textarea.dispatchEvent(inputEvent);

  // // Wait until the send button is active and click it
  // const checkSendButtonActive = setInterval(() => {
    // const activeSendButton = document.querySelector('button:not([disabled]):not([style*="display"])');
    // if (activeSendButton) {
      // activeSendButton.click();
      // clearInterval(checkSendButtonActive);
    // }
  // }, 100);
// }


// function sendFeedBack(message) {
  // const textarea = document.querySelector('textarea[placeholder="Send a message..."]');
  // const sendButton = document.querySelector('button[disabled]:not([style*="display"])');

  // textarea.value = message;

  // // Trigger the input event to let the website know the textarea value has changed
  // const inputEvent = new Event('input', { bubbles: true });
  // textarea.dispatchEvent(inputEvent);

  // // Observe the send button and click it when it becomes enabled
   // observeSendButton(sendButton, () => {
    // sendButton.click();
  // });
// }

// function observeSendButton(button, callback) {
  // const observer = new MutationObserver((mutations) => {
    // mutations.forEach((mutation) => {
      // if (mutation.type === 'attributes' && mutation.attributeName === 'disabled') {
        // if (!button.hasAttribute('disabled')) {
          // observer.disconnect();
          // callback();
        // }
      // }
    // });
  // });

  // observer.observe(button, { attributes: true });
// }

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.start) {
    setInterval(checkForNewCommands, 1000);
    sendResponse({ message: 'Started monitoring chat' });
  }
});
