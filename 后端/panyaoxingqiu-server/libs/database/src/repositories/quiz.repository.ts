import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { QuizQuestion } from '../entities/quiz-question.entity';
import { QuizRecord } from '../entities/quiz-record.entity';

@Injectable()
export class QuizQuestionRepository extends Repository<QuizQuestion> {
  constructor(private dataSource: DataSource) {
    super(QuizQuestion, dataSource.createEntityManager());
  }

  async findById(id: string): Promise<QuizQuestion | null> {
    return this.findOne({ where: { id } });
  }

  async findByCategory(category: string): Promise<QuizQuestion[]> {
    return this.find({
      where: { category, status: 1 },
      order: { createdAt: 'DESC' },
    });
  }

  async findRandomQuestion(excludeIds: string[] = []): Promise<QuizQuestion | null> {
    const query = this.createQueryBuilder('question')
      .where('question.status = :status', { status: 1 });
    
    if (excludeIds.length > 0) {
      query.andWhere('question.id NOT IN (:...excludeIds)', { excludeIds });
    }
    
    return query.orderBy('RAND()').getOne();
  }

  async findAllActive(): Promise<QuizQuestion[]> {
    return this.find({
      where: { status: 1 },
      order: { category: 'ASC', createdAt: 'DESC' },
    });
  }
}

@Injectable()
export class QuizRecordRepository extends Repository<QuizRecord> {
  constructor(private dataSource: DataSource) {
    super(QuizRecord, dataSource.createEntityManager());
  }

  async findById(id: string): Promise<QuizRecord | null> {
    return this.findOne({ where: { id } });
  }

  async findByCoupleId(coupleId: string, page = 1, pageSize = 20): Promise<[QuizRecord[], number]> {
    return this.findAndCount({
      where: { coupleId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
  }

  async findByCoupleAndQuestion(coupleId: string, questionId: string): Promise<QuizRecord | null> {
    return this.findOne({ where: { coupleId, questionId } });
  }

  async findTodayRecord(coupleId: string): Promise<QuizRecord | null> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return this.createQueryBuilder('record')
      .where('record.coupleId = :coupleId', { coupleId })
      .andWhere('record.createdAt >= :today', { today })
      .orderBy('record.createdAt', 'DESC')
      .getOne();
  }

  async createRecord(recordData: Partial<QuizRecord>): Promise<QuizRecord> {
    const record = this.create(recordData);
    return this.save(record);
  }

  async updateRecord(id: string, recordData: Partial<QuizRecord>): Promise<void> {
    await this.update(id, recordData);
  }

  async calculateCompatibility(coupleId: string): Promise<number> {
    const result = await this.createQueryBuilder('record')
      .select('COUNT(*)', 'total')
      .addSelect('SUM(CASE WHEN record.isMatch = 1 THEN 1 ELSE 0 END)', 'matched')
      .where('record.coupleId = :coupleId', { coupleId })
      .getRawOne();
    
    const total = parseInt(result.total, 10) || 0;
    const matched = parseInt(result.matched, 10) || 0;
    
    if (total === 0) return 0;
    return Math.round((matched / total) * 100);
  }
}
