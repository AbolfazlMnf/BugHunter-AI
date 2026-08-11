import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { Role } from '../Schema/user.schema';

export class AuthDto {
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  @ApiProperty({ required: true })
  email!: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ required: true })
  password!: string;
}

export class RoleDto {
  @IsEnum(Role)
  @IsNotEmpty()
  @ApiProperty({ required: true, enum: Role })
  role!: Role;
}
