let lastCommand = '';
let previousMessage = '';
let previousMessageTimestamp = 0;

function checkForNewCommands() {
	
  const newMessage = document.querySelector('div.group:nth-last-child(2) div.markdown.prose').innerText;

// Continue reading the most  recent received message until it doesnt change during 4 seconds
  if (newMessage !== previousMessage) {
    previousMessage = newMessage;
    previousMessageTimestamp = Date.now();
  } else if (Date.now() - previousMessageTimestamp >= 3000) {
    if (newMessage !== lastCommand) {
      lastCommand = newMessage;
      console.log('Most recent received message:', lastCommand);
	  
     // Replace the following line with the appropriate code to find the chat input element
    // const chatInputElement = document.querySelector('#chatInput');
    // chatInputElement.value = command;
    // chatInputElement.dispatchEvent(new Event('submit'));
	
					//or 
					
	//Process the command and send the output back
	// Send the command to the background script
    //chrome.runtime.sendMessage({ command });
    }
  }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.start) {
    setInterval(checkForNewCommands, 1000);
    sendResponse({ message: 'Started monitoring chat' });
  }
});



