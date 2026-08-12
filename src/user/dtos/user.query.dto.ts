import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsPositive } from 'class-validator';
import { Sort, sortOrder } from 'src/shared/dtos/query.dto';

export enum UserSort {
  LastName = `lastName`,
  CreatedAt = `createdAt`,
  UpdatedAt = `updatedAt`,
}

export class UserQueryDto {
  @IsOptional()
  @IsPositive()
  @ApiPropertyOptional({ description: `default = 5` })
  limit?: number;

  @IsOptional()
  @IsPositive()
  @ApiPropertyOptional({
    description: `default = 1`,
  })
  page?: number;

  @IsOptional()
  @ApiPropertyOptional()
  lastName?: string;
  @IsOptional()
  @ApiPropertyOptional()
  email?: string;

  @IsOptional()
  @IsEnum(Sort)
  @ApiPropertyOptional({
    enum: Sort,
    description: `default = ${Sort.CreatedAt} `,
  })
  sort?: Sort;

  @IsOptional()
  @IsEnum(sortOrder)
  @ApiPropertyOptional({ enum: sortOrder, description: `default = DESC` })
  order?: sortOrder;
}
