// # File: content.js
// # Software: ChatGPT-Bridge
// # Purpose: Provide third-party software with the capability to utilize ChatGPT.
// #
// # Copyright © 2023 Tec-Net
// #
// # Dual License Notice
// #
// # For Free Software Projects:
// # This software is licensed under the Apache License, Version 2.0;
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

let lastSentMessage = '';
let previousMessage = '';
let previousMessageTimestamp = 0;
let mostRecentMessagePollingIntervalId = null;
let reconnectionPollIntervalId = null;
let connectionStatusNotificationIntervalId = null;
let config = null;
let connectionStatus = 'connecting';
let ws = null
let firstPrompt = null;
let key = null ;
let isAuthenticated = false;

let textarea = document.querySelector('#prompt-textarea')

let sendButton = null; 

function getMostRecentMessage() {
    const messageElement = document.querySelector('article:last-of-type .markdown.prose');

    if (!messageElement) return;

    return messageElement.innerText.trim();

}

function checkForNewCommands() {
    if (!config) return;


    const currentMessage = getMostRecentMessage();
    console.log("new commands :" + currentMessage );
    // Continue reading the most recent received message until it doesn't change during the defined time
    if (currentMessage && (currentMessage !== previousMessage)) {

        //Streaming mode management: to test
        if (config.streamingMode) {
            const appendedMessage = currentMessage.slice(previousMessage.length).trim();
            //console.log(appendedMessage);
            sendMessageToWebSocketServer(appendedMessage);
        }

        //update current 
        previousMessage = currentMessage;
        previousMessageTimestamp = Date.now();

        // if (currentMessage == previousMessage) && waiting period reached
    } else if (Date.now() - previousMessageTimestamp >= config.messageCompletionTime && !config.streamingMode) {

        if (currentMessage && (currentMessage !== lastSentMessage)) {
            lastSentMessage = currentMessage;
            //console.log('Most recent received message:', completeMessage);
            sendMessageToWebSocketServer(lastSentMessage);
        }
    }
}

function adjustTextAreaHeight() {
    // Adjust the textarea height based on the content length
    const rows = Math.ceil((textarea.innerText.length) / 88);
    const height = rows * 24;
    textarea.height = height + 'px';
}

function AnswerChatGPT(text) 
{
    // Fetching the textarea and the sendButton with more specific selector
	textarea = document.querySelector('#prompt-textarea');

	// Focus on the textarea and simulate typing
	textarea.focus();
    setNativeValue(textarea,text);
	adjustTextAreaHeight();

    // click the send button when enabled
    clickSendButtonWhenEnabled();

    return ;
}

function clickSendButtonWhenEnabled()
{
    sendButton = document.querySelector('[data-testid="send-button"]');
    if(sendButton && !sendButton.disabled)
    {
        sendButton.click();
    }
    else
    {
        setTimeout(() => {
        
            clickSendButtonWhenEnabled();
        },50);
    }
    
}

function setNativeValue(element, text) {
    let lastValue = element.innerText;
    element.innerText = text;
    let event = new Event("input", { target: element, bubbles: true });
    // React 15
    event.simulated = true;
    // React 16-17
    let tracker = element._valueTracker;
    if (tracker) {
        tracker.setValue(lastValue);
    }
    element.dispatchEvent(event);
}


function isSendError()
{
    return (document.querySelector('form.stretch div.relative > div:first-child').textContent.trim() === 'There was an error generating a responseRegenerate response');
}

function notifyConnectionStatus() {
    emitEvent(connectionStatus);
}


function encryptStringAES(message, key) {
    const iv = CryptoJS.lib.WordArray.random(128/8); // generate a random initialization vector
    const encrypted = CryptoJS.AES.encrypt(message, CryptoJS.enc.Base64.parse(key), { 
        iv: iv, 
        mode: CryptoJS.mode.CBC 
    });

    // Concatenate the random IV and the cipher text, then convert to a base64 string
    const encryptedMessage = CryptoJS.enc.Base64.stringify(iv.concat(encrypted.ciphertext));
    return encryptedMessage;
}

