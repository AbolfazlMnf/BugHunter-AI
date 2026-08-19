import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  Query,
  Delete,
  Param,
} from '@nestjs/common';
import { ChatDto, ChatQueryDto } from '../dtos/chat.dto';
import { ChatService } from '../services/chat.service';
import { User } from 'src/shared/decorators/user.decorator';
import { JwtGuard } from 'src/shared/guards/jwt.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { SessionIdDto } from '../dtos/sessionId.dto';
import { RetrievalService } from 'src/projects/services/retrieval.service';
import { ProjectsService } from 'src/projects/services/projects.service';

@Controller('chat')
@UseGuards(JwtGuard)
@ApiBearerAuth()
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly retrievalService: RetrievalService,
    private readonly projectService: ProjectsService,
  ) {}
  @Get(`history`)
  getChatHistory(@User() userId: string, @Query() query: SessionIdDto) {
    const memoryKey = this.chatService.generateMemoryKey(
      userId,
      query.sessionId,
    );
    return this.chatService.getChatHistory(memoryKey);
  }
  @Post('incident')
  async getChatResponse(
    @Body() body: ChatDto,
    @User() userId: string,
    @Query() queries: ChatQueryDto,
  ) {
    let retrievedChunks;
    if (queries.projectId) {
      const project = await this.projectService.findOne(queries.projectId);
      retrievedChunks = await this.retrievalService.retrievalIncident(
        body.incident,
        project._id.toString(),
        userId,
      );
    }

    return this.chatService.getChatResponse(
      userId,
      queries.sessionId,
      body.incident,
      retrievedChunks,
    );
  }

  @Delete(`history`)
  clearChatHistory(@User() userId: string, @Query() query: SessionIdDto) {
    return this.chatService.clearChatHistory(userId, query.sessionId);
  }
}
