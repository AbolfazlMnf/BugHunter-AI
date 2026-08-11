import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsPositive } from 'class-validator';

export enum sortOrder {
  Desc = `DESC`,
  Asc = `ASC`,
}

export class GeneralQueryDto {
  @IsOptional()
  @IsPositive()
  @ApiPropertyOptional({ description: `default=1` })
  limit?: number;

  @IsOptional()
  @IsPositive()
  @ApiPropertyOptional({ description: `default=1` })
  page?: number;

  @IsOptional()
  @IsEnum(sortOrder)
  @ApiPropertyOptional({
    enum: sortOrder,
    description: `default = ${sortOrder.Desc} `,
  })
  order?: sortOrder;
}