function extractKey(str) {
    const regex = /^KEY:(.*)$/;
    const match = str.match(regex);
    
    if (match && match.length === 2) {
      return match[1];
    }
    
    return null;
  }

  
function connectWebSocket() {
    if (connectionStatus != 'disconnected') {
        // Check if the WebSocket is already connected before creating a new connection
        if (ws &&(ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) ){
            console.log("connectWebSocket : already connected or connecting !");
            return;
        }

        ws = new WebSocket(`ws://127.0.0.1:${config.communicationPort}`);

        ws.addEventListener('message', (event) => {

            const output = event.data;
            
            if(config.authenticationNeeded && !isAuthenticated)
            {
                tempKey = extractKey(output);

                if(tempKey != null)
                {
                    console.log("New Key receiced : "+ tempKey);
                    key = tempKey;
                    save('funKey', key);

                }
                else if(key!= null)
                {
                    console.log("Authentication question received. Sending Answer");
                    ws.send( encryptStringAES(CryptoJS.SHA256(output).toString(),key));
                   
                }
                else
                {
                    console.error("not authentified, authentication needed, but key value is "+key);
                }

                if(key!= null)
                {
                    isAuthenticated = true;

                    if (connectionStatus != 'disconnected') {
                        connectionStatus = 'connected';
                    }   
                }
                
            }
            else
            {
                console.log("New message received :", output);
                AnswerChatGPT(output);
            }
        });

        ws.addEventListener('open', (event) => {
            if( !config.authenticationNeeded && (connectionStatus != 'disconnected') )
            {
                connectionStatus = 'connected';
            }
        });

        ws.addEventListener('error', (event) => {
            if (connectionStatus != 'disconnected') {
                connectionStatus = 'connecting';
                setTimeout(() => {
                    connectWebSocket();
                }, config.reconnectInterval);
            }
        });

        ws.addEventListener('close', (event) => {
            isAuthenticated = false;
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
    try 
    {
        const storedConfig = await getStored('config');
        if (storedConfig) 
        {
            config = storedConfig;
        } else 
        {
            const response = await fetch(chrome.runtime.getURL('config.json'));
            config = await response.json();
            await save('config',config); // Save the default config to local storage
        }
    }
    catch (error) 
    {
        console.error('Error loading config:', error);
    }
}


async function load(itemName, variable, defaultValue) 
{
    try 
    {
        const temp = await getStored(itemName);
        console.log("getStored("+itemName+") returned :", temp);
        if (temp) 
        {
            return temp;
        } 
        else
        { 
            if (defaultValue) 
            {
                await save(itemName,defaultValue); // Save the default config to local storage
            }

            return defaultValue;
        }
    } 
    catch (error) 
    {
        console.error('Error loading config:', error);
        if (defaultValue) 
        {
            await save(itemName,defaultValue); // Save the default config to local storage
        }
        
        return defaultValue;
    }
}


function getStored(itemName) {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(itemName, (result) => {
            if (chrome.runtime.lastError) {
                console.error('Error retrieving '+ itemName + ' :', chrome.runtime.lastError);
                reject(chrome.runtime.lastError);
            } else {
                console.log( itemName + " loaded: "+ result[itemName]);
                resolve(result[itemName]);
            }
        });
    });
}

function save(itemName, item ) {
    return new Promise((resolve, reject) => {
        chrome.storage.local.set({ [itemName] : item }, () => {
            if (chrome.runtime.lastError) {
                console.error('Error saving ' + itemName +' :', chrome.runtime.lastError);
                reject(chrome.runtime.lastError);
            } else {
                console.log(itemName + ' saved successfully as' + item);
                resolve();
            }
        });
    });
}

async function loadTimestamps() {
    try {
        const temp = await getStored('timestamps')

        if (temp) {
 
            timestamps = temp;

        }
    } catch (error) {
        console.error('Error loading timestamps:', error);
    }

    if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
    }
}

function saveTimestamps(timestamps) {
    return save('timestamps', timestamps);
}



