# ChatGPT-Bridge

![ChatGPT-Bridge Logo](./icon48.png)


**Tired of waiting for access to GPT-4 API?!! Here’s the solution!**

ChatGPT-Bridge is an experimental Microsoft Edge plugin designed to seamlessly integrate ChatGPT with third-party software. It achieves this by intercepting ChatGPT messages, transmitting them over a WebSocket, receiving the response from the third-party software, and injecting the answer back into the chat session. This process empowers ChatGPT with a vast array of applications and unlocks its full potential.

This plugin provides API-like access to GPT-3.5 and GPT-4 without the need for a long waiting period. ChatGPT-Bridge offers free access to GPT-3.5 AI, while using it with GPT-4 requires a ChatGPT Plus account but incurs no additional fees.

This plugin is part of an upcoming project, which gives ChatGPT access to the Windows prompt to execute commands necessary for completing tasks assigned to it by the user, thus unlocking unlimited capabilities of ChatGPT - **stay tuned!**

**Note:** Since ChatGPT-Bridge is still in the experimental stage, there may be potential bugs and limitations. We appreciate your understanding and welcome any feedback to help us improve the plugin.

## 🌟 Features

- Seamlessly connects ChatGPT with third-party software
- Utilizes WebSocket for real-time communication
- Supports both GPT-3.5 and GPT-4
- Free API-like access to GPT-3.5 and GPT-4 with a ChatGPT Plus account
- Paves the way for future integrations with local Windows prompt

## 🚀 Getting Started

### Prerequisites

- Microsoft Edge browser
- Basic understanding of browser extensions

### Installation

1. Clone the repository:

   git clone https://github.com/improveTheWorld/ChatGPT-Bridge.git
    
2. Open Microsoft Edge and navigate to `edge://extensions`.

3. Enable "Developer Mode" in the top-right corner.

4. Click on "Load Unpacked" and select the `chatgpt-bridge` folder.

5. The ChatGPT-Bridge plugin should now be visible in the extensions list and ready for use!

## 🛠️ Usage

1. After installing the plugin, go to [ChatGPT](https://chat.openai.com/chat) website, click the plugin button on the top part of the browser to open a popup with two buttons: "Start" to initiate bridging with the third-party software, and "Stop" to end the connection.

2. The default WebSocket communication is done over port 8181. You can change the port in the config.json file if necessary.

3. Two modes of communication are available:

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

- This project is licensed under the Apache V2.0 for free software use- see the [LICENSE](./LICENSE-APACHE.txt) file for details.
- For commercial software use, see the [LICENSE_NOTICE](./LICENSE_NOTICE.md) file.

## 📬 Contact

If you have any questions or suggestions, please feel free to reach out to us:

- [B.GATRI](mailto:bilelgatri@gmail.com)
- [Project Link](https://github.com/improveTheWorld/ChatGPT-Bridge)

## 🎉 Acknowledgments

- [OpenAI](https://www.openai.com/) for the [ChatGPT](https://chat.openai.com/chat) website
- [Microsoft Edge](https://www.microsoft.com/en-us/edge) for providing the browser platform
- All contributors who have helped improve ChatGPT-Bridge
- The amazing open-source community for their invaluable resources and inspiration
- Our users and testers for providing essential feedback that helps us improve ChatGPT-Bridge

**Join us on this exciting journey to unlock the unlimited power and potential of ChatGPT! Stay tuned for future updates and the upcoming release of the other part of the project, which will bring even more groundbreaking features and possibilities. Together, we can revolutionize the way we interact with AI-powered language models!**
