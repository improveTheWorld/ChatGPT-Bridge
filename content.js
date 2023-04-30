// # File: content.js
// # Software: ChatGPT-Bridge
// # Purpose: Provide third-party software with the capability to utilize ChatGPT.
// #
// # Copyright@ 2023 Tec-Net
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
// # tecnet.paris@gmail.com to discuss licensing terms and pricing.
// #
// # Unless required by applicable law or agreed to in writing, software
// # distributed under the License is distributed on an "AS IS" BASIS,
// # WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// # See the License for the specific language governing permissions and
// # limitations under the License.

let completeMessage = '';
let previousMessage = '';
let previousMessageTimestamp = 0;
let sendingFeedback = false;
let mostRecentMessagePollingIntervalId = null;
let reconnectionPollIntervalId = null;
let connectionStatusNotificationIntervalId = null;
let config = null;
let connectionStatus = 'connecting';
let ws = null
let firstPrompt = null;
const MAX_ALLOWED_MESSAGES_CREDIT= 25;

const textarea = document.querySelector('textarea.w-full');
const sendButton = document.querySelector('textarea.w-full').closest('div').querySelector('button');

function getMostRecentMessage() {
    const messageElement = document.querySelector('div.group:nth-last-child(2) div.markdown.prose');

    if (!messageElement) return;

    return messageElement.innerText.trim();

}

function checkForNewCommands() {
    if (!config) return;


    const currentMessage = getMostRecentMessage();

    // Continue reading the most recent received message until it doesn't change during the defined time
    if (currentMessage && (currentMessage !== previousMessage)) {

        //Streaming mode management: to test
        if (config.streamingMode) {
            const appendedMessage = currentMessage.slice(previousMessage.length).trim();
            console.log(appendedMessage);
            sendMessageToWebSocketServer(appendedMessage);
        }

        //update current 
        previousMessage = currentMessage;
        previousMessageTimestamp = Date.now();

        // if (currentMessage == previousMessage) && waiting period reached
    } else if (Date.now() - previousMessageTimestamp >= config.messageCompletionTime && !config.streamingMode) {

        if (currentMessage !== completeMessage) {
            completeMessage = currentMessage;
            //console.log('Most recent received message:', completeMessage);
            sendMessageToWebSocketServer(completeMessage);
        }
    }
}

function adjustTextAreaHeight() {
    // Adjust the textarea height based on the content length
    const rows = Math.ceil((textarea.value.length) / 88);
    const height = rows * 24;
    textarea.style.height = height + 'px';
}

function sendFeedBack(message) {

    if (!textarea || !sendButton) {
        console.error('Unable to find textarea or send button.');
        return;
    }

    // Focus on the textarea
    textarea.focus();
    textarea.value = message;

    adjustTextAreaHeight();

    // Enable the send button if it's disabled
    if (sendButton.hasAttribute('disabled')) {
        sendButton.removeAttribute('disabled');
    }
    

    sendButton.click();

    //reset message reading variables
    completeMessage = '';
    previousMessage = '';
    previousMessageTimestamp = 0;
}


function notifyConnectionStatus() {
    emitEvent(connectionStatus);
}

function connectWebSocket() {

    if (connectionStatus != 'disconnected') {
        ws = new WebSocket(`ws://127.0.0.1:${config.communicationPort}`);

        ws.addEventListener('message', (event) => {
            const output = event.data;
            sendFeedBack(output);
        });


        ws.addEventListener('open', (event) => {
            console.log('WebSocket connection opened:', event);
            if (connectionStatus != 'disconnected') {
                connectionStatus = 'connected';
            }
        });

        ws.addEventListener('error', (event) => {
            console.log('WebSocket error:', event);
            if (connectionStatus != 'disconnected') {
                connectionStatus = 'connecting';
                setTimeout(() => {
                    connectWebSocket();
                }, config.reconnectInterval);
            }
        });

        ws.addEventListener('close', (event) => {
            console.log('WebSocket connection closed:', event);
            if (connectionStatus != 'disconnected') {
                connectionStatus = 'connecting';
                setTimeout(() => {
                    connectWebSocket();
                }, config.reconnectInterval);
            }
        });
    }
}

async function loadConfig() {
    try {
        const storedConfig = await getStoredConfig();

        if (storedConfig) {
            config = storedConfig;
        } else {
            const response = await fetch(chrome.runtime.getURL('config.json'));
            config = await response.json();
            await saveConfig(config); // Save the default config to local storage
        }
    } catch (error) {
        console.error('Error loading config:', error);
    }
}

