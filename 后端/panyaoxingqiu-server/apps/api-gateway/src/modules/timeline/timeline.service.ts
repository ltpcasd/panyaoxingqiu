import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { TimelineRepository, CoupleRepository } from '@app/database';
import { CouplesService } from '../couples/couples.service';
import {
  CreateTimelineEventDto,
  UpdateTimelineEventDto,
  TimelineQueryDto,
} from './dto/timeline.dto';

@Injectable()
export class TimelineService {
  constructor(
    private readonly timelineRepository: TimelineRepository,
    private readonly coupleRepository: CoupleRepository,
    private readonly couplesService: CouplesService,
  ) {}

  /**
   * 获取配对ID（必须已配对）
   */
  private async requireCoupleId(userId: string): Promise<string> {
    const couple = await this.coupleRepository.findByUserId(userId);
    if (!couple || couple.status !== 1) {
      throw new ForbiddenException('请先完成配对才能使用此功能');
    }
    return couple.id;
  }

  /**
   * 创建时光轴事件
   */
  async createEvent(
    userId: string,
    dto: CreateTimelineEventDto,
  ): Promise<Record<string, any>> {
    const coupleId = await this.requireCoupleId(userId);

    const event = await this.timelineRepository.save(
      this.timelineRepository.create({
        coupleId,
        creatorId: userId,
        eventType: dto.eventType,
        title: dto.title,
        content: dto.content || null,
        eventDate: new Date(dto.eventDate),
        location: dto.location || null,
        weather: dto.weather || null,
        mood: dto.mood || null,
        images: dto.images || null,
        isImportant: dto.isImportant ? 1 : 0,
        status: 1,
      }),
    );

    // 增加亲密度
    await this.couplesService.addIntimacyScore(coupleId, 10);

    return this.formatEvent(event);
  }

  /**
   * 获取时光轴列表
   */
  async getEvents(
    userId: string,
    query: TimelineQueryDto,
  ): Promise<{ list: Record<string, any>[]; total: number; page: number; pageSize: number }> {
    const couple = await this.coupleRepository.findByUserId(userId);
    if (!couple || couple.status !== 1) {
      return { list: [], total: 0, page: query.page || 1, pageSize: query.pageSize || 20 };
    }

    const page = query.page || 1;
    const pageSize = query.pageSize || 20;
    const skip = (page - 1) * pageSize;

    const qb = this.timelineRepository
      .createQueryBuilder('te')
      .where('te.couple_id = :coupleId', { coupleId: couple.id })
      .andWhere('te.status = 1')
      .orderBy('te.event_date', 'DESC')
      .skip(skip)
      .take(pageSize);

    if (query.eventType) {
      qb.andWhere('te.event_type = :eventType', { eventType: query.eventType });
    }

    if (query.year) {
      qb.andWhere('YEAR(te.event_date) = :year', { year: query.year });
    }

    const [events, total] = await qb.getManyAndCount();

    return {
      list: events.map((e) => this.formatEvent(e)),
      total,
      page,
      pageSize,
    };
  }

  /**
   * 获取单个事件详情
   */
  async getEventById(userId: string, eventId: string): Promise<Record<string, any>> {
    const couple = await this.coupleRepository.findByUserId(userId);
    if (!couple || couple.status !== 1) {
      throw new ForbiddenException('请先完成配对');
    }

    const event = await this.timelineRepository.findOne({
      where: { id: eventId, coupleId: couple.id, status: 1 },
    });

    if (!event) {
      throw new NotFoundException('事件不存在');
    }

    return this.formatEvent(event);
  }

  /**
   * 更新时光轴事件
   */
  async updateEvent(
    userId: string,
    eventId: string,
    dto: UpdateTimelineEventDto,
  ): Promise<Record<string, any>> {
    const couple = await this.coupleRepository.findByUserId(userId);
    if (!couple || couple.status !== 1) {
      throw new ForbiddenException('请先完成配对');
    }

    const event = await this.timelineRepository.findOne({
      where: { id: eventId, coupleId: couple.id, status: 1 },
    });

    if (!event) {
      throw new NotFoundException('事件不存在');
    }

    // 只有创建者可以编辑
    if (event.creatorId !== userId) {
      throw new ForbiddenException('只有创建者可以编辑此事件');
    }

    const updateData: any = {};
    if (dto.eventType !== undefined) updateData.eventType = dto.eventType;
    if (dto.title !== undefined) updateData.title = dto.title;
    if (dto.content !== undefined) updateData.content = dto.content;
    if (dto.eventDate !== undefined) updateData.eventDate = new Date(dto.eventDate);
    if (dto.location !== undefined) updateData.location = dto.location;
    if (dto.weather !== undefined) updateData.weather = dto.weather;
    if (dto.mood !== undefined) updateData.mood = dto.mood;
    if (dto.images !== undefined) updateData.images = dto.images;
    if (dto.isImportant !== undefined) updateData.isImportant = dto.isImportant ? 1 : 0;

    await this.timelineRepository.update(eventId, updateData);

    const updated = await this.timelineRepository.findOne({ where: { id: eventId } });
    return this.formatEvent(updated!);
  }

  /**
   * 删除时光轴事件（软删除）
   */
  async deleteEvent(userId: string, eventId: string): Promise<{ message: string }> {
    const couple = await this.coupleRepository.findByUserId(userId);
    if (!couple || couple.status !== 1) {
      throw new ForbiddenException('请先完成配对');
    }

    const event = await this.timelineRepository.findOne({
      where: { id: eventId, coupleId: couple.id, status: 1 },
    });

    if (!event) {
      throw new NotFoundException('事件不存在');
    }

    // 只有创建者可以删除
    if (event.creatorId !== userId) {
      throw new ForbiddenException('只有创建者可以删除此事件');
    }

    await this.timelineRepository.update(eventId, { status: 0 });

    return { message: '删除成功' };
  }

  /**
   * 获取重要纪念日列表
   */
  async getImportantEvents(userId: string): Promise<Record<string, any>[]> {
    const couple = await this.coupleRepository.findByUserId(userId);
    if (!couple || couple.status !== 1) {
      return [];
    }

    const events = await this.timelineRepository.find({
      where: { coupleId: couple.id, isImportant: 1, status: 1 },
      order: { eventDate: 'ASC' },
    });

    return events.map((e) => this.formatEvent(e));
  }

  /**
   * 格式化事件数据
   */
  private formatEvent(event: any): Record<string, any> {
    return {
      id: event.id,
      coupleId: event.coupleId,
      creatorId: event.creatorId,
      eventType: event.eventType,
      title: event.title,
      content: event.content,
      eventDate: event.eventDate,
      location: event.location,
      weather: event.weather,
      mood: event.mood,
      images: event.images || [],
      isImportant: event.isImportant === 1,
      likesCount: event.likesCount || 0,
      commentsCount: event.commentsCount || 0,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
    };
  }
}
