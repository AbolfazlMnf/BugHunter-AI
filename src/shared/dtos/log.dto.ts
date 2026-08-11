import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { LogType } from '../schemas/log.schema';

export class LogDto {
  @IsString()
  @IsNotEmpty()
  content!: string;
  @IsString()
  @IsNotEmpty()
  url!: string;
  @IsEnum(LogType)
  @IsNotEmpty()
  type!: LogType;
}
