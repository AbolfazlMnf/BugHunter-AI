import { ApiProperty } from '@nestjs/swagger';
import { Allow, IsArray, IsNotEmpty } from 'class-validator';

export class FileDto {
  @ApiProperty({
    type: `string`,
    format: `binary`,
    required: true,
  })
  @Allow()
  file!: any;
}

export class FilesDto {
  @ApiProperty({
    type: `array`,
    items: {
      type: `string`,
      format: `binary`,
    },
    required: true,
  })
  @Allow()
  files!: any;
}

export class DeleteFileDto {
  @IsArray()
  @IsNotEmpty()
  @ApiProperty({
    type: `array`,
    items: {
      type: `string`,
    },
    required: true,
  })
  filePaths!: string[];
}
