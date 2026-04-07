import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { TimelineEvent } from '../entities/timeline-event.entity';

@Injectable()
export class TimelineRepository extends Repository<TimelineEvent> {
  constructor(private dataSource: DataSource) {
    super(TimelineEvent, dataSource.createEntityManager());
  }

  async findById(id: string): Promise<TimelineEvent | null> {
    return this.findOne({ where: { id } });
  }

  async findByCoupleId(coupleId: string, page = 1, pageSize = 20): Promise<[TimelineEvent[], number]> {
    return this.findAndCount({
      where: { coupleId, status: 1 },
      order: { eventDate: 'DESC', createdAt: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
  }

  async findImportantEvents(coupleId: string): Promise<TimelineEvent[]> {
    return this.find({
      where: { coupleId, isImportant: 1, status: 1 },
      order: { eventDate: 'DESC' },
    });
  }

  async createEvent(eventData: Partial<TimelineEvent>): Promise<TimelineEvent> {
    const event = this.create(eventData);
    return this.save(event);
  }

  async updateEvent(id: string, eventData: Partial<TimelineEvent>): Promise<void> {
    await this.update(id, eventData);
  }

  async deleteEvent(id: string): Promise<void> {
    await this.update(id, { status: 0 });
  }
}
