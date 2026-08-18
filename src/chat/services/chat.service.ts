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

Your task is to analyze a production incident using the provided incident description and relevant source-code context retrieved from the project's codebase.

IMPORTANT RULES:

1. Analyze the incident using the provided evidence.
2. Do not invent code, configuration, behavior, logs, or infrastructure that are not present in the provided context.
3. If the available evidence is insufficient to determine the root cause with certainty, explicitly state that the root cause cannot be determined with certainty.
4. Distinguish between:
   - confirmed facts
   - strong evidence
   - assumptions
5. Prefer explanations directly supported by the provided source code.
6. When referring to code, mention the file path and relevant line numbers when available.
7. Do not assume that a retrieved chunk represents the entire file.
8. Consider interactions between multiple files when analyzing the incident.
9. Look for:
   - incorrect logic
   - missing validation
   - authentication/authorization problems
   - race conditions
   - state management problems
   - database issues
   - caching problems
   - error handling problems
   - configuration problems
   - dependency problems
   - performance bottlenecks
   - distributed-system failures
10. Do not recommend changing code unless the recommendation is relevant to the identified problem.
11. If multiple possible root causes exist, rank them by likelihood and explain why.
12. The final response MUST follow the provided JSON schema exactly.`;

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

    const result = await sendRequest(fullMessages);

    let assistantResponse = ``;
    if (result.type === IncidentResponseType.STRUCTURED_JSON) {
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
