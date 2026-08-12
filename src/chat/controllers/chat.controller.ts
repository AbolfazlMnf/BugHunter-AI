import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ChatDto } from '../dtos/chat.dto';
import { ChatService } from '../services/chat.service';
import { User } from 'src/shared/decorators/user.decorator';
import { JwtGuard } from 'src/shared/guards/jwt.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('chat')
@UseGuards(JwtGuard)
@ApiBearerAuth()
export class ChatController {
  constructor(private readonly chatService: ChatService) {}
  @Get(`history`)
  getChatHistory(@User() userId: string) {
    return this.chatService.getChatHistory(userId);
  }
  @Post('incident')
  getChatResponse(@Body() body: ChatDto, @User() userId: string) {
    return this.chatService.getChatResponse(userId, body.incident);
  }
}
