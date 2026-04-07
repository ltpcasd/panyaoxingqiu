import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Couple } from '../entities/couple.entity';

@Injectable()
export class CoupleRepository extends Repository<Couple> {
  constructor(private dataSource: DataSource) {
    super(Couple, dataSource.createEntityManager());
  }

  async findById(id: string): Promise<Couple | null> {
    return this.findOne({ where: { id } });
  }

  async findByPairCode(pairCode: string): Promise<Couple | null> {
    return this.findOne({ where: { pairCode } });
  }

  async findByUserId(userId: string): Promise<Couple | null> {
    return this.findOne({
      where: [
        { userId1: userId, status: 1 },
        { userId2: userId, status: 1 },
      ],
    });
  }

  async createCouple(coupleData: Partial<Couple>): Promise<Couple> {
    const couple = this.create(coupleData);
    return this.save(couple);
  }

  async updateCouple(id: string, coupleData: Partial<Couple>): Promise<void> {
    await this.update(id, coupleData);
  }

  async generatePairCode(): Promise<string> {
    // 生成4位数字配对码
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    const existing = await this.findByPairCode(code);
    if (existing) {
      return this.generatePairCode();
    }
    return code;
  }
}
