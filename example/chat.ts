import { chat } from 'chatgpt-free-api';

/**
 * Function to start a chat conversation with a single message.
 * @param {string} message - The message to start the conversation with.
 * @returns {Promise<void>}
 */
async function startChat(message: string) {
  try {
    const response = await chat.startConversation(message);
    console.log(response);
  } catch (error) {
    console.error('Error starting conversation:', error);
  }
}

/**
 * Function to start and continue a chat conversation by chaining multiple messages.
 * @returns {Promise<void>}
 */
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

// Start a conversation with a single message
startChat('What is the output of 10 + 20?');

// Start and continue a conversation by chaining multiple messages
// chainChatMessages();
