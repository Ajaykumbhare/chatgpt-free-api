/**
 * Represents a token with persona, arkose, turnstile, and token information.
 */
type Token = {
  persona: string;
  arkose: {
    required: boolean;
    dx: null;
  };
  turnstile: {
    required: boolean;
  };
  token: string;
};

/**
 * Represents the types used in an OpenAI endpoint.
 */
export type OpenAIEndpointTypes = {
  'device-id': string;
  token: Token;
  conversation: any;
};
