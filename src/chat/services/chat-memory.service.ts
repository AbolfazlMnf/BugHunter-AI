import { Injectable } from '@nestjs/common';
import { RedisService } from 'src/Redis/services/redis.service';
import { IChatMessage } from '../types';

@Injectable()
export class ChatMemoryService {
  private readonly MAX_HISTORY = 10;
  private readonly TTL_SECONDS = 86400;

  constructor(private readonly redisService: RedisService) {}

  private getKey(sessionId: string): string {
    return `bug_detective:history:${sessionId}`;
  }

  async addMessage(sessionId: string, message: IChatMessage): Promise<void> {
    const client = this.redisService.getClient();
    const key = this.getKey(sessionId);

    await client.rpush(key, JSON.stringify(message));

    await client.expire(key, this.TTL_SECONDS);
  }

  async getHistory(sessionId: string): Promise<IChatMessage[]> {
    const client = this.redisService.getClient();
    const key = this.getKey(sessionId);

    const rawMessages = await client.lrange(key, -this.MAX_HISTORY, -1);

    return rawMessages.map((msg) => JSON.parse(msg) as IChatMessage);
  }

  async clearHistory(sessionId: string): Promise<void> {
    const client = this.redisService.getClient();
    await client.del(this.getKey(sessionId));
  }
}
