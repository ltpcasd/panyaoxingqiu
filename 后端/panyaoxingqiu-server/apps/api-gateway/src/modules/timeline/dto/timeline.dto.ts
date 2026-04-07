import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNumber,
  IsDateString,
  IsArray,
  IsBoolean,
  Min,
  Max,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTimelineEventDto {
  @ApiProperty({ description: '事件类型 1-纪念日 2-日常 3-旅行', example: 2 })
  @IsNumber()
  @Min(1)
  @Max(3)
  eventType: number;

  @ApiProperty({ description: '标题', example: '我们的第一次约会' })
  @IsString()
  @MaxLength(128)
  title: string;

  @ApiPropertyOptional({ description: '内容' })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiProperty({ description: '事件日期', example: '2023-06-01' })
  @IsDateString()
  eventDate: string;

  @ApiPropertyOptional({ description: '地点' })
  @IsOptional()
  @IsString()
  @MaxLength(128)
  location?: string;

  @ApiPropertyOptional({ description: '天气' })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  weather?: string;

  @ApiPropertyOptional({ description: '心情' })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  mood?: string;

  @ApiPropertyOptional({ description: '图片数组', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ApiPropertyOptional({ description: '是否重要', default: false })
  @IsOptional()
  @IsBoolean()
  isImportant?: boolean;
}

export class UpdateTimelineEventDto {
  @ApiPropertyOptional({ description: '事件类型 1-纪念日 2-日常 3-旅行' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(3)
  eventType?: number;

  @ApiPropertyOptional({ description: '标题' })
  @IsOptional()
  @IsString()
  @MaxLength(128)
  title?: string;

  @ApiPropertyOptional({ description: '内容' })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({ description: '事件日期' })
  @IsOptional()
  @IsDateString()
  eventDate?: string;

  @ApiPropertyOptional({ description: '地点' })
  @IsOptional()
  @IsString()
  @MaxLength(128)
  location?: string;

  @ApiPropertyOptional({ description: '天气' })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  weather?: string;

  @ApiPropertyOptional({ description: '心情' })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  mood?: string;

  @ApiPropertyOptional({ description: '图片数组', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ApiPropertyOptional({ description: '是否重要' })
  @IsOptional()
  @IsBoolean()
  isImportant?: boolean;
}

export class TimelineQueryDto {
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

  @ApiPropertyOptional({ description: '事件类型' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  eventType?: number;

  @ApiPropertyOptional({ description: '年份', example: 2023 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  year?: number;
}
