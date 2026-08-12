import { Injectable } from '@nestjs/common';
import { RedisService } from 'src/Redis/services/redis.service';
import { IChatMessage } from '../types';

@Injectable()
export class ChatMemoryService {
  private readonly MAX_HISTORY = 10;
  private readonly TTL_SECONDS = 86400;

  constructor(private readonly redisService: RedisService) {}

  private getKey(userId: string): string {
    return `bug_detective:history:${userId}`;
  }

  async addMessage(userId: string, message: IChatMessage): Promise<void> {
    const client = this.redisService.getClient();
    const key = this.getKey(userId);

    await client.rpush(key, JSON.stringify(message));

    await client.expire(key, this.TTL_SECONDS);
  }

  async getHistory(userId: string): Promise<IChatMessage[]> {
    const client = this.redisService.getClient();
    const key = this.getKey(userId);

    const rawMessages = await client.lrange(key, -this.MAX_HISTORY, -1);

    return rawMessages.map((msg) => JSON.parse(msg) as IChatMessage);
  }

  async clearHistory(userId: string): Promise<void> {
    const client = this.redisService.getClient();
    await client.del(this.getKey(userId));
  }
}
