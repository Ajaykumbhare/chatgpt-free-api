import { PolyfillTextDecoderStream } from '../polyfils';
import { isValidJSON } from './isValidJSON';
import type { ConversationData, ConversationDataResponse } from '../models';

/**
 * Reads the response body from a readable stream and processes it.
 * @param readableStream - The readable stream containing the response body.
 * @returns A promise that resolves to the final result object.
 */
export async function readResponseBody(readableStream: ReadableStream | null): Promise<ConversationDataResponse> {
  const decoder = new PolyfillTextDecoderStream();
  const chunks = readableStream?.pipeThrough(decoder);

  let finalResult: ConversationDataResponse = {
    message: '',
    conversation_id: '',
  };

  try {
    for await (const chunk of chunks || []) {
      // Convert the chunk of data to a string
      const chunkStr = chunk ? chunk.toString() : '';

      if (!chunkStr.includes('DONE') && chunkStr.trim() !== '') {
        const chunkResult = processChunk(chunkStr);
        if (chunkResult) {
          finalResult = chunkResult;
        }
      }
    }
    return finalResult;
  } catch (error) {
    console.error('Error reading response body:', error);
    return finalResult;
  }
}

/**
 * Processes a chunk of data and extracts relevant information.
 * @param chunk - The chunk of data to process.
 * @returns An object containing the extracted content and conversation ID.
 */
function processChunk(chunk: string): ConversationDataResponse | undefined {
  // Split the chunk by newlines to get individual lines
  const lines = chunk.split('\n');

  // Find the first line that can be parsed as valid JSON and has a message.status of 'finished_successfully'
  const validLine = lines.find((line) => {
    const jsonString = line.replaceAll('data: ', '')?.trim();
    if (line.trim() && isValidJSON(jsonString)) {
      const parsedData: ConversationData = JSON.parse(jsonString);
      return parsedData.message.status === 'finished_successfully';
    }
    return false;
  });

  if (validLine) {
    const jsonString = validLine.replaceAll('data: ', '')?.trim();
    const parsedData: ConversationData = JSON.parse(jsonString);
    return {
      message: parsedData.message.content.parts.join('\n'),
      conversation_id: parsedData.conversation_id,
    };
  }
}
