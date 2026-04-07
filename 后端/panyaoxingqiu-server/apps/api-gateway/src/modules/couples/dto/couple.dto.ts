import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsDateString,
  IsUrl,
  MaxLength,
} from 'class-validator';

export class CreateCoupleDto {
  @ApiPropertyOptional({ description: '纪念日', example: '2023-01-01' })
  @IsOptional()
  @IsDateString()
  anniversaryDate?: string;
}

export class UpdateCoupleDto {
  @ApiPropertyOptional({ description: '纪念日', example: '2023-01-01' })
  @IsOptional()
  @IsDateString()
  anniversaryDate?: string;

  @ApiPropertyOptional({ description: '双人头像URL' })
  @IsOptional()
  @IsString()
  @IsUrl()
  coupleAvatar?: string;

  @ApiPropertyOptional({ description: '背景图URL' })
  @IsOptional()
  @IsString()
  @IsUrl()
  backgroundImage?: string;
}

export class BindCoupleDto {
  @ApiProperty({ description: '对方的配对码', example: '5678' })
  @IsString()
  @MaxLength(4)
  pairCode: string;

  @ApiPropertyOptional({ description: '纪念日', example: '2023-01-01' })
  @IsOptional()
  @IsDateString()
  anniversaryDate?: string;
}

export class UpdateCoupleAvatarDto {
  @ApiProperty({ description: '双人头像URL' })
  @IsString()
  coupleAvatar: string;
}

export class UpdateBackgroundDto {
  @ApiProperty({ description: '背景图URL' })
  @IsString()
  backgroundImage: string;
}