function getStoredConfig() {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get('config', (result) => {
            if (chrome.runtime.lastError) {
                console.error('Error retrieving config:', chrome.runtime.lastError);
                reject(chrome.runtime.lastError);
            } else {
                resolve(result.config);
            }
        });
    });
}

function saveConfig(config) {
    return new Promise((resolve, reject) => {
        chrome.storage.local.set({ config }, () => {
            if (chrome.runtime.lastError) {
                console.error('Error saving config:', chrome.runtime.lastError);
                reject(chrome.runtime.lastError);
            } else {
                console.log('Config saved successfully.');
                resolve();
            }
        });
    });
}

async function loadTimestamps() {
    try {
        const storedTimestamps = await getStoredTimestamps();

        if (storedTimestamps) {
            timestamps = storedTimestamps;
        }
    } catch (error) {
        console.error('Error loading timestamps:', error);
    }
}

function getStoredTimestamps() {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get('timestamps', (result) => {
            if (chrome.runtime.lastError) {
                console.error('Error retrieving config:', chrome.runtime.lastError);
                reject(chrome.runtime.lastError);
            } else {
                resolve(result.timestamps);
            }
        });
    });
}

function saveTimestamps(timestamps) {
    return new Promise((resolve, reject) => {
        chrome.storage.local.set({ timestamps }, () => {
            if (chrome.runtime.lastError) {
                console.error('Error saving config:', chrome.runtime.lastError);
                reject(chrome.runtime.lastError);
            } else {
                console.log('timestamps saved successfully.');
                resolve();
            }
        });
    });
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
        <div style="display: flex; align-items: center;">
            <button id="startButton" style="margin-right: 30px;><i class="fas fa-play"></i></button>
            <h2 id="countDown" "></h2>
        </div>
    </div>`;

    const parser = new DOMParser();
    const popupDOM = parser.parseFromString(popupHtml, 'text/html');
    document.body.appendChild(popupDOM.querySelector('#popup-container'));

    // Inject the injected-popup.js script into the chat page
    const script = document.createElement('script');
    script.src = chrome.runtime.getURL('injected-popup.js');
    (document.head || document.documentElement).appendChild(script);

}



/////////////////////////////////////// countdown management /////////////////////////

let allowedMessagesCount = MAX_ALLOWED_MESSAGES_CREDIT;
let timestamps = [];
const timeLimit = 3 * 60 * 60 * 1000; // 3 hours in milliseconds

function updateAndNotifyAllowedMessages() {

    if (updatePendingMessagesCredit(true))
    {
        saveTimestamps(timestamps);
        
        emitEvent('newCountDown', { 'countDown': MAX_ALLOWED_MESSAGES_CREDIT - timestamps.length });
    }
}

function updatePendingMessagesCredit(newMessageStamps) {

    const now = new Date().getTime();
    let timestampsChanged = false;

    if (newMessageStamps && (timestamps.length<MAX_ALLOWED_MESSAGES_CREDIT))
    {
        timestamps.push(now);
        timestampsChanged = true;
    }

    // Remove debited message
    while (timestamps.length > 0 && (now - timestamps[0]) > timeLimit) {
        timestamps.shift();
        timestampsChanged = true;
    }


    // Planify the next Check
    if (timestamps.length > 0) {

        const nextMessageWindow = timeLimit - (now - timestamps[0]) + 1000;

        setTimeout(() => {
            updatePendingMessagesCredit(false);
        }, nextMessageWindow + 1000);
        console.log('Next check planned in :',nextMessageWindow);
    }
    return timestampsChanged;
   
}

function onFeedbackSent() {

    if ( isGPT4()) {
        console.log('GPT 4 feedbacksent');        
        updateAndNotifyAllowedMessages();
    }
}



//////////////////////////////////////// server messages management /////////////////////////////////////////////

function sendMessageToWebSocketServer(message) {
    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(message);
    } else {
        console.log('WebSocket is not connected or not in the open state.');
    }
}

function startSendingFeedback() {
    if (!sendingFeedback) {
        sendingFeedback = true;

        //If new chat session, start by send the configuration prompt
        if (!document.querySelector('div.group:nth-last-child(2) div.markdown.prose')) {
            sendFeedBack(firstPrompt);
        }

    }
}

function stopSendingFeedback() {
    if (sendingFeedback) {
        sendingFeedback = false;
    }
}

/////////////////////////  Server connection Management   ///////////////////////////


function disconnectServer() {
    clearInterval(connectionStatusNotificationIntervalId);
    connectionStatus = 'disconnected';
    if (ws && (ws.readyState !== WebSocket.CLOSED) && (ws.readyState !== WebSocket.CLOSING)) {
        ws.close();
    }
}

function connectToServer() {
    connectionStatus = 'connecting';
    connectWebSocket();
    connectionStatusNotificationIntervalId = setInterval(notifyConnectionStatus, config.reconnectInterval);
}

function isGPT4()
{
    //when the chat page is just loaded
    let titleElement = document.querySelector('.truncate > span.flex.h-6.items-center.gap-1.truncate');
    if(!titleElement){
        titleElement = document.querySelector('.flex.w-full.items-center.justify-center.gap-1.border-b');
    }
    if(!titleElement)
    {
        return false;
    }    
    
    const regex = new RegExp(`\\b${'GPT-4'}\\b`, 'i');
    GPT4found = regex.test(titleElement.innerText);
    if(GPT4found)
    {
        console.log('I find GPT-4 in ', titleElement.innerText)
    }
    else{
        console.log('Cant to find GPT-4 in ', titleElement.innerText)
    }

    return GPT4found;
}




// Helper function to check if an element or any of its ancestors matches the condition
function isSendButton(element) {
    while (element) {
        if (
            element.tagName === 'BUTTON' &&
            element.parentElement.querySelector('textarea.w-full') !== null
        ) {
            return true;
        }
        element = element.parentElement;
    }
    return false;
}

// Helper function to check if an element or any of its ancestors is the desired textarea
function isTextArea(element) {
    while (element) {
        if (
            element.tagName === 'TEXTAREA' &&
            element.classList.contains('w-full')
        ) {
            return true;
        }
        element = element.parentElement;
    }
    return false;
}


/////////////////////////  Main Program  ///////////////////////////

window.addEventListener('startSendingFeedback', () => {
    console.log(' content.js: startSendingFeedback received ');
    startSendingFeedback();
});


window.addEventListener('stopSendingFeedback', () => {
    console.log(' content.js: stopSendingFeedback received ');
    stopSendingFeedback();
});

window.addEventListener('disconnect', () => {
    console.log(' content.js: disconnect received ');
    disconnectServer();
});

window.addEventListener('connect', () => {
    console.log(' content.js: connect received ');
    connectToServer();
});



//Attaching the event listener to the document
document.addEventListener('keydown', (event) => {
    // Check if the event target (or any of its ancestors) is the desired textarea
    if (isTextArea(event.target)) {
        // Check if the Enter key was pressed
        if (event.key === 'Enter' ) {

            // Wait for a brief delay (e.g., 100 milliseconds)
            setTimeout(() => {
                // Check if the textarea still contains the text
                if (event.target.value !== '') {
                    // The Enter keypress was not considered as validation, handle the false Enter case here
                    console.log('False Enter detected');
                } else {
                    
                    // The Enter keypress was considered as validation, continue with your onFeedbackSent() function
                    onFeedbackSent();
                }
            }, 100);
        }
    }
});

// Attaching the event listener to the document
document.addEventListener('click', (event) => {
    // Check if the clicked element (or any of its ancestors) matches the condition
    if (isSendButton(event.target)) {
        onFeedbackSent();
    }
});

// Add an event listener for the 'message' event
window.addEventListener('message', (event) => {
    // Check if the message is of type 'popupReady'
    if (event.data && event.data.type === 'popupReady') {
        onPopupReady();
    }
});

async function init() {
    await loadConfig();
    await loadfirstPrompt();
    injectPopup();

    

    //Start Monitoring
    mostRecentMessagePollingIntervalId = setInterval(checkForNewCommands, config.pollingFrequency);
    connectToServer();
    await loadTimestamps();
    updatePendingMessagesCredit(false);

    // Wait for the popup to be ready before emitting the event
        document.addEventListener('popupReady', function() {
            if(isGPT4() || timestamps.length>0) {
                emitEvent('newCountDown', { 'countDown': MAX_ALLOWED_MESSAGES_CREDIT - timestamps.length });
            }
        });

    
}

init();

