import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class changePasswordDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  newPassword!: string;
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  oldPassword!: string;
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  id!: string;
}
