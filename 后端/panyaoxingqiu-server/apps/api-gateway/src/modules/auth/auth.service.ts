import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as crypto from 'crypto';
import { RedisService } from '@app/redis';
import { User } from '@app/database';
import { UserSetting } from '@app/database';
import { Couple } from '@app/database';
import { calculateTogetherDays } from '@app/common';

interface WxSession {
  openid: string;
  session_key: string;
  unionid?: string;
  errcode?: number;
  errmsg?: string;
}

export interface LoginResult {
  token: string;
  expiresIn: number;
  userInfo: Record<string, any>;
  coupleInfo?: Record<string, any>;
}

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private redisService: RedisService,
    private dataSource: DataSource,
  ) {}

  /**
   * 设备指纹登录（H5 无感登录）
   */
  async deviceLogin(
    deviceId: string,
    nickname?: string,
    avatarUrl?: string,
  ): Promise<LoginResult> {
    // 1. 查询或创建用户（用 deviceId 作为 openid 的替代）
    const userRepo = this.dataSource.getRepository(User);
    let user = await userRepo.findOne({ where: { openid: deviceId } });

    if (!user) {
      // 首次登录，创建用户
      const newUser = userRepo.create({
        openid: deviceId,
        unionid: null,
        nickname: nickname || `用户_${deviceId.substring(0, 8)}`,
        avatarUrl: avatarUrl || 'https://mmbiz.qpic.cn/mmbiz/icTdbqWbO6DwQiaviaF9TqPFshTZ5HicGyVe6T8bDcxIw3PCbJQXTw9Vlz4icXcQmHImtNZSrWQtvW2QAca5wN9T8ibA/0',
        gender: 1,
        country: '中国',
        province: '北京',
        city: '北京',
        language: 'zh_CN',
        status: 1,
      });
      user = await userRepo.save(newUser);

      // 创建用户设置
      const settingRepo = this.dataSource.getRepository(UserSetting);
      const setting = settingRepo.create({ userId: user.id });
      await settingRepo.save(setting);
    } else if (nickname) {
      // 更新用户信息
      await userRepo.update(user.id, {
        nickname: nickname || user.nickname,
        avatarUrl: avatarUrl || user.avatarUrl,
      });
      user = await userRepo.findOne({ where: { id: user.id } });
    }

    if (user.status === 0) {
      throw new UnauthorizedException('账号已被禁用');
    }

    // 2. 生成JWT Token
    const payload = { userId: user.id, openid: user.openid };
    const token = await this.jwtService.signAsync(payload);
    const expiresIn = 7 * 24 * 3600;

    // 3. 缓存登录态
    await this.redisService.setUserSession(user.openid, user.id, token, expiresIn);

    // 4. 查询配对信息
    const coupleInfo = await this.getCoupleInfo(user.id);

    return {
      token,
      expiresIn,
      userInfo: this.sanitizeUserInfo(user),
      coupleInfo,
    };
  }

  /**
   * 微信小程序登录
   */
  async miniProgramLogin(
    code: string,
    encryptedData?: string,
    iv?: string,
    userInfo?: Record<string, any>,
  ): Promise<LoginResult> {
    // 1. 获取微信session
    const wxSession = await this.getWxSession(code);

    // 2. 查询或创建用户
    const userRepo = this.dataSource.getRepository(User);
    let user = await userRepo.findOne({ where: { openid: wxSession.openid } });

    if (!user) {
      // 首次登录，创建用户
      const newUser = userRepo.create({
        openid: wxSession.openid,
        unionid: wxSession.unionid || null,
        nickname: userInfo?.nickName || `测试用户_${code.substring(0, 6)}`,
        avatarUrl: userInfo?.avatarUrl || 'https://mmbiz.qpic.cn/mmbiz/icTdbqWbO6DwQiaviaF9TqPFshTZ5HicGyVe6T8bDcxIw3PCbJQXTw9Vlz4icXcQmHImtNZSrWQtvW2QAca5wN9T8ibA/0',
        gender: userInfo?.gender || 1,
        country: userInfo?.country || '中国',
        province: userInfo?.province || '北京',
        city: userInfo?.city || '北京',
        language: userInfo?.language || 'zh_CN',
        status: 1,
      });
      user = await userRepo.save(newUser);

      // 创建用户设置
      const settingRepo = this.dataSource.getRepository(UserSetting);
      const setting = settingRepo.create({ userId: user.id });
      await settingRepo.save(setting);
    } else if (userInfo?.nickName) {
      // 更新用户信息
      await userRepo.update(user.id, {
        nickname: userInfo.nickName,
        avatarUrl: userInfo.avatarUrl || user.avatarUrl,
        gender: userInfo.gender || user.gender,
      });
      user = await userRepo.findOne({ where: { id: user.id } });
    }

    if (user.status === 0) {
      throw new UnauthorizedException('账号已被禁用');
    }

    // 3. 生成JWT Token
    const payload = { userId: user.id, openid: user.openid };
    const token = await this.jwtService.signAsync(payload);
    const expiresIn = 7 * 24 * 3600;

    // 4. 缓存登录态
    await this.redisService.setUserSession(user.openid, user.id, token, expiresIn);

    // 5. 查询配对信息
    const coupleInfo = await this.getCoupleInfo(user.id);

    return {
      token,
      expiresIn,
      userInfo: this.sanitizeUserInfo(user),
      coupleInfo,
    };
  }

  /**
   * 刷新Token
   */
  async refreshToken(refreshToken: string): Promise<{ token: string; expiresIn: number }> {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken);
      const newToken = await this.jwtService.signAsync({
        userId: payload.userId,
        openid: payload.openid,
      });
      return { token: newToken, expiresIn: 7 * 24 * 3600 };
    } catch {
      throw new UnauthorizedException('Token无效或已过期');
    }
  }

  /**
   * 退出登录
   */
  async logout(openid: string): Promise<{ success: boolean }> {
    await this.redisService.deleteUserSession(openid);
    return { success: true };
  }

  /**
   * 获取微信Session
   */
  private async getWxSession(code: string): Promise<WxSession> {
    const appId = this.configService.get('WX_APPID');
    const appSecret = this.configService.get('WX_SECRET');
    const nodeEnv = this.configService.get('NODE_ENV', 'development');

    // 开发环境下，如果微信配置无效，使用模拟登录
    if (nodeEnv === 'development' && (!appId || !appSecret || appId === 'your_wechat_appid_here')) {
      console.log('⚠️ 开发环境：使用模拟登录（微信配置无效或未配置）');
      // 使用code作为openid进行模拟登录
      return {
        openid: `test_openid_${code}`,
        session_key: `test_session_${Date.now()}`,
        unionid: null,
      };
    }

    if (!appId || !appSecret) {
      throw new BadRequestException('微信小程序配置错误');
    }

    const url = 'https://api.weixin.qq.com/sns/jscode2session';
    const response = await axios.get<WxSession>(url, {
      params: {
        appid: appId,
        secret: appSecret,
        js_code: code,
        grant_type: 'authorization_code',
      },
    });

    if (response.data.errcode) {
      throw new BadRequestException(`微信登录失败: ${response.data.errmsg}`);
    }

    return response.data;
  }

  /**
   * 解密微信加密数据
   */
  private decryptUserData(encryptedData: string, iv: string, sessionKey: string): Record<string, any> {
    const decipher = crypto.createDecipheriv(
      'aes-128-cbc',
      Buffer.from(sessionKey, 'base64'),
      Buffer.from(iv, 'base64'),
    );
    decipher.setAutoPadding(true);

    let decoded = decipher.update(encryptedData, 'base64', 'utf8');
    decoded += decipher.final('utf8');

    return JSON.parse(decoded);
  }

  /**
   * 获取配对信息
   */
  private async getCoupleInfo(userId: string): Promise<Record<string, any> | null> {
    try {
      const coupleRepo = this.dataSource.getRepository(Couple);
      const couple = await coupleRepo.findOne({
        where: [
          { userId1: userId, status: 1 },
          { userId2: userId, status: 1 },
        ],
      });

      if (!couple) return null;

      // 获取伴侣信息
      const partnerId = couple.userId1 === userId ? couple.userId2 : couple.userId1;
      const userRepo = this.dataSource.getRepository(User);
      const partner = await userRepo.findOne({ where: { id: partnerId } });

      if (!partner) return null;

      const togetherDays = couple.anniversaryDate
        ? calculateTogetherDays(couple.anniversaryDate)
        : 0;

      return {
        id: couple.id,
        partnerId: partner.id,
        partnerNickname: partner.nickname,
        partnerAvatarUrl: partner.avatarUrl,
        coupleAvatar: couple.coupleAvatar,
        backgroundImage: couple.backgroundImage,
        anniversaryDate: couple.anniversaryDate,
        togetherDays,
        intimacyScore: couple.intimacyScore,
        level: couple.level,
        levelTitle: couple.levelTitle,
      };
    } catch {
      return null;
    }
  }

  /**
   * 过滤用户信息（移除敏感数据）
   */
  private sanitizeUserInfo(user: User): Record<string, any> {
    return {
      id: user.id,
      nickname: user.nickname,
      avatarUrl: user.avatarUrl,
      gender: user.gender,
      country: user.country,
      province: user.province,
      city: user.city,
    };
  }
}
