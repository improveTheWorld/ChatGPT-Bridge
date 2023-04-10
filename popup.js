document.addEventListener('DOMContentLoaded', () => {
  const startButton = document.querySelector('#startButton');
  const logElement = document.querySelector('#log');

  function logMessage(message) {
    logElement.textContent += message + '\n';
  }

  startButton.addEventListener('click', () => {
    logMessage('Start button clicked');
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { start: true }, (response) => {
        if (chrome.runtime.lastError) {
          logMessage('Error: ' + chrome.runtime.lastError.message);
        } else {
          logMessage(response.message);
        }
      });
    });
  });
});
