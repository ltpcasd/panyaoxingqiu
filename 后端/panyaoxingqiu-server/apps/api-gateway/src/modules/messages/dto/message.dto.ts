import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsIn,
  IsNumber,
  Min,
  Max,
  MaxLength,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';

export class SendLetterDto {
  @ApiPropertyOptional({ description: '信件标题' })
  @IsOptional()
  @IsString()
  @MaxLength(128)
  title?: string;

  @ApiProperty({ description: '信件内容' })
  @IsString()
  content: string;

  @ApiPropertyOptional({ description: '心情标签', example: '思念' })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  mood?: string;

  @ApiPropertyOptional({ description: '信纸样式', example: 'romantic' })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  backgroundStyle?: string;
}

export class LetterQueryDto {
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

  @ApiPropertyOptional({ description: '类型: sent-发出 received-收到', example: 'received' })
  @IsOptional()
  @IsString()
  @IsIn(['sent', 'received'])
  type?: string;
}

export class MessageHistoryQueryDto {
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

  @ApiPropertyOptional({ description: '开始日期', example: '2024-01-01' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: '结束日期', example: '2024-12-31' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ description: '类型: sent-发出 received-收到 all-全部', example: 'all' })
  @IsOptional()
  @IsString()
  @IsIn(['sent', 'received', 'all'])
  type?: string = 'all';
}