async function loadfirstPrompt() {
    try {
        const response = await fetch(chrome.runtime.getURL('firstPrompt.txt'));
        firstPrompt = await response.text();
    } catch (error) {
        //console.error('Error loading firstPrompt:', error);
        if (chrome.runtime.lastError) {
            console.error('Error retrieving config:', chrome.runtime.lastError);
            reject(chrome.runtime.lastError);
        } 

    }

    
}

function emitEvent(name, detail = null) {
    const event = new CustomEvent(name, { detail });
    window.dispatchEvent(event);
}

function loadFontAwesomeCSS() {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = chrome.runtime.getURL('./assets/css/all.min.css');
    document.head.appendChild(link);
}

function injectPopup() {
    // Load Font Awesome CSS before injecting popup
    loadFontAwesomeCSS();

    const popupHtml = `
    <script src="https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.0.0/crypto-js.min.js"></script>

    <div id="popup-container" style="position: fixed; top: 0px; right: 10px; z-index: 9999; background-color: #f5f5f5; padding: 10px; border-radius: 5px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);  width: 140px;">
        <div style="display: flex; align-items: stretch; justify-content: space-between;">
            <div style="display: flex; flex-direction: column; justify-content: center; border: 1px solid #ccc; border-radius: 5px; padding: 5px; background-color: #e0e0e0;">
                <h2 id="topIcon" style="margin: 0;"><i class="fas fa-chain-broken"></i> Bridge</h2>
                <button id="startButton" style="margin-top: 5px;"><i class="fas fa-play"></i></button>
            </div>
            
            <div id="countdown-container" style="display: none; flex-direction: column; justify-content: center; border: 1px solid #ccc; border-radius: 5px; padding: 5px; background-color: #e0e0e0;">
                <div>
                    <h2 id="countDown" style="margin-right: 5px; margin-left: 5px;  display: inline;">25</h2>
                    <small id="countDownMessage" style="font-size: 9px;"></small>
                </div>
                <div>
                    <small id="timerCountDown" style="font-size: 13px;"> 00h:0min</small>
                </div>
            </div>
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
const MAX_ALLOWED_MESSAGES_CREDIT= 25;
let allowedMessagesCount = MAX_ALLOWED_MESSAGES_CREDIT;
let timestamps = [];
 const timeLimit = 3 * 60 * 60 * 1000; // 3 hours in milliseconds


async function updateTimestamps(addNewStamps) {

    if ( await updatePendingMessagesCredit(addNewStamps))
    {
        save('timestamps',timestamps);

        timeCountDown = -1;

        if(timestamps.length > 0)
        {
            const now = new Date().getTime();
            timeCountDown = timeLimit - (now - timestamps[0])+ 1000;
        }
        emitEvent('newCountDown', { 'countDown': MAX_ALLOWED_MESSAGES_CREDIT - timestamps.length,'timerCounDown': timeCountDown  });
    }
}

async function updatePendingMessagesCredit(addNewStamps) {

    const now = new Date().getTime();
    let timestampsChanged = false;

    if (addNewStamps && (timestamps.length<MAX_ALLOWED_MESSAGES_CREDIT))
    {
        await loadTimestamps();
        timestamps.push(now);
        timestampsChanged = true;
    }

   
    // Remove debited message
    while (timestamps.length > 0 && (now - timestamps[0]) > timeLimit) {
        
        if(!timestampsChanged)
        {
            loadTimestamps();
        }
        timestamps.shift();
        timestampsChanged = true;
    }


    // Planify the next Check
    if (timestamps.length > 0) {

        const nextMessageWindow = timeLimit - (now - timestamps[0]) + 1000;

        setTimeout(() => {
            updateTimestamps(false);
        }, nextMessageWindow );
        console.log('Next check planned in :',nextMessageWindow);
    }
    return timestampsChanged;
   
}

async function onFeedbackSent() {
    if ( !isSendError() ) {
        lastSentMessage = '';
        if(isGPT4() )
        {
            //console.log('GPT 4 feedbacksent');        
        await updateTimestamps(true);
        }        
    }
}



//////////////////////////////////////// server messages management /////////////////////////////////////////////

function sendMessageToWebSocketServer(message) {
    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(message);
    } else {
        //console.log('WebSocket is not connected or not in the open state.');
    }
}

function isNewChatPage()
{
    //  true if no  answer received yet
    let isNew = (!document.querySelector('div.group:nth-last-child(2) div.markdown.prose'))
    if(isNew)
    {
        // for each new session check the status of the account
        updateGPT_PlusAccountStatus()
    }
    return isNew;
}
function startSendingFeedback() {
       

    //If new chat session, start by send the configuration prompt
    if (isNewChatPage()) {

        if(firstPrompt)
        {
            AnswerChatGPT(firstPrompt);
        }
        else
        {
            sendMessageToWebSocketServer("_START_NEW");
        }
        
    }
    startMonitoringReceivedMessages();
}

function stopSendingFeedback() {
   
    stopMonitoringReceivedMessages();

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

let isChatGPT_PlusAccount = false
function updateGPT_PlusAccountStatus()
{
    if(document.querySelector('span.bg-yellow-200.text-yellow-900.py-0\\.5.px-1\\.5.text-xs.md\\:text-sm.rounded-md.uppercase'))
    {
        isChatGPT_PlusAccount = true;
    }
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
        titleElement = document.querySelector('div[class*="dark\\:text-gray-300"]');
    }
    if(!titleElement)
    {
        return false;
    }    
    
    const regex = new RegExp(`\\b${'GPT-4'}\\b`, 'i');
    return regex.test(titleElement.innerText);
   
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
    //console.log(' content.js: stopSendingFeedback received ');
    stopSendingFeedback();
});

window.addEventListener('disconnect', () => {
    //console.log(' content.js: disconnect received ');
    disconnectServer();
});

window.addEventListener('connect', () => {
    //console.log(' content.js: connect received ');
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
                    //console.log('False Enter detected');
                } else {
                    
                    // The Enter keypress was considered as validation, continue with your onFeedbackSent() function
                    onFeedbackSent();
                }
            }, config.messageCompletionTime-500);
        }
    }
});

// Attaching the event listener to the document
document.addEventListener('click', (event) => {
    // Check if the clicked element (or any of its ancestors) matches the condition
    if (isSendButton(event.target)) {
        setTimeout(() => {
            onFeedbackSent();
        },config.messageCompletionTime-500);
    }
});

// Add an event listener for the 'message' event
window.addEventListener('message', (event) => {
    // Check if the message is of type 'popupReady'
    if (event.data && event.data.type === 'popupReady') {
        onPopupReady();
    }
});

function stopMonitoringReceivedMessages()
{
    sendMessageToWebSocketServer("_STOP_");
    clearInterval( mostRecentMessagePollingIntervalId);

}

function startMonitoringReceivedMessages()
{
    lastSentMessage = '';
    previousMessage = '';
    previousMessageTimestamp = 0;

    if (mostRecentMessagePollingIntervalId) {
        clearInterval(mostRecentMessagePollingIntervalId);
      }

    mostRecentMessagePollingIntervalId = setInterval(checkForNewCommands, config.pollingFrequency);
}


async function init() {
    await loadConfig();
    await loadfirstPrompt();
    key = await load('funKey', key, null)
    console.log("loaded key : " + key);
    injectPopup();
 

    //Start Monitoring
    connectToServer();
    await loadTimestamps();
    await updateTimestamps(false);
    //startMonitoringReceivedMessages();
    // Wait for the popup to be ready before emitting the event
        document.addEventListener('popupReady', function() {
            if( isGPT4() || timestamps.length >0) {
                const now = new Date().getTime();
                emitEvent('newCountDown', { 'countDown': MAX_ALLOWED_MESSAGES_CREDIT - timestamps.length,'timerCounDown':timeLimit - ( now - timestamps[0])+ 1000 });
            }
        });

    
}

init();