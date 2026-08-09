import { Body, Controller, Post } from '@nestjs/common';
import { ChatDto } from '../dtos/chat.dto';
import { ChatService } from '../services/chat.service';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}
  @Post()
  getChatResponse(@Body() body: ChatDto) {
    return this.chatService.getChatResponse(body.incident);
  }
}
