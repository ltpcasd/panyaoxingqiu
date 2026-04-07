import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Task } from '../entities/task.entity';
import { UserTask } from '../entities/user-task.entity';

@Injectable()
export class TaskRepository extends Repository<Task> {
  constructor(private dataSource: DataSource) {
    super(Task, dataSource.createEntityManager());
  }

  async findById(id: string): Promise<Task | null> {
    return this.findOne({ where: { id } });
  }

  async findByType(taskType: number): Promise<Task[]> {
    return this.find({
      where: { taskType, status: 1 },
      order: { sortOrder: 'ASC' },
    });
  }

  async findAllActive(): Promise<Task[]> {
    return this.find({
      where: { status: 1 },
      order: { taskType: 'ASC', sortOrder: 'ASC' },
    });
  }
}

@Injectable()
export class UserTaskRepository extends Repository<UserTask> {
  constructor(private dataSource: DataSource) {
    super(UserTask, dataSource.createEntityManager());
  }

  async findById(id: string): Promise<UserTask | null> {
    return this.findOne({ where: { id } });
  }

  async findByUserId(userId: string): Promise<UserTask[]> {
    return this.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findByUserAndTask(userId: string, taskId: string): Promise<UserTask | null> {
    return this.findOne({ where: { userId, taskId } });
  }

  async createUserTask(userTaskData: Partial<UserTask>): Promise<UserTask> {
    const userTask = this.create(userTaskData);
    return this.save(userTask);
  }

  async updateUserTask(id: string, userTaskData: Partial<UserTask>): Promise<void> {
    await this.update(id, userTaskData);
  }
}
