import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNumber,
  IsArray,
  IsIn,
  Min,
  Max,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class SubmitAnswerDto {
  @ApiProperty({ description: '题目ID' })
  @IsString()
  questionId: string;

  @ApiProperty({ description: '选择的答案', example: 'A' })
  @IsString()
  @IsIn(['A', 'B', 'C', 'D'])
  answer: string;
}

export class SubmitQuizDto {
  @ApiProperty({ description: '答题列表', type: [SubmitAnswerDto] })
  @IsArray()
  answers: SubmitAnswerDto[];
}

export class QuizQueryDto {
  @ApiPropertyOptional({ description: '页码', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: '每页数量', default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(20)
  pageSize?: number = 10;

  @ApiPropertyOptional({ description: '题目分类', example: '生活习惯' })
  @IsOptional()
  @IsString()
  category?: string;
}

export class QuizRecordQueryDto {
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
}
