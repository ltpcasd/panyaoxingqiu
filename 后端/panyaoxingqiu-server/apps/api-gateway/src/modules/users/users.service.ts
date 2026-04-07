import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { RedisService } from '@app/redis';
import { User } from '@app/database';
import { UserSetting } from '@app/database';
import { UpdateUserDto } from './dto/user.dto';

@Injectable()
export class UsersService {
  constructor(
    private dataSource: DataSource,
    private redisService: RedisService,
  ) {}

  async findById(id: string): Promise<Record<string, any>> {
    const userRepo = this.dataSource.getRepository(User);
    const user = await userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('用户不存在');
    return this.sanitizeUser(user);
  }

  async update(id: string, dto: UpdateUserDto): Promise<Record<string, any>> {
    const userRepo = this.dataSource.getRepository(User);
    const user = await userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('用户不存在');

    await userRepo.update(id, dto as any);
    
    // 清除缓存
    await this.redisService.del(`user:info:${id}`);
    
    const updated = await userRepo.findOne({ where: { id } });
    return this.sanitizeUser(updated!);
  }

  async updateAvatar(id: string, avatarUrl: string): Promise<Record<string, any>> {
    const userRepo = this.dataSource.getRepository(User);
    await userRepo.update(id, { avatarUrl });
    await this.redisService.del(`user:info:${id}`);
    return { success: true, avatarUrl };
  }

  async getSettings(userId: string): Promise<Record<string, any>> {
    const settingRepo = this.dataSource.getRepository(UserSetting);
    const setting = await settingRepo.findOne({ where: { userId } });
    return setting || {};
  }

  async updateSettings(userId: string, settings: Record<string, any>): Promise<Record<string, any>> {
    const settingRepo = this.dataSource.getRepository(UserSetting);
    let setting = await settingRepo.findOne({ where: { userId } });
    
    if (!setting) {
      setting = settingRepo.create({ userId, ...settings });
    } else {
      Object.assign(setting, settings);
    }
    
    await settingRepo.save(setting);
    return setting;
  }

  private sanitizeUser(user: User): Record<string, any> {
    return {
      id: user.id,
      nickname: user.nickname,
      avatarUrl: user.avatarUrl,
      gender: user.gender,
      country: user.country,
      province: user.province,
      city: user.city,
      language: user.language,
      createdAt: user.createdAt,
    };
  }
}
