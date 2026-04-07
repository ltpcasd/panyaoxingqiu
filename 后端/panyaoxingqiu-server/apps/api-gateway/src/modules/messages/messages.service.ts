import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { LetterRepository, CoupleRepository } from '@app/database';
import { CouplesService } from '../couples/couples.service';
import { SendLetterDto, LetterQueryDto, MessageHistoryQueryDto } from './dto/message.dto';

@Injectable()
export class MessagesService {
  constructor(
    private readonly letterRepository: LetterRepository,
    private readonly coupleRepository: CoupleRepository,
    private readonly couplesService: CouplesService,
  ) {}

  /**
   * 获取配对信息（必须已配对）
   */
  private async requireCouple(userId: string) {
    const couple = await this.coupleRepository.findByUserId(userId);
    if (!couple || couple.status !== 1) {
      throw new ForbiddenException('请先完成配对才能使用信箱功能');
    }
    return couple;
  }

  /**
   * 发送信件
   */
  async sendLetter(userId: string, dto: SendLetterDto): Promise<Record<string, any>> {
    const couple = await this.requireCouple(userId);

    // 确定接收者（对方）
    const receiverId = couple.userId1 === userId ? couple.userId2 : couple.userId1;
    if (!receiverId) {
      throw new ForbiddenException('对方尚未完成配对');
    }

    const letter = await this.letterRepository.save(
      this.letterRepository.create({
        coupleId: couple.id,
        senderId: userId,
        receiverId,
        title: dto.title || null,
        content: dto.content,
        mood: dto.mood || null,
        backgroundStyle: dto.backgroundStyle || 'default',
        isRead: 0,
        status: 1,
      }),
    );

    // 增加亲密度
    await this.couplesService.addIntimacyScore(couple.id, 20);

    return this.formatLetter(letter);
  }

  /**
   * 获取信件列表
   */
  async getLetters(userId: string, query: LetterQueryDto): Promise<{
    list: Record<string, any>[];
    total: number;
    page: number;
    pageSize: number;
    unreadCount: number;
  }> {
    const couple = await this.requireCouple(userId);

    const page = query.page || 1;
    const pageSize = query.pageSize || 20;
    const skip = (page - 1) * pageSize;

    const qb = this.letterRepository
      .createQueryBuilder('l')
      .where('l.couple_id = :coupleId', { coupleId: couple.id })
      .andWhere('l.status = 1')
      .orderBy('l.created_at', 'DESC')
      .skip(skip)
      .take(pageSize);

    if (query.type === 'sent') {
      qb.andWhere('l.sender_id = :userId', { userId });
    } else if (query.type === 'received') {
      qb.andWhere('l.receiver_id = :userId', { userId });
    }

    const [letters, total] = await qb.getManyAndCount();

    // 获取未读数量
    const unreadCount = await this.letterRepository.count({
      where: { coupleId: couple.id, receiverId: userId, isRead: 0, status: 1 },
    });

    return {
      list: letters.map((l) => this.formatLetter(l)),
      total,
      page,
      pageSize,
      unreadCount,
    };
  }

  /**
   * 获取信件详情（并标记已读）
   */
  async getLetterById(userId: string, letterId: string): Promise<Record<string, any>> {
    const couple = await this.requireCouple(userId);

    const letter = await this.letterRepository.findOne({
      where: { id: letterId, coupleId: couple.id, status: 1 },
    });

    if (!letter) {
      throw new NotFoundException('信件不存在');
    }

    // 标记已读（只有接收者可以标记）
    if (letter.receiverId === userId && letter.isRead === 0) {
      await this.letterRepository.update(letterId, {
        isRead: 1,
        readAt: new Date(),
      });
      letter.isRead = 1;
      letter.readAt = new Date();
    }

    return this.formatLetter(letter);
  }

