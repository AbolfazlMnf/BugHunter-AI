import { Module } from '@nestjs/common';
import { ChatController } from './controllers/chat.controller';
import { ChatService } from './services/chat.service';
import { ChatMemoryService } from './services/chat-memory.service';
import { RedisService } from 'src/Redis/services/redis.service';

@Module({
  controllers: [ChatController],
  providers: [ChatService, ChatMemoryService, RedisService],
})
export class ChatModule {}
