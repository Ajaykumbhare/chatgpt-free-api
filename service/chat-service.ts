import { OpenAIEndpoints } from '../apis/endpoints';
import { ChatGPTHeaders, generateMessageId, readResponseBody } from '../utils';
import type { OpenAIEndpointTypes, ConversationDataResponse } from '../models';

/**
 * Represents a chat service.
 */
class ChatService {
  #device_id: string = '';
  #token: string = '';

  /**
   * Initializes the chat service.
   * @param force - Whether to force initialization even if device ID and token are already set.
   * @returns A promise that resolves when the initialization is complete.
   */
  async #initialize(force: boolean = false) {
    if (force || !this.#device_id || !this.#token) {
      return this.#getDeviceId().then((info) => {
        this.#device_id = info?.['oai-device-id'] || '';
        return this.#getToken().then((token) => {
          this.#token = token || '';
        });
      });
    }
    return Promise.resolve();
  }

  /**
   * Retrieves the device ID from the server.
   * @returns A promise that resolves with the device ID.
   */
  async #getDeviceId() {
    const response = await fetch(OpenAIEndpoints['device-id'], {
      method: 'GET',
      headers: new ChatGPTHeaders({}).getHeaders(),
    });
    const textContent = await response.text();
    const regex = /"DeviceId":"([\w-]+)"/;
    const match = textContent.match(regex);
    if (match) {
      const deviceId = match[1];
      return { 'oai-device-id': deviceId };
    } else {
      return null;
    }
  }

  /**
   * Retrieves the token from the server.
   * @returns A promise that resolves with the token.
   */
  async #getToken(): Promise<string> {
    const headers = new ChatGPTHeaders({ 'oai-device-id': this.#device_id });
    const response = await fetch(OpenAIEndpoints.token, {
      method: 'POST',
      headers: headers.getHeaders(),
      body: '{}',
    });
    const data = (await response.json()) as unknown as OpenAIEndpointTypes['token'];
    return data.token;
  }

  /**
   * Starts a conversation with the chat service.
   * @param prompt - The initial prompt for the conversation.
   * @returns A promise that resolves with the response from the server.
   */
  async startConversation(prompt: string, conversationId?: string): Promise<ConversationDataResponse> {
    if (!this.#device_id) {
      await this.#initialize();
    } else {
      this.#token = await this.#getToken();
    }
    const headers = new ChatGPTHeaders({
      'oai-device-id': this.#device_id,
      'openai-sentinel-chat-requirements-token': this.#token,
    });

    const body = {
      action: 'next',
      conversation_id: conversationId,
      messages: [
        {
          id: generateMessageId(),
          author: {
            role: 'user',
          },
          content: {
            content_type: 'text',
            parts: [prompt],
          },
          metadata: {},
        },
      ],
      parent_message_id: generateMessageId(),
      model: 'text-davinci-002-render-sha',
      timezone_offset_min: -330,
      suggestions: [],
      history_and_training_disabled: false,
      conversation_mode: {
        kind: 'primary_assistant',
      },
      force_paragen: false,
      force_paragen_model_slug: '',
      force_nulligen: false,
      force_rate_limit: false,
    };
    const response = await fetch(OpenAIEndpoints.conversation, {
      method: 'POST',
      headers: headers.getHeaders(),
      body: JSON.stringify(body),
    });
    return await readResponseBody(response.body);
  }
}

export const chat = new ChatService();
