// apis/endpoints.ts
var OpenAIEndpoints = {
  "device-id": "https://chat.openai.com/",
  token: "https://chat.openai.com/backend-anon/sentinel/chat-requirements",
  conversation: "https://chat.openai.com/backend-anon/conversation"
};

// utils/messageId.ts
function generateMessageId() {
  const PREFIX = "aaa1";
  return PREFIX.concat(crypto.randomUUID().substring(4));
}
// utils/headers.ts
class ChatGPTHeaders {
  headers = {
    accept: "*/*",
    "accept-language": "en-GB,en;q=0.6",
    "cache-control": "no-cache",
    "content-type": "application/json",
    "oai-language": "en-US",
    origin: "https://chat.openai.com",
    pragma: "no-cache",
    referer: "https://chat.openai.com/",
    "sec-ch-ua": '"Brave";v="123", "Not:A-Brand";v="8", "Chromium";v="123"',
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": '"macOS"',
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
    "sec-gpc": "1",
    "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36"
  };
  constructor(headers) {
    this.headers = {
      ...this.headers,
      ...headers
    };
  }
  getHeaders() {
    return this.headers;
  }
  addHeader(key, value) {
    this.headers[key] = value;
  }
  removeHeader(key) {
    delete this.headers[key];
  }
}
// utils/isValidJSON.ts
function isValidJSON(jsonString) {
  try {
    JSON.parse(jsonString);
    return true;
  } catch (error) {
    return false;
  }
}
// polyfils/polyfillTextDecoderStream.ts
class PolyfillTextDecoderStream extends TransformStream {
  encoding;
  fatal;
  ignoreBOM;
  constructor(encoding = "utf-8", { fatal = false, ignoreBOM = false } = {}) {
    const decoder = new TextDecoder(encoding, { fatal, ignoreBOM });
    super({
      transform(chunk, controller) {
        const decoded = decoder.decode(chunk);
        if (decoded.length > 0) {
          controller.enqueue(decoded);
        }
      },
      flush(controller) {
        const output = decoder.decode();
        if (output.length > 0) {
          controller.enqueue(output);
        }
      }
    });
    this.encoding = encoding;
    this.fatal = fatal;
    this.ignoreBOM = ignoreBOM;
  }
}
// utils/transformStream.ts
async function readResponseBody(readableStream) {
  const decoder = new PolyfillTextDecoderStream;
  const chunks = readableStream?.pipeThrough(decoder);
  let finalResult = {
    message: "",
    conversation_id: ""
  };
  try {
    for await (const chunk of chunks || []) {
      const chunkStr = chunk ? chunk.toString() : "";
      if (!chunkStr.includes("DONE") && chunkStr.trim() !== "") {
        const chunkResult = processChunk(chunkStr);
        if (chunkResult) {
          finalResult = chunkResult;
        }
      }
    }
    return finalResult;
  } catch (error) {
    console.error("Error reading response body:", error);
    return finalResult;
  }
}
var processChunk = function(chunk) {
  const lines = chunk.split("\n");
  const validLine = lines.find((line) => {
    const jsonString = line.replaceAll("data: ", "")?.trim();
    if (line.trim() && isValidJSON(jsonString)) {
      const parsedData = JSON.parse(jsonString);
      return parsedData.message.status === "finished_successfully";
    }
    return false;
  });
  if (validLine) {
    const jsonString = validLine.replaceAll("data: ", "")?.trim();
    const parsedData = JSON.parse(jsonString);
    return {
      message: parsedData.message.content.parts.join("\n"),
      conversation_id: parsedData.conversation_id
    };
  }
};
// service/chat-service.ts
class ChatService {
  #device_id = "";
  #token = "";
  async#initialize(force = false) {
    if (force || !this.#device_id || !this.#token) {
      return this.#getDeviceId().then((info) => {
        this.#device_id = info?.["oai-device-id"] || "";
        return this.#getToken().then((token) => {
          this.#token = token || "";
        });
      });
    }
    return Promise.resolve();
  }
  async#getDeviceId() {
    const response = await fetch(OpenAIEndpoints["device-id"], {
      method: "GET",
      headers: new ChatGPTHeaders({}).getHeaders()
    });
    const textContent = await response.text();
    const regex = /"DeviceId":"([\w-]+)"/;
    const match = textContent.match(regex);
    if (match) {
      const deviceId = match[1];
      return { "oai-device-id": deviceId };
    } else {
      return null;
    }
  }
  async#getToken() {
    const headers2 = new ChatGPTHeaders({ "oai-device-id": this.#device_id });
    const response = await fetch(OpenAIEndpoints.token, {
      method: "POST",
      headers: headers2.getHeaders(),
      body: "{}"
    });
    const data = await response.json();
    return data.token;
  }
  async startConversation(prompt, conversationId) {
    if (!this.#device_id) {
      await this.#initialize();
    } else {
      this.#token = await this.#getToken();
    }
    const headers2 = new ChatGPTHeaders({
      "oai-device-id": this.#device_id,
      "openai-sentinel-chat-requirements-token": this.#token
    });
    const body = {
      action: "next",
      conversation_id: conversationId,
      messages: [
        {
          id: generateMessageId(),
          author: {
            role: "user"
          },
          content: {
            content_type: "text",
            parts: [prompt]
          },
          metadata: {}
        }
      ],
      parent_message_id: generateMessageId(),
      model: "text-davinci-002-render-sha",
      timezone_offset_min: -330,
      suggestions: [],
      history_and_training_disabled: false,
      conversation_mode: {
        kind: "primary_assistant"
      },
      force_paragen: false,
      force_paragen_model_slug: "",
      force_nulligen: false,
      force_rate_limit: false
    };
    const response = await fetch(OpenAIEndpoints.conversation, {
      method: "POST",
      headers: headers2.getHeaders(),
      body: JSON.stringify(body)
    });
    return await readResponseBody(response.body);
  }
}
var chat = new ChatService;
export {
  chat
};
