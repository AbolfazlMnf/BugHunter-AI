import { ApiProperty } from '@nestjs/swagger';
import { Allow } from 'class-validator';

export class UploadProjectDto {
  @ApiProperty({
    type: `string`,
    format: `binary`,
    required: true,
  })
  @Allow()
  file!: any;
}
