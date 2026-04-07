import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { CoupleRepository } from '@app/database';
import { UserRepository } from '@app/database';
import { RedisService } from '@app/redis';
import { calculateLevel, calculateTogetherDays } from '@app/common';
import { UpdateCoupleDto } from './dto/couple.dto';

@Injectable()
export class CouplesService {
  constructor(
    private readonly coupleRepository: CoupleRepository,
    private readonly userRepository: UserRepository,
    private readonly redisService: RedisService,
  ) {}

  /**
   * 创建配对码（等待对方绑定）
   */
  async createPairCode(userId: string): Promise<{
    pairCode: string;
    coupleId?: string;
    status: number;
  }> {
    // 检查是否已有配对
    const existingCouple = await this.coupleRepository.findByUserId(userId);
    if (existingCouple && existingCouple.status === 1) {
      throw new ConflictException('您已经有配对了，请先解除当前配对');
    }

    // 检查是否有未绑定的配对码（status=0）
    const pendingCouple = await this.coupleRepository.findOne({
      where: [
        { userId1: userId, status: 0 },
        { userId2: userId, status: 0 },
      ],
    });

    if (pendingCouple) {
      return {
        pairCode: pendingCouple.pairCode,
        coupleId: pendingCouple.id,
        status: 0,
      };
    }

    // 生成新的配对码
    const pairCode = await this.coupleRepository.generatePairCode();

    const couple = await this.coupleRepository.createCouple({
      userId1: userId,
      pairCode,
      status: 0, // 等待绑定
    });

    // 缓存配对码信息
    await this.redisService.set(`pair_code:${pairCode}`, userId, 24 * 60 * 60);

    return {
      pairCode: couple.pairCode,
      coupleId: couple.id,
      status: 0,
    };
  }

  /**
   * 绑定配对（通过对方配对码）
   */
  async bindCouple(
    userId: string,
    pairCode: string,
    anniversaryDate?: string,
  ): Promise<Record<string, any>> {
    // 检查自己是否已有配对
    const myCouple = await this.coupleRepository.findByUserId(userId);
    if (myCouple && myCouple.status === 1) {
      throw new ConflictException('您已经有配对了');
    }

    // 查找对方的配对码
    const couple = await this.coupleRepository.findByPairCode(pairCode);
    if (!couple) {
      throw new NotFoundException('配对码不存在或已过期');
    }

    if (couple.status === 1) {
      throw new ConflictException('该配对码已被使用');
    }

    // 不能绑定自己
    if (couple.userId1 === userId) {
      throw new BadRequestException('不能绑定自己的配对码');
    }

    // 更新配对信息
    const updateData: any = {
      userId2: userId,
      status: 1, // 已绑定
    };

    if (anniversaryDate) {
      updateData.anniversaryDate = new Date(anniversaryDate);
    }

    await this.coupleRepository.updateCouple(couple.id, updateData);

    // 更新Redis中的配对信息
    await this.redisService.setUserCoupleId(couple.userId1, couple.id);
    await this.redisService.setUserCoupleId(userId, couple.id);

    // 删除配对码缓存
    await this.redisService.del(`pair_code:${pairCode}`);

    const updatedCouple = await this.coupleRepository.findById(couple.id);

    return this.formatCoupleResponse(updatedCouple!, userId);
  }

  /**
   * 获取当前用户的配对信息
   */
  async getCoupleByUserId(userId: string): Promise<Record<string, any> | null> {
    const couple = await this.coupleRepository.findByUserId(userId);
    if (!couple) {
      return null;
    }
    return this.formatCoupleResponse(couple, userId);
  }

  /**
   * 获取当前用户的配对状态
   */
  async getCoupleStatus(userId: string): Promise<{
    hasCouple: boolean;
    status: number;
    coupleId?: string;
    partnerId?: string;
  }> {
    const couple = await this.coupleRepository.findByUserId(userId);
    
    if (!couple) {
      return {
        hasCouple: false,
        status: -1, // 未创建配对
      };
    }

    // 确定对方ID
    const partnerId = couple.userId1 === userId ? couple.userId2 : couple.userId1;

    return {
      hasCouple: couple.status === 1,
      status: couple.status, // 0-等待绑定 1-已绑定 2-已解除
      coupleId: couple.id,
      partnerId: partnerId || undefined,
    };
  }

