// # File: popup.js
// # Software: ChatGPT Bridge
// # Purpose: Provide third-party software with the capability to utilize ChatGPT.
// #
// # Copyright 2023 B.GATRI
// #
// # Dual License Notice
// #
// # For Free Software Projects:
// # This software is licensed under the Apache License, Version 2.0 (the "License");
// # you may not use this file except in compliance with the License.
// # You may obtain a copy of the License at
// #
// #     http://www.apache.org/licenses/LICENSE-2.0
// #
// # For Non-Free Software Projects:
// # This software requires a commercial license. Please contact the author at
// # bilelgatri@gmail.com to discuss licensing terms and pricing.
// #
// # Unless required by applicable law or agreed to in writing, software
// # distributed under the License is distributed on an "AS IS" BASIS,
// # WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// # See the License for the specific language governing permissions and
// # limitations under the License.
(async () => {
  const startStopButton = document.querySelector('#startButton');
  //const logElement = document.querySelector('#log');
  let monitoring = false;
  let connectionStatus = 'connecting';

  function logMessage(message) {
      //logElement.textContent += message + '\n';
      console.log('LOG:' + message)
  }

 
  function updateButtonState() {
      logMessage('Status : Connection ='+connectionStatus+', Monitoring ='+monitoring);
      if (connectionStatus === 'connected') {
          if (monitoring) {
              startStopButton.innerHTML = '<i class="fas fa-play"></i> Stop';
          } else {
              startStopButton.innerHTML = '<i class="fas fa-play"></i> Start';
          }
          startStopButton.disabled = false;
      } else {
          startStopButton.innerHTML = '<i class="fas fa-play"></i> Connecting...';
          startStopButton.disabled = true;
      }
  }

  ////////////////////////////////////// Main  ///////////////////////////////////
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.connectionStatus) {
          connectionStatus = request.connectionStatus;
          updateButtonState();
          sendResponse('StartStopButton Updated');
      }
  });

  // document.addEventListener('DOMContentLoaded', () => {
      startStopButton.addEventListener('click', () => {
          monitoring = !monitoring;
          updateButtonState();
          if (monitoring) {
              chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                  chrome.tabs.sendMessage(tabs[0].id, { start: true }, (response) => {
                      if (chrome.runtime.lastError) {
                          logMessage('Error: ' + chrome.runtime.lastError.message);
                      } else {
                          logMessage(response.message);
                      }
                  });
              });
          } else {
              chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                  chrome.tabs.sendMessage(tabs[0].id, { stop: true }, (response) => {
                      if (chrome.runtime.lastError) {
                          logMessage('Error: ' + chrome.runtime.lastError.message);
                      } else {
                          logMessage(response.message);
                      }
                  });
              });
          }
      });
  // });


  // Add these lines to the existing popup.js to handle automatic start when the chat page is loaded
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0].url.startsWith('https://chat.openai.com/*')) {
          startStopButton.click();
      }
  });

  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      if (changeInfo.status === 'complete' && tab.url.startsWith('https://chat.openai.com/*')) {
          startStopButton.click();
      }
  });

  // Load font-awesome icons
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.1.0/css/all.min.css';
  document.head.appendChild(link);
})();

