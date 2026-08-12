import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ChatDto {
  @ApiProperty({ description: 'The message content' })
  @IsNotEmpty()
  @IsString()
  incident!: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'The session ID for the chat', required: false })
  sessionId?: string;
}
