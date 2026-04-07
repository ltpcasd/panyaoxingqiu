import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NotificationRepository, UserRepository } from '@app/database';
import { RedisService } from '@app/redis';
import { NotificationQueryDto } from './dto/notification.dto';
import axios from 'axios';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly notificationRepository: NotificationRepository,
    private readonly userRepository: UserRepository,
    private readonly redisService: RedisService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * 获取通知列表
   */
  async getNotifications(userId: string, query: NotificationQueryDto): Promise<{
    list: Record<string, any>[];
    total: number;
    page: number;
    pageSize: number;
    unreadCount: number;
  }> {
    const page = query.page || 1;
    const pageSize = query.pageSize || 20;
    const skip = (page - 1) * pageSize;

    const qb = this.notificationRepository
      .createQueryBuilder('n')
      .where('n.user_id = :userId', { userId })
      .orderBy('n.created_at', 'DESC')
      .skip(skip)
      .take(pageSize);

    if (query.notifyType) {
      qb.andWhere('n.notify_type = :notifyType', { notifyType: query.notifyType });
    }

    const [notifications, total] = await qb.getManyAndCount();

    const unreadCount = await this.notificationRepository.count({
      where: { userId, isRead: 0 },
    });

    return {
      list: notifications.map((n) => this.formatNotification(n)),
      total,
      page,
      pageSize,
      unreadCount,
    };
  }

  /**
   * 标记通知已读
   */
  async markAsRead(userId: string, notificationId: string): Promise<{ message: string }> {
    await this.notificationRepository.update(
      { id: notificationId, userId },
      { isRead: 1, readAt: new Date() },
    );
    return { message: '已标记为已读' };
  }

  /**
   * 全部标记已读
   */
  async markAllAsRead(userId: string): Promise<{ message: string }> {
    await this.notificationRepository
      .createQueryBuilder()
      .update()
      .set({ isRead: 1, readAt: new Date() })
      .where('user_id = :userId AND is_read = 0', { userId })
      .execute();

    return { message: '已全部标记为已读' };
  }

  /**
   * 获取未读数量
   */
  async getUnreadCount(userId: string): Promise<{ unreadCount: number }> {
    const unreadCount = await this.notificationRepository.count({
      where: { userId, isRead: 0 },
    });
    return { unreadCount };
  }

  /**
   * 创建系统通知（内部调用）
   */
  async createNotification(data: {
    userId: string;
    title: string;
    content: string;
    notifyType: number;
    extraData?: Record<string, any>;
  }): Promise<void> {
    await this.notificationRepository.save(
      this.notificationRepository.create({
        userId: data.userId,
        title: data.title,
        content: data.content,
        notifyType: data.notifyType,
        extraData: data.extraData ? JSON.stringify(data.extraData) : null,
        isRead: 0,
      }),
    );
  }

  /**
   * 发送微信订阅消息
   */
  async sendWxSubscribeMessage(data: {
    toUser: string; // 用户openid
    templateId: string;
    page?: string;
    data: Record<string, { value: string }>;
  }): Promise<boolean> {
    try {
      const accessToken = await this.getWxAccessToken();
      if (!accessToken) return false;

      const url = `https://api.weixin.qq.com/cgi-bin/message/subscribe/send?access_token=${accessToken}`;

      const response = await axios.post(url, {
        touser: data.toUser,
        template_id: data.templateId,
        page: data.page,
        data: data.data,
      });

      return response.data?.errcode === 0;
    } catch (error) {
      console.error('发送微信订阅消息失败:', error);
      return false;
    }
  }

  /**
   * 获取微信Access Token（带Redis缓存）
   */
  private async getWxAccessToken(): Promise<string | null> {
    // 先从Redis获取
    const cached = await this.redisService.getWxAccessToken();
    if (cached) return cached;

    const appId = this.configService.get<string>('WX_APPID');
    const appSecret = this.configService.get<string>('WX_SECRET');

    if (!appId || !appSecret) return null;

    try {
      const response = await axios.get(
        `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appId}&secret=${appSecret}`,
      );

      if (response.data?.access_token) {
        // 缓存7000秒（微信AccessToken有效期7200秒）
        await this.redisService.setWxAccessToken(response.data.access_token, 7000);
        return response.data.access_token;
      }
    } catch (error) {
      console.error('获取微信AccessToken失败:', error);
    }

    return null;
  }

  /**
   * 格式化通知数据
   */
  private formatNotification(notification: any): Record<string, any> {
    return {
      id: notification.id,
      userId: notification.userId,
      title: notification.title,
      content: notification.content,
      notifyType: notification.notifyType,
      notifyTypeLabel: this.getNotifyTypeLabel(notification.notifyType),
      extraData: notification.extraData ? JSON.parse(notification.extraData) : null,
      isRead: notification.isRead === 1,
      readAt: notification.readAt,
      createdAt: notification.createdAt,
    };
  }

  private getNotifyTypeLabel(notifyType: number): string {
    const labels: Record<number, string> = {
      1: '系统通知',
      2: '配对通知',
      3: '互动通知',
      4: '任务提醒',
      5: '纪念日提醒',
    };
    return labels[notifyType] || '通知';
  }
}
