import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Letter } from '../entities/letter.entity';

@Injectable()
export class LetterRepository extends Repository<Letter> {
  constructor(private dataSource: DataSource) {
    super(Letter, dataSource.createEntityManager());
  }

  async findById(id: string): Promise<Letter | null> {
    return this.findOne({ where: { id } });
  }

  async findByCoupleId(coupleId: string, page = 1, pageSize = 20): Promise<[Letter[], number]> {
    return this.findAndCount({
      where: { coupleId, status: 1 },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
  }

  async findByReceiverId(receiverId: string): Promise<Letter[]> {
    return this.find({
      where: { receiverId, status: 1 },
      order: { createdAt: 'DESC' },
    });
  }

  async findUnreadByReceiverId(receiverId: string): Promise<Letter[]> {
    return this.find({
      where: { receiverId, isRead: 0, status: 1 },
      order: { createdAt: 'DESC' },
    });
  }

  async createLetter(letterData: Partial<Letter>): Promise<Letter> {
    const letter = this.create(letterData);
    return this.save(letter);
  }

  async markAsRead(id: string): Promise<void> {
    await this.update(id, { isRead: 1, readAt: new Date() });
  }

  async deleteLetter(id: string): Promise<void> {
    await this.update(id, { status: 0 });
  }
}
