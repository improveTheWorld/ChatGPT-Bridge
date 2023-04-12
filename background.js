// # File: background.js
// # Software: ChatGPT Monitor
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

document.addEventListener('DOMContentLoaded', () => {
  const startButton = document.querySelector('#startButton');
  const stopButton = document.querySelector('#stopButton');
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

  stopButton.addEventListener('click', () => {
    logMessage('Stop button clicked');
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { stop: true }, (response) => {
        if (chrome.runtime.lastError) {
          logMessage('Error: ' + chrome.runtime.lastError.message);
        } else {
          logMessage(response.message);
        }
      });
    });
  });
});

chrome.runtime.onInstalled.addListener(() => {
  console.log('Chat Monitor extension installed');
});
