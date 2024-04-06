export class ChatGPTHeaders {
  private headers: Record<string, string> = {
    accept: '*/*',
    'accept-language': 'en-GB,en;q=0.6',
    'cache-control': 'no-cache',
    'content-type': 'application/json',
    'oai-language': 'en-US',
    origin: 'https://chat.openai.com',
    pragma: 'no-cache',
    referer: 'https://chat.openai.com/',
    'sec-ch-ua': '"Brave";v="123", "Not:A-Brand";v="8", "Chromium";v="123"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"macOS"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-origin',
    'sec-gpc': '1',
    'user-agent':
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
  };

  constructor(headers: Record<string, string>) {
    this.headers = {
      ...this.headers,
      ...headers,
    };
  }

  getHeaders() {
    return this.headers;
  }

  addHeader(key: string, value: string) {
    this.headers[key] = value;
  }

  removeHeader(key: string) {
    delete this.headers[key];
  }
}
