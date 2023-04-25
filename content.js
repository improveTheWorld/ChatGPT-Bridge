// # File: content.js
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

let completeMessage = '';
let previousMessage = '';
let previousMessageTimestamp = 0;
let monitoringChat = false;
let intervalId = null;
let config = null;
let ws;

const reconnectInterval = 1000;
//const statusConnection = document.createElement('p');

//statusConnection.style.display = 'none';

//document.body.appendChild(statusConnection);


async function loadConfig() {
    try {
        const response = await fetch(chrome.runtime.getURL('config.json'));
        config = await response.json();
    } catch (error) {
        console.error('Error loading config:', error);
    }
}

async function init() {
    await loadConfig();        
    startWebSocket();

}


// Load config.json
//fetch(chrome.runtime.getURL('config.json'))
//    .then((response) => response.json())
//    .then((loadedConfig) => {
//        config = loadedConfig;
//    })
//    .catch((error) => {
//        console.error('Error loading config:', error);
//    });

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
    // Find the textarea and send button
    const textarea = document.querySelector('textarea.w-full');
    const sendButton = document.querySelector('textarea.w-full').closest('div').querySelector('button');

    if (!textarea || !sendButton) {
        console.error('Unable to find textarea or send button.');
        return;
    }

    // Focus on the textarea
    textarea.focus();

    // Add the message to the textarea
    const existingText = textarea.value;
    if (!existingText) {
        textarea.value = message;
    } else {
        textarea.value = existingText + ' ' + message;
    }

    // Adjust the textarea height based on the content length
    const rows = Math.ceil((existingText.length + message.length) / 88);
    const height = rows * 24;
    textarea.style.height = height + 'px';

    // Enable the send button if it's disabled
    if (sendButton.hasAttribute('disabled')) {
        sendButton.removeAttribute('disabled');
    }

    // Click the send button after a delay
    setTimeout(() => {
        sendButton.click();
    }, config.feedbackDelay);

    //reset message reading variables
    completeMessage = '';
    previousMessage = '';
    previousMessageTimestamp = 0;
}

function sendMessageToWebSocketServer(message) {
    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(message);
    } else {
        console.log('WebSocket is not connected or not in the open state.');
    }
}


function updateConnectionStatus(status) {

    try {
        chrome.runtime.sendMessage({ connectionStatus: status }, (response) => {
            if (chrome.runtime.lastError) {
                console.log('Error sending message:', chrome.runtime.lastError);
                setTimeout(() => {
                    updateConnectionStatus(status);
                }, reconnectInterval);
                return;
            }
            else
            {
                console.log("response");
                
            }

        });
            if (chrome.runtime.lastError) {
                console.log('Error sending message1:', chrome.runtime.lastError);
                return;
            }

    } catch (error) {
       
        console.error('Retry updateConnectionStatus later');
    }
   
}

function startWebSocket() {

    ws = new WebSocket(`ws://127.0.0.1:${config.communicationPort}`);

    ws.addEventListener('message', (event) => {
        const output = event.data;
        sendFeedBack(output);
    });

    ws.addEventListener('open', (event) => {
        console.log('WebSocket connection opened:', event);
        updateConnectionStatus('connected');
        
    });

    ws.addEventListener('error', (event) => {
        console.log('WebSocket error:', event);
        updateConnectionStatus('disconnected');

        setTimeout(() => {
            startWebSocket();
        }, reconnectInterval);
    });

    ws.addEventListener('close', (event) => {
        console.log('WebSocket connection closed:', event);
        updateConnectionStatus('disconnected');

        setTimeout(() => {
            startWebSocket();
        }, reconnectInterval);
    });
}

function startMonitoring(sendResponse) {
    if (!monitoringChat) {
        monitoringChat = true;
        intervalId = setInterval(checkForNewCommands, config.pollingFrequency);
        sendResponse({ message: 'Started bridging chat' });
    } else {
        sendResponse({ message: 'Already bridging chat' });
    }
}

function stopMonitoring(sendResponse) {
    if (monitoringChat) {
        monitoringChat = false;
        clearInterval(intervalId);
        sendResponse({ message: 'Stopped bridging chat' });
    } else {
        sendResponse({ message: 'Not currently bridging chat' });
    }
}

/////////////////////////  Main Program  ///////////////////////////

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.start) {
        startMonitoring(sendResponse);
    } else if (request.stop) {
        stopMonitoring(sendResponse);
    }
});

init();


