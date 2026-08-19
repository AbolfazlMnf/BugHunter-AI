import { Injectable, NotFoundException } from '@nestjs/common';
import { sendRequest } from 'src/CORE/POST/sendMessage';
import { ChatMemoryService } from './chat-memory.service';
import { IChatMessage, IncidentResponseType } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { RetrievedChunk } from 'src/projects/types/retrieved-chunk.type';
@Injectable()
export class ChatService {
  constructor(private readonly chatMemoryService: ChatMemoryService) {}
  private readonly systemPrompt = `You are an expert Senior Backend Engineer and Production Incident Analyst.

You specialize in:
- NestJS
- Node.js
- TypeScript
- Express.js
- Next.js
- MongoDB
- PostgreSQL
- Redis
- REST APIs
- Authentication and Authorization
- Distributed Systems
- Microservices
- Docker
- Networking
- Performance and Reliability

`;

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
    incident: string,
    retrievedChunks?: RetrievedChunk[],
  ) {
    const activeSessionId = sessionId || uuidv4();
    const memoryKey = this.generateMemoryKey(userId, activeSessionId);
    const history = (await this.chatMemoryService.getHistory(memoryKey)) ?? [];
    const newMessage = {
      role: 'user' as const,
      content: `
Production Incident:

${incident}


${
  retrievedChunks && retrievedChunks.length > 0
    ? ` Relevant Code Context:

${retrievedChunks
  .map(
    (chunk) => `
  file path : ${chunk.path} 
  lines : ${chunk.startLine}-${chunk.endLine} 
  language: ${chunk.language} 
  ${chunk.content}
  `,
  )
  .join(`\n`)}`
    : ``
}
`,
    };

    const systemPrompt: IChatMessage = {
      role: 'system',
      content: this.systemPrompt,
    };
    const fullMessages = [systemPrompt, ...history, newMessage];

    const responseType =
      retrievedChunks && retrievedChunks.length > 0
        ? IncidentResponseType.STRUCTURED_JSON
        : IncidentResponseType.SIMPLE_CHAT;

    const result = await sendRequest(fullMessages, responseType);

    let assistantResponse = ``;
    if (result.type === IncidentResponseType.STRUCTURED_JSON) {
      assistantResponse = `[Analysis Summary]
- Severity: ${result.data.severity}
- Root Cause: ${result.data.rootCause}
- Explanation: ${result.data.explanation}
- Recommendations: ${result.data.recommendations.join(', ')}
- Confidence: ${result.data.confidence}

Evidence:
${result.data.evidence
  .map((item) => `- ${item.filePath}: ${item.reason}`)
  .join('\n')}

`;
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
