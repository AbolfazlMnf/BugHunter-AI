import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ChatDto {
  @ApiProperty({ description: 'The message content' })
  @IsNotEmpty()
  @IsString()
  incident!: string;
}
