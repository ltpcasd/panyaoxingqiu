import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsNumber, IsString, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class NotificationQueryDto {
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

  @ApiPropertyOptional({ description: '通知类型' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  notifyType?: number;
}

export class SubscribeNotificationDto {
  @ApiPropertyOptional({ description: '微信订阅消息模板ID' })
  @IsOptional()
  @IsString()
  templateId?: string;
}