  /**
   * 更新配对信息
   */
  async updateCouple(userId: string, updateDto: UpdateCoupleDto): Promise<Record<string, any>> {
    const couple = await this.coupleRepository.findByUserId(userId);
    if (!couple) {
      throw new NotFoundException('未找到配对信息');
    }

    const updateData: any = {};

    if (updateDto.anniversaryDate) {
      updateData.anniversaryDate = new Date(updateDto.anniversaryDate);
      updateData.togetherDays = calculateTogetherDays(new Date(updateDto.anniversaryDate));
    }

    if (updateDto.coupleAvatar) {
      updateData.coupleAvatar = updateDto.coupleAvatar;
    }

    if (updateDto.backgroundImage) {
      updateData.backgroundImage = updateDto.backgroundImage;
    }

    await this.coupleRepository.updateCouple(couple.id, updateData);

    const updatedCouple = await this.coupleRepository.findById(couple.id);
    return this.formatCoupleResponse(updatedCouple!, userId);
  }

  /**
   * 更新双人头像
   */
  async updateCoupleAvatar(userId: string, coupleAvatar: string): Promise<Record<string, any>> {
    const couple = await this.coupleRepository.findByUserId(userId);
    if (!couple) {
      throw new NotFoundException('未找到配对信息');
    }

    await this.coupleRepository.updateCouple(couple.id, { coupleAvatar });

    const updatedCouple = await this.coupleRepository.findById(couple.id);
    return this.formatCoupleResponse(updatedCouple!, userId);
  }

  /**
   * 更新背景图
   */
  async updateBackground(userId: string, backgroundImage: string): Promise<Record<string, any>> {
    const couple = await this.coupleRepository.findByUserId(userId);
    if (!couple) {
      throw new NotFoundException('未找到配对信息');
    }

    await this.coupleRepository.updateCouple(couple.id, { backgroundImage });

    const updatedCouple = await this.coupleRepository.findById(couple.id);
    return this.formatCoupleResponse(updatedCouple!, userId);
  }

  /**
   * 解除配对
   */
  async dissolveCouple(userId: string): Promise<{ message: string }> {
    const couple = await this.coupleRepository.findByUserId(userId);
    if (!couple) {
      throw new NotFoundException('未找到配对信息');
    }

    await this.coupleRepository.updateCouple(couple.id, { status: 2 }); // 2=已解除

    // 清除 Redis 缓存
    await this.redisService.del(`user_couple:${couple.userId1}`);
    if (couple.userId2) {
      await this.redisService.del(`user_couple:${couple.userId2}`);
    }

    return { message: '配对已解除' };
  }

  /**
   * 验证配对码
   */
  async verifyPairCode(pairCode: string, userId: string): Promise<{
    valid: boolean;
    user?: Record<string, any>;
  }> {
    const couple = await this.coupleRepository.findByPairCode(pairCode);

    if (!couple || couple.status !== 0) {
      return { valid: false };
    }

    // 不能是自己的配对码
    if (couple.userId1 === userId) {
      throw new BadRequestException('不能使用自己的配对码');
    }

    // 获取配对码发起者信息
    const user = await this.userRepository.findById(couple.userId1);
    if (!user) {
      return { valid: false };
    }

    return {
      valid: true,
      user: {
        id: user.id,
        nickname: user.nickname,
        avatarUrl: user.avatarUrl,
      },
    };
  }

  /**
   * 增加亲密度
   */
  async addIntimacyScore(coupleId: string, score: number): Promise<void> {
    const couple = await this.coupleRepository.findById(coupleId);
    if (!couple) return;

    const newScore = (couple.intimacyScore || 0) + score;
    const { level, title } = calculateLevel(newScore);

    await this.coupleRepository.updateCouple(coupleId, {
      intimacyScore: newScore,
      level,
      levelTitle: title,
    });
  }

  /**
   * 格式化配对响应数据
   */
  private async formatCoupleResponse(
    couple: any,
    currentUserId: string,
  ): Promise<Record<string, any>> {
    // 获取配对双方用户信息
    const user1 = await this.userRepository.findById(couple.userId1);
    const user2 = couple.userId2 ? await this.userRepository.findById(couple.userId2) : null;

    const isUser1 = couple.userId1 === currentUserId;
    const me = isUser1 ? user1 : user2;
    const partner = isUser1 ? user2 : user1;

    // 计算在一起天数
    const togetherDays = couple.anniversaryDate
      ? calculateTogetherDays(new Date(couple.anniversaryDate))
      : 0;

    return {
      id: couple.id,
      pairCode: couple.pairCode,
      status: couple.status,
      coupleAvatar: couple.coupleAvatar,
      backgroundImage: couple.backgroundImage,
      anniversaryDate: couple.anniversaryDate,
      togetherDays,
      intimacyScore: couple.intimacyScore || 0,
      level: couple.level || 1,
      levelTitle: couple.levelTitle || '初识',
      me: me
        ? {
            id: me.id,
            nickname: me.nickname,
            avatarUrl: me.avatarUrl,
          }
        : null,
      partner: partner
        ? {
            id: partner.id,
            nickname: partner.nickname,
            avatarUrl: partner.avatarUrl,
          }
        : null,
      createdAt: couple.createdAt,
    };
  }
}
