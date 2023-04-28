// # File: content.js
// # Software: ChatGPT-Bridge
// # Purpose: Provide third-party software with the capability to utilize ChatGPT.
// #
// # Copyright 2023 Tec-Net
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
let mostRecentMessagePollingIntervalId = null;
let config = null;
let connectionStatusValue = 'disconnected';
let ws = null
let firstPrompt = null;

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

function notifyConnectionStatus() {
    emitEvent(connectionStatusValue);
}

function startWebSocket() {

    ws = new WebSocket(`ws://127.0.0.1:${config.communicationPort}`);

    ws.addEventListener('message', (event) => {
        const output = event.data;
        sendFeedBack(output);
    });


    ws.addEventListener('open', (event) => {
        console.log('WebSocket connection opened:', event);
        connectionStatusValue = 'connected';
    });

    ws.addEventListener('error', (event) => {
        console.log('WebSocket error:', event);
        connectionStatusValue = 'disconnected';
        setTimeout(() => {
            startWebSocket();
        }, config.reconnectInterval);
    });

    ws.addEventListener('close', (event) => {
        console.log('WebSocket connection closed:', event);
        connectionStatusValue = 'disconnected';

        setTimeout(() => {
            startWebSocket();
        }, config.reconnectInterval);
    });
}

function startMonitoring( ) {
    if (!monitoringChat) {

        //If new chat session, start by send the configuration prompt
        if (!document.querySelector('div.group:nth-last-child(2) div.markdown.prose')) {
            sendFeedBack(firstPrompt);
        }

        monitoringChat = true;

        //reset message reading variables
        completeMessage = '';
        previousMessage = '';
        previousMessageTimestamp = 0;

        //Start Monitoring
        mostRecentMessagePollingIntervalId = setInterval(checkForNewCommands, config.pollingFrequency);   
    }
}

function stopMonitoring() {
    if (monitoringChat) {
        monitoringChat = false;
        clearInterval(mostRecentMessagePollingIntervalId);
    }
}

async function loadConfig() {
    try {
        const response = await fetch(chrome.runtime.getURL('config.json'));
        config = await response.json();
    } catch (error) {
        console.error('Error loading config:', error);
        
    }
}

async function loadfirstPrompt() {
    try {
        const response = await fetch(chrome.runtime.getURL('firstPrompt.txt'));
        firstPrompt = await response.text();
    } catch (error) {
        console.error('Error loading firstPrompt:', error);

    }
}




function emitEvent(name, detail = null) {
    const event = new CustomEvent(name, { detail });
    window.dispatchEvent(event);
}

function injectPopup() {
    const popupHtml = `
    <div id="popup-container" style="position: fixed; top: 0px; right: 10px; z-index: 9999; background-color: #f5f5f5; padding: 10px; border-radius: 5px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2); width: 130px;">
        <h2 id="topIcon"><i class="fas fa-chain-broken "></i> Bridge</h2>
        <button id="startButton" disabled><i class="fas fa-play"></i></button>        
    </div>`;

    const parser = new DOMParser();
    const popupDOM = parser.parseFromString(popupHtml, 'text/html');
    document.body.appendChild(popupDOM.querySelector('#popup-container'));

    // Inject the injected-popup.js script into the chat page
    const script = document.createElement('script');
    script.src = chrome.runtime.getURL('injected-popup.js');
    (document.head || document.documentElement).appendChild(script);

    //setupButtonListeners();

}

async function init() {
    await loadConfig();
    await loadfirstPrompt()
    injectPopup();
    startWebSocket();
    setInterval(notifyConnectionStatus, config.reconnectInterval);
}


/////////////////////////  Main Program  ///////////////////////////

window.addEventListener('startMonitoring', () => {
    startMonitoring();
});       


window.addEventListener('stopMonitoring', () => {
    stopMonitoring();
});




init();


