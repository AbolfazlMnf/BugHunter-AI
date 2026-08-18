import { Module } from '@nestjs/common';
import { ChatController } from './controllers/chat.controller';
import { ChatService } from './services/chat.service';
import { ChatMemoryService } from './services/chat-memory.service';
import { RedisService } from 'src/Redis/services/redis.service';
import { RetrievalService } from 'src/projects/services/retrieval.service';

@Module({
  controllers: [ChatController],
  providers: [ChatService, ChatMemoryService, RedisService, RetrievalService],
})
export class ChatModule {}
