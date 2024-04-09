# chatgpt-free-api

Access ChatGPT's free "text-davinci-002-render-sha" model without needing an OpenAI API key or account!

🚨🚫 **IMPORTANT: PLEASE READ BEFORE USING** 🚫🚨

## **Do not use this package for spam!**

This package is intended for educational purposes only. Spamming with this package is strictly prohibited and goes against ethical usage. Respect OpenAI's usage policies and guidelines.

[NPM](https://www.npmjs.com/package/chatgpt-free-api)

## Features

- **No OpenAI Account Required:** Seamlessly interact with ChatGPT without signup hassles.
- **Free Model:** Leverages OpenAI's "text-davinci-002-render-sha" model, accessible for free.
- **Conversational Chat:** Start and continue multi-turn conversations for context-aware responses.
- **Easy-to-Use API:** Simple functions for initiating and chaining conversations.

## Installation

```bash
npm install chatgpt-free-api
```

## Usage

```js
import { chat } from 'chatgpt-free-api';

// Single-Message Conversation
async function startChat(message: string) {
  try {
    const response = await chat.startConversation(message);
    console.log(response);
  } catch (error) {
    console.error('Error starting conversation:', error);
  }
}

// Chained Conversation
async function chainChatMessages() {
  try {
    const firstResponse = await chat.startConversation('What is the output of 10 + 20?');
    console.log(firstResponse);

    const secondResponse = await chat.startConversation('Multiply by 5', firstResponse.conversation_id);
    console.log(secondResponse);
  } catch (error) {
    console.error('Error in chained conversation:', error);
  }
}
```

## Available Functions

`chat.startConversation(message: string, conversationId?: string)` - Starts a new conversation or continues an existing one.

## Contributing

Welcome contributions!

## License

This package is licensed under the MIT License. See the LICENSE for more information.
