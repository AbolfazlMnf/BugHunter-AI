import { Injectable } from '@nestjs/common';
import { sendRequest } from 'src/CORE/POST/sendMessage';

@Injectable()
export class ChatService {
  async getChatResponse(incident: string): Promise<Record<string, string>> {
    const data = await sendRequest(incident);
    console.log(data);

    return {
      message: data?.choices[0]?.message?.content || 'No response from API',
    };
  }
}
