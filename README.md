# ![ChatGPT-Bridge Logo](./Images/Logo/logo.png) **ChatGPT-Bridge**

Tired of waiting for access to the GPT-4 API? Frustrated by the fees charged for using the GPT-API? We have the perfect solution for you!
-----------------------------------------------------------------------------------------------------------------------------------------

Introducing **ChatGPT-Driver**, a system comprised of two components: **ChatGPT-Bridge** (referred to as **"Bridge"**) and **[ChatGPT-Executor](https://github.com/improveTheWorld/ChatGPT-Executor)**  (referred to as **"Executor"**).
**Bridge** is a web browser plugin compatible with Microsoft Edge and Google Chrome. It offers API-like access to **ChatGPT**. When combined with **Executor** (a server application that receives and executes Windows commands), they unlock the full potential of ChatGPT without any waiting list or additional fees.

**Bridge** offers API-like access to GPT-3.5 and GPT-4 for third-party software via webSockets.
Bridge provides free API-like access to GPT-3.5. It also provides free API-like access to GPT-4 if you have a ChatGPT Plus account.
**✨ 🎉🌟 No fees are charged for the use of the API-like access!**

To fully benefit from ChatGPT-Driver, install and set up both components.

## What's New in Version 1.0.0

- Upgraded from an experimental version to a stable release (v1.0.0)
- Improved performance and compatibility with Executor
- Streamlined setup and usage with clearer instructions
- Release of [Executor repository](https://github.com/improveTheWorld/ChatGPT-Executor.git) and source code.
- Improved graphical design and much more.

**Note:** While ChatGPT-Driver has been significantly improved and tested, there may still be potential bugs and limitations. We appreciate your understanding and welcome any feedback to help us enhance the system.

## 🌟 Features

- 🔗 Seamlessly connects ChatGPT with third-party software
- 🌐 Utilizes WebSocket for real-time communication
- 🤖 Supports both GPT-3.5 and GPT-4
- 🆓 Free API-like access to GPT-3.5 and GPT-4 with a ChatGPT Plus account
- 📚 Enables ChatGPT to read large files that exceed the size of a single prompt

## 🔧 Installation and Usage

To utilize ChatGPT-Driver, you'll need to install both the Bridge plugin and the Executor server application.

### ChatGPT-Bridge

Follow the instructions in the [Getting Started](https://github.com/improveTheWorld/ChatGPT-Bridge#getting-started) section to install the Bridge plugin.

### ChatGPT-Executor

1. Visit the [Executor GitHub Repository](https://github.com/improveTheWorld/ChatGPT-Executor) and follow the installation instructions.
2. Set up the Executor server application according to the provided documentation.

## 🚀 Getting Started

### Prerequisites

- Microsoft Edge or Google Chrome browser
- Basic understanding of browser extensions

### Installation

1. Clone the repository:

   git clone https://github.com/improveTheWorld/ChatGPT-Bridge.git
2. Open your browser and navigate to extensions ( `edge://extensions` or `chrome://extensions` depending on your browser).
3. Enable "Developer Mode" in the top-right corner.
4. Click on "Load Unpacked" and select the `chatgpt-bridge` folder.
5. The ChatGPT-Bridge plugin should now be visible in the extensions ist and ready for use!

## 🛠️ Usage

1.  After installing the plugin, go to [ChatGPT](https://chat.openai.com/chat) website.
2.  The bridge popup will be displayed at the top right corner of the webpage. You may move it using your mouse if needed.

*   If the displayed popup is as below: 
   
    ![Connecting.GIF](./Images/Usage/Connecting.GIF)  
   
    `You forgot to launch the Executor or your third-party server, if applicable. Please start the Executor and wait. The Bridge will continuously poll for a connection until it is established.`

    
*   When the connection is established, the displayed popup should be as below:
    
    ![Start.GIF](./Images/Usage/Start.GIF)
    
    Start a new chat and then click the start button to begin bridging between your ChatGPT AI and the third-party software (the Executor).
    

    
    When you click start with a new chat page, the Bridge plugin will empty the first prompt and send it. The first prompt is intended to teach CHATGPT the communication protocol to use with the Executor. 
    

    
    Once ChatGPT gets all the initial instructions, it will ask you for its first task. Assign one and watch the magic work.
    
    `As an example of use, we asked ChatGPT to troubleshoot our WiFi card. We had an issue that the Windows network diagnostic tools were unable to detect. ChatGPT, after trying different approaches using our ChatGPT-Bridge system, was able to fix it for us.`
    
    * * *
    
*   When you are done and want to stop using the bridge, just click the stop button: 
    
    ![Stop.GIF](./Images/Usage/Stop.GIF)
    

1.  The default WebSocket communication between the Bridge and the third-party software is done over port 8181. You can change the port in the config.json file if needed.
    
2.  You can find the initial prompt text in the file firstPrompt.txt. You may customize it for your personal needs if you want.
    
3.  Two modes of communication are available:
    
    *   Wait for a complete GPT message before sending it to the third-party software (default mode).
    *   Stream the message while it's being received from GPT (enable this by setting "streamingMode": true in the config.json file).

4.  If you want to use only the Bridge plugin with your third-party software, your software should act as a server and listen on the correct port for a connection. Once the plugin is installed and launched, it will automatically request a connection.

<!-- Documentation
-------------

For more detailed information on how to use ChatGPT-Bridge, please refer to the [Wiki](https://github.com/improveTheWorld/ChatGPT-Bridge/wiki). -->

## 📧 Contributing

We welcome contributions! If you'd like to contribute, please follow these steps:

1.  Fork the repository.
2.  Create your feature branch (`git checkout -b feature/your-feature`).
3.  Commit your changes (`git commit -am 'Add some feature'`).
4.  Push to the branch (`git push origin feature/your-feature`).
5.  Open a Pull Request.

Please read our [Contributing Guidelines](./CONTRIBUTING.md) for more details.

## 🔐 License

*   This project is licensed under the Apache V2.0 for free software use - see the [LICENSE](./LICENSE-APACHE.txt) file for details.
*   For commercial software use, see the [LICENSE\_NOTICE](./LICENSE_NOTICE.md) file.

## 📬 Contact

If you have any questions or suggestions, please feel free to reach out to us:

*   [Tec-Net](mailto:tecnet.paris@gmail.com)
<!-- *   [Project Link](https://github.com/improveTheWorld/ChatGPT-Bridge) -->

## 🎉 Acknowledgments

*   [OpenAI](https://www.openai.com/) for the [ChatGPT](https://chat.openai.com/chat) website
*   [Google](https://www.google.com/chrome/) and [Microsoft](https://www.microsoft.com/en-us/edge) for providing the browser platform
*   All contributors who have helped improve ChatGPT-Bridge
*   The amazing open-source community for their invaluable resources and inspiration
*   Our users and testers for providing essential feedback that helps us improve ChatGPT-Bridge

**Join us on this exciting journey to unlock the unlimited power and potential of ChatGPT! Stay tuned for future updates and the upcoming release of the other part of the project, which will bring even more groundbreaking features and possibilities. Together, we can revolutionize the way we interact with AI-powered language models!**