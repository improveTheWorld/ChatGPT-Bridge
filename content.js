let lastCommand = '';

function checkForNewCommands() {
	
  const lastMessageElement = document.querySelector('#__next > div.overflow-hidden.w-full.h-full.relative.flex > div > main > div.flex-1.overflow-hidden > div > div > div > div:nth-last-child(2) > div > div.relative.flex.w-\\[calc\\(100\\%-50px\\)\\].flex-col.gap-1.md\\:gap-3.lg\\:w-\\[calc\\(100\\%-115px\\)\\] > div.flex.flex-grow.flex-col.gap-3 > div > div > p');
  console.log('Testing');
  
  if (lastMessageElement && lastMessageElement.textContent !== lastCommand) {
    lastCommand = lastMessageElement.textContent;
    console.log('New command:', lastCommand);
	
	
     //document.querySelector('#__next > div.overflow-hidden.w-full.h-full.relative.flex > div > main > div.flex-1.overflow-hidden > div > div > div > div:nth-child(13) > div > div.relative.flex.w-\[calc\(100\%-50px\)\].flex-col.gap-1.md\:gap-3.lg\:w-\[calc\(100\%-115px\)\] > div.flex.flex-grow.flex-col.gap-3 > div > div > p')
	 //document.querySelector('#__next > div.overflow-hidden.w-full.h-full.relative.flex > div > main > div.absolute.bottom-0.left-0.w-full.border-t.md\:border-t-0.dark\:border-white\/20.md\:border-transparent.md\:dark\:border-transparent.md\:bg-vert-light-gradient.bg-white.dark\:bg-gray-800.md\:\!bg-transparent.dark\:md\:bg-vert-dark-gradient.pt-2 > form > div > div.flex.flex-col.w-full.py-2.flex-grow.md\:py-3.md\:pl-4.relative.border.border-black\/10.bg-white.dark\:border-gray-900\/50.dark\:text-white.dark\:bg-gray-700.rounded-md.shadow-\[0_0_10px_rgba\(0\,0\,0\,0\.10\)\].dark\:shadow-\[0_0_15px_rgba\(0\,0\,0\,0\.10\)\] > textarea');
	//#__next > div.overflow-hidden.w-full.h-full.relative.flex > div > main > div.absolute.bottom-0.left-0.w-full.border-t.md\:border-t-0.dark\:border-white\/20.md\:border-transparent.md\:dark\:border-transparent.md\:bg-vert-light-gradient.bg-white.dark\:bg-gray-800.md\:\!bg-transparent.dark\:md\:bg-vert-dark-gradient.pt-2 > form > div > div.flex.flex-col.w-full.py-2.flex-grow.md\:py-3.md\:pl-4.relative.border.border-black\/10.bg-white.dark\:border-gray-900\/50.dark\:text-white.dark\:bg-gray-700.rounded-md.shadow-\[0_0_10px_rgba\(0\,0\,0\,0\.10\)\].dark\:shadow-\[0_0_15px_rgba\(0\,0\,0\,0\.10\)\] > textarea
	// Replace the following line with the appropriate code to find the chat input element
    // const chatInputElement = document.querySelector('#chatInput');
    // chatInputElement.value = command;
    // chatInputElement.dispatchEvent(new Event('submit'));
	
	//Process the command and send the output back
  }  

	
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.start) {
    setInterval(checkForNewCommands, 1000);
    sendResponse({ message: 'Started monitoring chat' });
	
	
  }
});