  /**
   * 标记信件为已读
   */
  async markAsRead(letterId: string, userId: string): Promise<{ success: boolean; message: string }> {
    const couple = await this.coupleRepository.findByUserId(userId);
    if (!couple || couple.status !== 1) {
      throw new ForbiddenException('请先完成配对');
    }

    const letter = await this.letterRepository.findOne({
      where: { id: letterId, coupleId: couple.id, status: 1 },
    });

    if (!letter) {
      throw new NotFoundException('信件不存在');
    }

    // 只有接收者可以标记已读
    if (letter.receiverId !== userId) {
      throw new ForbiddenException('只有接收者可以标记信件为已读');
    }

    if (letter.isRead === 1) {
      return { success: true, message: '信件已经是已读状态' };
    }

    await this.letterRepository.update(letterId, {
      isRead: 1,
      readAt: new Date(),
    });

    return { success: true, message: '标记已读成功' };
  }

  /**
   * 删除信件（软删除）- 别名方法，用于兼容前端调用
   */
  async deleteMessage(letterId: string, userId: string): Promise<{ message: string }> {
    return this.deleteLetter(userId, letterId);
  }

  /**
   * 删除信件（软删除）
   */
  async deleteLetter(userId: string, letterId: string): Promise<{ message: string }> {
    const couple = await this.requireCouple(userId);

    const letter = await this.letterRepository.findOne({
      where: { id: letterId, coupleId: couple.id, status: 1 },
    });

    if (!letter) {
      throw new NotFoundException('信件不存在');
    }

    // 只有发送者或接收者可以删除
    if (letter.senderId !== userId && letter.receiverId !== userId) {
      throw new ForbiddenException('无权删除此信件');
    }

    await this.letterRepository.update(letterId, { status: 0 });

    return { message: '删除成功' };
  }

  /**
   * 获取未读信件数量
   */
  async getUnreadCount(userId: string): Promise<{ unreadCount: number }> {
    const couple = await this.coupleRepository.findByUserId(userId);
    if (!couple || couple.status !== 1) {
      return { unreadCount: 0 };
    }

    const unreadCount = await this.letterRepository.count({
      where: { coupleId: couple.id, receiverId: userId, isRead: 0, status: 1 },
    });

    return { unreadCount };
  }

  /**
   * 获取信件历史
   */
  async getMessageHistory(userId: string, query: MessageHistoryQueryDto): Promise<{
    list: Record<string, any>[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    const couple = await this.requireCouple(userId);

    const page = query.page || 1;
    const pageSize = query.pageSize || 20;
    const skip = (page - 1) * pageSize;

    const qb = this.letterRepository
      .createQueryBuilder('l')
      .where('l.couple_id = :coupleId', { coupleId: couple.id })
      .andWhere('l.status = 1')
      .orderBy('l.created_at', 'DESC')
      .skip(skip)
      .take(pageSize);

    // 根据类型筛选
    if (query.type === 'sent') {
      qb.andWhere('l.sender_id = :userId', { userId });
    } else if (query.type === 'received') {
      qb.andWhere('l.receiver_id = :userId', { userId });
    }

    // 根据日期范围筛选
    if (query.startDate) {
      const startDate = new Date(query.startDate);
      startDate.setHours(0, 0, 0, 0);
      qb.andWhere('l.created_at >= :startDate', { startDate });
    }

    if (query.endDate) {
      const endDate = new Date(query.endDate);
      endDate.setHours(23, 59, 59, 999);
      qb.andWhere('l.created_at <= :endDate', { endDate });
    }

    const [letters, total] = await qb.getManyAndCount();

    return {
      list: letters.map((l) => this.formatLetter(l)),
      total,
      page,
      pageSize,
    };
  }

  /**
   * 格式化信件数据
   */
  private formatLetter(letter: any): Record<string, any> {
    return {
      id: letter.id,
      coupleId: letter.coupleId,
      senderId: letter.senderId,
      receiverId: letter.receiverId,
      title: letter.title,
      content: letter.content,
      mood: letter.mood,
      backgroundStyle: letter.backgroundStyle || 'default',
      isRead: letter.isRead === 1,
      readAt: letter.readAt,
      createdAt: letter.createdAt,
    };
  }
}
