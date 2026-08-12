import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class SessionIdDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The session ID for the chat session',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: true,
  })
  sessionId!: string;
}
