import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CouplesService } from './couples.service';
import { UpdateCoupleDto } from './dto/couple.dto';
import { JwtAuthGuard } from '@app/common';
import { CurrentUserId } from '@app/common';

@ApiTags('Couples')
@Controller('couples')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT')
export class CouplesController {
  constructor(private readonly couplesService: CouplesService) {}

  @Post()
  @ApiOperation({ summary: '创建配对（获取配对码）' })
  async createPairCode(@CurrentUserId() userId: string) {
    return this.couplesService.createPairCode(userId);
  }

  @Post('pair-code')
  @ApiOperation({ summary: '生成配对码（别名）' })
  async generatePairCode(@CurrentUserId() userId: string) {
    return this.couplesService.createPairCode(userId);
  }

  @Get('pair-code/:code')
  @ApiOperation({ summary: '查询配对码' })
  async getPairCode(
    @Param('code') code: string,
    @CurrentUserId() userId: string,
  ) {
    return this.couplesService.verifyPairCode(code, userId);
  }

  @Post('join')
  @ApiOperation({ summary: '加入配对' })
  async joinCouple(
    @CurrentUserId() userId: string,
    @Body() body: { pairCode: string; anniversaryDate?: string },
  ) {
    return this.couplesService.bindCouple(userId, body.pairCode, body.anniversaryDate);
  }

  @Get('me')
  @ApiOperation({ summary: '获取当前配对信息' })
  async getMyCouple(@CurrentUserId() userId: string) {
    return this.couplesService.getCoupleByUserId(userId);
  }

  @Get('me/status')
  @ApiOperation({ summary: '获取当前用户的配对状态' })
  async getMyCoupleStatus(@CurrentUserId() userId: string) {
    return this.couplesService.getCoupleStatus(userId);
  }

  @Put('me')
  @ApiOperation({ summary: '更新配对信息' })
  async updateCouple(
    @CurrentUserId() userId: string,
    @Body() updateDto: UpdateCoupleDto,
  ) {
    return this.couplesService.updateCouple(userId, updateDto);
  }

  @Delete('me')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '解除配对' })
  async dissolveCouple(@CurrentUserId() userId: string) {
    return this.couplesService.dissolveCouple(userId);
  }

  @Post('me/bind')
  @ApiOperation({ summary: '绑定配对（通过配对码）' })
  async bindCouple(
    @CurrentUserId() userId: string,
    @Body() body: { pairCode: string; anniversaryDate?: string },
  ) {
    return this.couplesService.bindCouple(userId, body.pairCode, body.anniversaryDate);
  }

  @Post('me/avatar')
  @ApiOperation({ summary: '更新双人头像' })
  async updateCoupleAvatar(
    @CurrentUserId() userId: string,
    @Body() body: { coupleAvatar: string },
  ) {
    return this.couplesService.updateCoupleAvatar(userId, body.coupleAvatar);
  }

  @Put('me/background')
  @ApiOperation({ summary: '更新主页背景图' })
  async updateBackground(
    @CurrentUserId() userId: string,
    @Body() body: { backgroundImage: string },
  ) {
    return this.couplesService.updateBackground(userId, body.backgroundImage);
  }

  @Get('verify')
  @ApiOperation({ summary: '验证配对码' })
  async verifyPairCode(
    @Query('code') pairCode: string,
    @CurrentUserId() userId: string,
  ) {
    return this.couplesService.verifyPairCode(pairCode, userId);
  }
}
