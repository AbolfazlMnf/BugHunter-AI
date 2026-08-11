import { Injectable } from '@nestjs/common';
import { sendRequest } from 'src/CORE/POST/sendMessage';
import { ChatResponse } from '../types';

@Injectable()
export class ChatService {
  async getChatResponse(incident: string): Promise<ChatResponse> {
    const prompt = `
You are a senior backend engineer specialized in:

- NestJS
- Node.js
- Express.js
- Next.js
- TypeScript
- MongoDB
- PostgreSQL
- Redis
- Distributed Systems

Analyze the following production incident.

Incident:
${incident}

Determine:

1. Severity
2. Root cause
3. Detailed explanation
4. Recommendations
5. Preventive measures

Do not invent information that is not supported by the incident.
If the root cause cannot be determined with certainty, clearly state the uncertainty.
`;

    const data = await sendRequest(prompt);

    return data;
  }
}
