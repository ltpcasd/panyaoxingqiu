import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService, LoginResult } from './auth.service';
import { DeviceLoginDto, LoginDto, RefreshTokenDto } from './dto/auth.dto';
import { JwtAuthGuard } from '@app/common';
import { CurrentUser } from '@app/common';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('device-login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '设备指纹登录（H5 无感登录）' })
  @ApiResponse({ status: 200, description: '登录成功' })
  async deviceLogin(@Body() dto: DeviceLoginDto) {
    return this.authService.deviceLogin(
      dto.deviceId,
      dto.nickname,
      dto.avatarUrl,
    );
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '微信小程序登录' })
  @ApiResponse({ status: 200, description: '登录成功' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.miniProgramLogin(
      loginDto.code,
      loginDto.encryptedData,
      loginDto.iv,
      loginDto.userInfo,
    );
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '刷新Token' })
  async refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshToken(dto.refreshToken);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '退出登录' })
  async logout(@CurrentUser('openid') openid: string) {
    return this.authService.logout(openid);
  }
}
