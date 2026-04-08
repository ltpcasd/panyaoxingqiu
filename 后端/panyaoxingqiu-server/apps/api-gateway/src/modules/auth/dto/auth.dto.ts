export class DeviceLoginDto {
  /**
   * 设备唯一标识（H5 端生成的 UUID）
   */
  deviceId: string;

  /**
   * 用户昵称（可选，首次登录时提供）
   */
  nickname?: string;

  /**
   * 用户头像（可选）
   */
  avatarUrl?: string;
}

export class LoginDto {
  /**
   * 微信登录 code
   */
  code: string;

  /**
   * 加密数据（可选，用于获取更多用户信息）
   */
  encryptedData?: string;

  /**
   * 初始向量
   */
  iv?: string;

  /**
   * 用户信息（可选）
   */
  userInfo?: {
    nickName?: string;
    avatarUrl?: string;
    gender?: number;
    country?: string;
    province?: string;
    city?: string;
    language?: string;
  };
}

export class RefreshTokenDto {
  refreshToken: string;
}

export class UpdateProfileDto {
  nickname?: string;
  avatarUrl?: string;
  gender?: number;
}

export class LoginResponseDto {
  token: string;
  expiresIn: number;
  userInfo: {
    id: string;
    nickname: string;
    avatarUrl: string;
    gender: number;
    coupleId?: string;
  };
  coupleInfo?: {
    id: string;
    partnerId: string;
    partnerNickname: string;
    partnerAvatarUrl: string;
    anniversaryDate: string;
    togetherDays: number;
    intimacyScore: number;
    level: number;
    levelTitle: string;
    coupleAvatar: string;
    backgroundImage: string;
  };
}
