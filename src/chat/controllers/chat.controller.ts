import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  Query,
  Delete,
} from '@nestjs/common';
import { ChatDto } from '../dtos/chat.dto';
import { ChatService } from '../services/chat.service';
import { User } from 'src/shared/decorators/user.decorator';
import { JwtGuard } from 'src/shared/guards/jwt.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { SessionIdDto } from '../dtos/sessionId.dto';

@Controller('chat')
@UseGuards(JwtGuard)
@ApiBearerAuth()
export class ChatController {
  constructor(private readonly chatService: ChatService) {}
  @Get(`history`)
  getChatHistory(@User() userId: string, @Query() query: SessionIdDto) {
    const memoryKey = this.chatService.generateMemoryKey(
      userId,
      query.sessionId,
    );
    return this.chatService.getChatHistory(memoryKey);
  }
  @Post('incident')
  getChatResponse(@Body() body: ChatDto, @User() userId: string) {
    return this.chatService.getChatResponse(
      userId,
      body.sessionId,
      body.incident,
    );
  }
  @Delete(`history`)
  clearChatHistory(@User() userId: string, @Query() query: SessionIdDto) {
    return this.chatService.clearChatHistory(userId, query.sessionId);
  }
}
