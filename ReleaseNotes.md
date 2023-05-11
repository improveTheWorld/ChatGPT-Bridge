# CHATGPT-Bridge V1.1.0

* New features:
  * Added a countdown for message credits (since OpenAI limits ChatGPT Plus accounts to 25 messages per 3 hours when using GPT-4).
  * Display a timer for managing the next message credit refill.
  * Moved the firstPrompt text to the server side to ensure future compatibility between the firstPrompt and the implemented protocol on the server side.
* Fixed Issue:
  * Sometimes the input text element on the chat page becomes enlarged due to the amount of text entered, making it difficult to follow the most recent messages sent from GPT. After a message is sent, the input should reset to its minimal size for greater comfort.
  * Fixed a hangup when the server connection is lost for a while.
  * Fixed desynchronization in start/stop management.
