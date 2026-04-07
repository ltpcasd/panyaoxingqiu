import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNumber,
  IsDateString,
  Min,
  Max,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class TaskQueryDto {
  @ApiPropertyOptional({ description: '页码', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: '每页数量', default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(50)
  pageSize?: number = 20;

  @ApiPropertyOptional({ description: '任务类型 1-日常 2-周任务 3-挑战', example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  taskType?: number;

  @ApiPropertyOptional({ description: '状态 0-未完成 1-已完成', example: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  status?: number;
}

export class CompleteTaskDto {
  @ApiPropertyOptional({ description: '完成备注' })
  @IsOptional()
  @IsString()
  @MaxLength(256)
  remark?: string;

  @ApiPropertyOptional({ description: '完成证明图片URL' })
  @IsOptional()
  @IsString()
  proofImage?: string;
}
