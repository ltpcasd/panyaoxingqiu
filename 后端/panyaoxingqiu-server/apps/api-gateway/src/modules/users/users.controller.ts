import {
  Controller,
  Get,
  Put,
  Body,
  UseGuards,
  Param,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/user.dto';
import { JwtAuthGuard } from '@app/common';
import { CurrentUserId } from '@app/common';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: '获取当前用户信息' })
  async getMe(@CurrentUserId() userId: string) {
    return this.usersService.findById(userId);
  }

  @Put('me')
  @ApiOperation({ summary: '更新用户信息' })
  async updateMe(
    @CurrentUserId() userId: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(userId, updateUserDto);
  }

  @Put('me/avatar')
  @ApiOperation({ summary: '更新用户头像' })
  async updateAvatar(
    @CurrentUserId() userId: string,
    @Body() body: { avatarUrl: string },
  ) {
    return this.usersService.updateAvatar(userId, body.avatarUrl);
  }

  @Get('me/settings')
  @ApiOperation({ summary: '获取用户设置' })
  async getSettings(@CurrentUserId() userId: string) {
    return this.usersService.getSettings(userId);
  }

  @Put('me/settings')
  @ApiOperation({ summary: '更新用户设置' })
  async updateSettings(
    @CurrentUserId() userId: string,
    @Body() settings: Record<string, any>,
  ) {
    return this.usersService.updateSettings(userId, settings);
  }
}
