import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { User } from '../entities/user.entity';

@Injectable()
export class UserRepository extends Repository<User> {
  constructor(private dataSource: DataSource) {
    super(User, dataSource.createEntityManager());
  }

  async findByOpenid(openid: string): Promise<User | null> {
    return this.findOne({ where: { openid } });
  }

  async findByUnionid(unionid: string): Promise<User | null> {
    return this.findOne({ where: { unionid } });
  }

  async findById(id: string): Promise<User | null> {
    return this.findOne({ where: { id } });
  }

  async createUser(userData: Partial<User>): Promise<User> {
    const user = this.create(userData);
    return this.save(user);
  }

  async updateUser(id: string, userData: Partial<User>): Promise<void> {
    await this.update(id, userData);
  }
}
