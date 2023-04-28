# ![ChatGPT-Bridge Logo](./Images/Logo/logo.png) **ChatGPT-Bridge**

Tired of waiting for access to the GPT-4 API? Frustrated by the fees charged for using the GPT-API? We have the perfect solution for you!
-----------------------------------------------------------------------------------------------------------------------------------------

Introducing **ChatGPT-Driver**, a system comprised of two components: **ChatGPT-Bridge** (referred to as **"Bridge"**) and **[ChatGPT-Executor](https://github.com/improveTheWorld/ChatGPT-Executor)**  (referred to as **"Executor"**).
**Bridge** is a web browser plugin compatible with Microsoft Edge and Google Chrome. It offers API-like access to **ChatGPT**. When combined with **Executor** ( which  is a server application that receives and executes Windows commands), they unlock the full potential of ChatGPT without any waiting list or additional fees.

**Bridge** offers API-like access to GPT-3.5 and GPT-4 for third-party softwares via webSockets.
Bridge provides free API-like access to GPT-3.5. It Also provides free API-like access to GPT-4 if you have a ChatGPT Plus account.
**✨ 🎉🌟  No fees are charged for the use of the API-like access !**

To fully benefit from ChatGPT-Driver, install and set up both components

## 🎉 What's New in Version 1.0.0

- Upgraded from an experimental version to a stable release (v1.0.0)
- Improved performance and compatibility with Executor
- Streamlined setup and usage with clearer instructions
- Release of[Executor repository](https://github.com/improveTheWorld/ChatGPT-Executor.git) and source code.
- Improved graphical design and match more..

**Note:** While ChatGPT-Driver has been significantly improved and tested, there may still be potential bugs and limitations. We appreciate your understanding and welcome any feedback to help us enhance the system.

## 🌟 Features

- 🔗 Seamlessly connects ChatGPT with third-party software
- 🌐 Utilizes WebSocket for real-time communication
- 🤖 Supports both GPT-3.5 and GPT-4
- 🆓 Free API-like access to GPT-3.5 and GPT-4 with a ChatGPT Plus account
- 📚 Enable ChatGPT to read large files that exceed the size of a single prompt

## 🔧 Installation and Usage

To utilize ChatGPT-Driver, you'll need to install both the Bridge plugin and the Executor server application.

### ChatGPT-Bridge

Follow the instructions in the [Getting Started](https://github.com/improveTheWorld/ChatGPT-Bridge#getting-started) section to install the Bridge plugin.

### ChatGPT-Executor

1. Visit the [Executor GitHub Repository](https://github.com/improveTheWorld/ChatGPT-Executor) and follow the installation instructions.
2. Set up the Executor server application according to the provided documentation.

## 🚀 Getting Started

### Prerequisites

- Microsoft Edge or  Google Chrome browser
- Basic understanding of browser extensions

### Installation

1. Clone the repository:

   git clone https://github.com/improveTheWorld/ChatGPT-Bridge.git
2. Open your browser and navigate to extensions ( `edge://extensions` or `chrome://extensions` depending on your browser).
3. Enable "Developer Mode" in the top-right corner.
4. Click on "Load Unpacked" and select the `chatgpt-bridge` folder.
5. The ChatGPT-Bridge plugin should now be visible in the extensions list and ready for use!

## 🛠️ Usage

1. After installing the plugin, go to [ChatGPT](https://chat.openai.com/chat) website.
2. The bridge popup will be displayed at the top right corner of the webpage. You may move it using your mouse if needed.

* If the displayed popup is as below :
     ![Connecting.GIF](./Images/Usage/Connecting.GIF)

     ```
   You forgot to launch the Executor or your third-party software.
   Please lauch the Executor and wait until connection established.
     ```

     ---
* When connection is established, the  popup is as below :

   ![Start.GIF](./Images/Usage/Start.GIF)

     ```
   Start a new chat and then click the start button to begin bridging between your ChatGPT AI and the third party software ( the Executor)
     ```
     ```
   When you click start with a new chat page, the Bridge plugin will empty the first Prompt and send it. The first prompt is intended to teach CHATGPT the communication protocol to use with the Excutor. 
     ```
     ```
   Once ChatGPT get all the initil instruction, it will ask you tou for his first task. Assign him one and watch the magic working.
     ```
   
   As example of use, we asked chatgpt to troobleshoot our Wifi card. We had a issue that the windows network diagnostic tools was enable to detect. ChatGPT after tring different aproachs, using our chatGPT-Bridge system, was able to fix it for us. 
   

     ---



 * When you are done, and want to stop using the bridge, just click the stop button :
   ![Stop.GIF](./Images/Usage/Stop.GIF)


2. The default WebSocket communication between bridge and the third party software, is done over port 8181. You can change the port in the config.json file if needed.
3. You can find the initial prompt text is in the file firstPrompt.txt, You may custumize it for your personal needs if you want.
   
4. Two modes of communication are available:

   - Wait for a complete GPT message before sending it to the third-party software (default mode)
   - Stream the message while it's being received from GPT (enable this by setting "streamingMode": true in the config.json file)

## 📚 Documentation

For more detailed information on how to use ChatGPT-Bridge, please refer to the [Wiki](https://github.com/improveTheWorld/ChatGPT-Bridge/wiki).

## 📧 Contributing

We welcome contributions! If you'd like to contribute, please follow these steps:

1. Fork the repository.
2. Create your feature branch (`git checkout -b feature/your-feature`).
3. Commit your changes (`git commit -am 'Add some feature'`).
4. Push to the branch (`git push origin feature/your-feature`).
5. Open a Pull Request.

Please read our [Contributing Guidelines](./CONTRIBUTING.md) for more details.

## 🔐 License

- This project is licensed under the Apache V2.0 for free software use- see the[LICENSE](./LICENSE-APACHE.txt) file for details.
- For commercial software use, see the[LICENSE_NOTICE](./LICENSE_NOTICE.md) file.

## 📬 Contact

If you have any questions or suggestions, please feel free to reach out to us:

- [B.GATRI](mailto:bilelgatri@gmail.com)
- [Project Link](https://github.com/improveTheWorld/ChatGPT-Bridge)

## 🎉 Acknowledgments

- [OpenAI](https://www.openai.com/) for the[ChatGPT](https://chat.openai.com/chat) website
- [Google](https://www.google.com/chrome/)  and[Microsoft ](https://www.microsoft.com/en-us/edge) for providing the browser platform
- All contributors who have helped improve ChatGPT-Bridge
- The amazing open-source community for their invaluable resources and inspiration
- Our users and testers for providing essential feedback that helps us improve ChatGPT-Bridge

**Join us on this exciting journey to unlock the unlimited power and potential of ChatGPT! Stay tuned for future updates and the upcoming release of the other part of the project, which will bring even more groundbreaking features and possibilities. Together, we can revolutionize the way we interact with AI-powered language models!**
