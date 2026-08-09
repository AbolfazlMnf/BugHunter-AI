import { InternalServerErrorException } from '@nestjs/common';
import axios from 'axios';
import { ChatResponse } from 'src/chat/types';

const stream = false;

export const sendRequest = async (incident: string): Promise<ChatResponse> => {
  const apiKey = process.env.NVIDIA_API_KEY;
  if (!apiKey) {
    throw new InternalServerErrorException('API key is not defined');
  }
  const invokeUrl = process.env.INVOKE_URL;
  if (!invokeUrl) {
    throw new InternalServerErrorException('Invoke URL is not defined');
  }
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${apiKey}`,
  };

  const payload = {
    messages: [{ role: 'user', content: incident }],
    model: 'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning',
    max_tokens: 5536,
    reasoning_budget: 3084,
    stream: stream,
    temperature: 0.5,
    top_p: 0.95,
  };
  try {
    const response = await axios.post(process.env.INVOKE_URL!, payload, {
      headers: headers,
      responseType: stream ? 'stream' : 'json',
    });
    return response.data;
  } catch (error) {
    console.error('Error sending message:', error);
    throw new InternalServerErrorException('Failed to send message to API');
  }
};
