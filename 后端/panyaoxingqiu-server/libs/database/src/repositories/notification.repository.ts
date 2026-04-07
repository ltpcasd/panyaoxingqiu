import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Notification } from '../entities/notification.entity';

@Injectable()
export class NotificationRepository extends Repository<Notification> {
  constructor(private dataSource: DataSource) {
    super(Notification, dataSource.createEntityManager());
  }

  async findById(id: string): Promise<Notification | null> {
    return this.findOne({ where: { id } });
  }

  async findByUserId(userId: string, page = 1, pageSize = 20): Promise<[Notification[], number]> {
    return this.findAndCount({
      where: { userId, status: 1 },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
  }

  async findUnreadByUserId(userId: string): Promise<Notification[]> {
    return this.find({
      where: { userId, isRead: 0, status: 1 },
      order: { createdAt: 'DESC' },
    });
  }

  async countUnread(userId: string): Promise<number> {
    return this.count({
      where: { userId, isRead: 0, status: 1 },
    });
  }

  async createNotification(notificationData: Partial<Notification>): Promise<Notification> {
    const notification = this.create(notificationData);
    return this.save(notification);
  }

  async markAsRead(id: string): Promise<void> {
    await this.update(id, { isRead: 1, readAt: new Date() });
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.createQueryBuilder()
      .update(Notification)
      .set({ isRead: 1, readAt: new Date() })
      .where('userId = :userId AND isRead = 0', { userId })
      .execute();
  }

  async deleteNotification(id: string): Promise<void> {
    await this.update(id, { status: 0 });
  }
}
