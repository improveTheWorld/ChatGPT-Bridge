# Bridge V1.1.0

* New features:
  * Added a countdown for messages credit (as the cap is limited by OpenAI to 25 messages per 3 hours for the ChatGPT plus acounts when using GPT-4).
  * Display a timer management for the next message count credit refill
  * Move the fistPrompt text to the server side ( so assure future compatibities betwwen the firstPrompt and the implemented protocol on the server side)
* Fixed Issue:
  * Sometimes the input text element in the chat page has an enlarged size due to the amount of text entered. This makes it difficult to follow the most recent messages sent from GPT. Once the message is sent, it would be more comfortable to reset the input to its minimal size.
  * Fix Hungup when server connection is lost for a while.
  * Start/StopManagement desynhchronisation
