import { Injectable, NotFoundException } from '@nestjs/common';
import { sendRequest } from 'src/CORE/POST/sendMessage';
import { ChatMemoryService } from './chat-memory.service';
import { IChatMessage, IncidentRequestType } from '../types';
import { v4 as uuidv4 } from 'uuid';
@Injectable()
export class ChatService {
  constructor(private readonly chatMemoryService: ChatMemoryService) {}
  generateMemoryKey(userId: string, sessionId: string): string {
    return `${userId}:${sessionId}`;
  }

  async getChatHistory(memoryKey: string) {
    const history = await this.chatMemoryService.getHistory(memoryKey);
    if (!history || history.length === 0) {
      throw new NotFoundException('No chat history found.');
    }
    return history;
  }

  async clearChatHistory(userId: string, sessionId: string) {
    const memoryKey = this.generateMemoryKey(userId, sessionId);
    await this.chatMemoryService.clearHistory(memoryKey);
  }

  async getChatResponse(
    userId: string,
    sessionId: string | undefined,
    userMessage: string,
  ) {
    const activeSessionId = sessionId || uuidv4();
    const memoryKey = this.generateMemoryKey(userId, activeSessionId);
    const history = await this.getChatHistory(memoryKey);
    const newMessage = { role: 'user' as const, content: userMessage };
    const isFirstMessage = history.length === 0;
    const requestType = isFirstMessage
      ? IncidentRequestType.INITIAL_ANALYSIS
      : IncidentRequestType.FOLLOW_UP;

    const prompt = isFirstMessage
      ? `You are a senior backend engineer specialized in NestJS, Node.js, Next.js, TypeScript, MongoDB, PostgreSQL, Redis, and Distributed Systems.
Analyse the provided incident/code accurately. Do not invent information that is not supported by the input. If uncertain, state it clearly.`
      : `You are a senior backend engineer. Answer the user's follow-up questions clearly and concisely using Markdown and code blocks where appropriate based on the previous incident analysis context.`;
    const systemPrompt: IChatMessage = { role: 'system', content: prompt };
    const fullMessages = [systemPrompt, ...history, newMessage];

    const result = await sendRequest(fullMessages, requestType);

    let assistantResponse = ``;
    if (result.type === IncidentRequestType.INITIAL_ANALYSIS) {
      assistantResponse = `[Analysis Summary]
- Severity: ${result.data.severity}
- Root Cause: ${result.data.root_cause}
- Explanation: ${result.data.explanation}
- Recommendation: ${result.data.recommendation}
- Preventive Measures: ${result.data.preventive_measures}`;
    } else {
      assistantResponse = result?.data?.text;
    }
    await this.chatMemoryService.addMessage(memoryKey, newMessage);
    await this.chatMemoryService.addMessage(memoryKey, {
      role: 'assistant',
      content: assistantResponse,
    });
    return { ...result, sessionId: activeSessionId };
  }
}
