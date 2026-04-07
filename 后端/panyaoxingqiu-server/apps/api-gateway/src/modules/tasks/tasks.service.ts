import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { TaskRepository, UserTaskRepository, CoupleRepository } from '@app/database';
import { CouplesService } from '../couples/couples.service';
import { TaskQueryDto, CompleteTaskDto } from './dto/task.dto';

@Injectable()
export class TasksService {
  constructor(
    private readonly taskRepository: TaskRepository,
    private readonly userTaskRepository: UserTaskRepository,
    private readonly coupleRepository: CoupleRepository,
    private readonly couplesService: CouplesService,
  ) {}

  /**
   * 获取任务列表（附带完成状态）
   */
  async getTasks(userId: string, query: TaskQueryDto): Promise<{
    list: Record<string, any>[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    const couple = await this.coupleRepository.findByUserId(userId);

    const page = query.page || 1;
    const pageSize = query.pageSize || 20;
    const skip = (page - 1) * pageSize;

    const qb = this.taskRepository
      .createQueryBuilder('t')
      .where('t.status = 1')
      .orderBy('t.task_type', 'ASC')
      .addOrderBy('t.sort_order', 'ASC')
      .skip(skip)
      .take(pageSize);

    if (query.taskType) {
      qb.andWhere('t.task_type = :taskType', { taskType: query.taskType });
    }

    const [tasks, total] = await qb.getManyAndCount();

    // 获取用户完成情况
    const userTasks = couple
      ? await this.userTaskRepository.findByUserId(userId)
      : [];

    const completedTaskIds = new Set(
      userTasks.filter((ut) => ut.status === 1).map((ut) => ut.taskId),
    );

    // 过滤已完成状态
    let filteredTasks = tasks;
    if (query.status === 1) {
      filteredTasks = tasks.filter((t) => completedTaskIds.has(t.id));
    } else if (query.status === 0) {
      filteredTasks = tasks.filter((t) => !completedTaskIds.has(t.id));
    }

    return {
      list: filteredTasks.map((t) => ({
        ...this.formatTask(t),
        isCompleted: completedTaskIds.has(t.id),
      })),
      total,
      page,
      pageSize,
    };
  }

  /**
   * 获取任务详情
   */
  async getTaskById(userId: string, taskId: string): Promise<Record<string, any>> {
    const task = await this.taskRepository.findById(taskId);
    if (!task || task.status !== 1) {
      throw new NotFoundException('任务不存在');
    }

    const userTask = await this.userTaskRepository.findByUserAndTask(userId, taskId);

    return {
      ...this.formatTask(task),
      isCompleted: userTask?.status === 1,
      completedAt: userTask?.completedAt,
      remark: userTask?.remark,
      proofImage: userTask?.proofImage,
    };
  }

  /**
   * 完成任务
   */
  async completeTask(
    userId: string,
    taskId: string,
    dto: CompleteTaskDto,
  ): Promise<Record<string, any>> {
    const couple = await this.coupleRepository.findByUserId(userId);
    if (!couple || couple.status !== 1) {
      throw new ForbiddenException('请先完成配对才能使用任务功能');
    }

    const task = await this.taskRepository.findById(taskId);
    if (!task || task.status !== 1) {
      throw new NotFoundException('任务不存在');
    }

    // 检查是否已完成
    const existingUserTask = await this.userTaskRepository.findByUserAndTask(userId, taskId);
    if (existingUserTask && existingUserTask.status === 1) {
      throw new ConflictException('该任务已经完成');
    }

    if (existingUserTask) {
      // 更新已有记录
      await this.userTaskRepository.updateUserTask(existingUserTask.id, {
        status: 1,
        completedAt: new Date(),
        remark: dto.remark || null,
        proofImage: dto.proofImage || null,
      });
    } else {
      // 创建新记录
      await this.userTaskRepository.createUserTask({
        userId,
        coupleId: couple.id,
        taskId,
        status: 1,
        completedAt: new Date(),
        remark: dto.remark || null,
        proofImage: dto.proofImage || null,
      });
    }

    // 增加亲密度
    const intimacyReward = task.intimacyReward || 15;
    await this.couplesService.addIntimacyScore(couple.id, intimacyReward);

    return {
      taskId,
      taskTitle: task.title,
      intimacyReward,
      completedAt: new Date(),
      message: `完成任务，获得 ${intimacyReward} 亲密度`,
    };
  }

  /**
   * 获取今日任务（与getTodayStats保持一致，但返回任务列表）
   */
  async getTodayTasks(userId: string): Promise<Record<string, any>> {
    const couple = await this.coupleRepository.findByUserId(userId);
    if (!couple || couple.status !== 1) {
      return {
        tasks: [],
        total: 0,
        completed: 0,
        intimacyToday: 0,
      };
    }

    // 获取日常任务
    const dailyTasks = await this.taskRepository.findByType(1);

    // 获取今日完成情况
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayUserTasks = await this.userTaskRepository
      .createQueryBuilder('ut')
      .where('ut.user_id = :userId', { userId })
      .andWhere('ut.status = 1')
      .andWhere('ut.completed_at >= :today', { today })
      .getMany();

    const completedTodayIds = new Set(todayUserTasks.map((ut) => ut.taskId));
    const completedCount = dailyTasks.filter((t) => completedTodayIds.has(t.id)).length;

    return {
      tasks: dailyTasks.map((t) => ({
        ...this.formatTask(t),
        isCompleted: completedTodayIds.has(t.id),
      })),
      total: dailyTasks.length,
      completed: completedCount,
      intimacyToday: todayUserTasks.reduce((sum, ut) => {
        const task = dailyTasks.find((t) => t.id === ut.taskId);
        return sum + (task?.intimacyReward || 0);
      }, 0),
    };
  }

  /**
   * 获取用户等级信息
   */
  async getUserLevel(userId: string): Promise<Record<string, any>> {
    const couple = await this.coupleRepository.findByUserId(userId);
    if (!couple || couple.status !== 1) {
      return {
        level: 1,
        levelTitle: '初识',
        intimacyScore: 0,
        nextLevelScore: 100,
        progress: 0,
      };
    }

    const intimacyScore = couple.intimacyScore || 0;
    const level = couple.level || 1;
    const levelTitle = couple.levelTitle || '初识';

    // 计算下一级所需分数
    const nextLevelScore = this.calculateNextLevelScore(level);
    const currentLevelBaseScore = this.calculateNextLevelScore(level - 1);
    const progress = Math.min(100, Math.round(((intimacyScore - currentLevelBaseScore) / (nextLevelScore - currentLevelBaseScore)) * 100));

    return {
      level,
      levelTitle,
      intimacyScore,
      nextLevelScore,
      progress,
    };
  }

  /**
   * 获取任务进度
   */
  async getTaskProgress(taskId: string, userId: string): Promise<Record<string, any>> {
    const task = await this.taskRepository.findById(taskId);
    if (!task || task.status !== 1) {
      throw new NotFoundException('任务不存在');
    }

    const userTask = await this.userTaskRepository.findByUserAndTask(userId, taskId);

    return {
      taskId,
      taskTitle: task.title,
      isCompleted: userTask?.status === 1,
      completedAt: userTask?.completedAt,
      progress: userTask?.status === 1 ? 100 : 0,
      currentCount: userTask?.status === 1 ? 1 : 0,
      targetCount: 1,
    };
  }

  /**
   * 领取任务奖励
   */
  async claimReward(taskId: string, userId: string): Promise<Record<string, any>> {
    const couple = await this.coupleRepository.findByUserId(userId);
    if (!couple || couple.status !== 1) {
      throw new ForbiddenException('请先完成配对才能领取奖励');
    }

    const task = await this.taskRepository.findById(taskId);
    if (!task || task.status !== 1) {
      throw new NotFoundException('任务不存在');
    }

    const userTask = await this.userTaskRepository.findByUserAndTask(userId, taskId);
    if (!userTask || userTask.status !== 1) {
      throw new ForbiddenException('任务尚未完成，无法领取奖励');
    }

    // 检查是否已经领取过奖励
    if (userTask.rewardClaimed) {
      throw new ConflictException('奖励已经领取过了');
    }

    // 标记奖励已领取
    await this.userTaskRepository.updateUserTask(userTask.id, {
      rewardClaimed: true,
      rewardClaimedAt: new Date(),
    });

    const intimacyReward = task.intimacyReward || 15;

    return {
      taskId,
      taskTitle: task.title,
      intimacyReward,
      claimedAt: new Date(),
      message: `成功领取奖励，获得 ${intimacyReward} 亲密度`,
    };
  }

  /**
   * 获取今日任务统计（保留原方法用于兼容）
   */
  async getTodayStats(userId: string): Promise<Record<string, any>> {
    const result = await this.getTodayTasks(userId);
    return {
      total: result.total,
      completed: result.completed,
      intimacyToday: result.intimacyToday,
    };
  }

  /**
   * 计算下一级所需分数
   */
  private calculateNextLevelScore(level: number): number {
    // 等级升级公式：每级需要分数递增
    const baseScore = 100;
    const increment = 50;
    return baseScore + (level * increment);
  }

  /**
   * 格式化任务数据
   */
  private formatTask(task: any): Record<string, any> {
    return {
      id: task.id,
      title: task.title,
      description: task.description,
      taskType: task.taskType,
      taskTypeLabel: this.getTaskTypeLabel(task.taskType),
      icon: task.icon,
      intimacyReward: task.intimacyReward || 15,
      sortOrder: task.sortOrder,
    };
  }

  private getTaskTypeLabel(taskType: number): string {
    const labels: Record<number, string> = {
      1: '日常任务',
      2: '周任务',
      3: '挑战任务',
    };
    return labels[taskType] || '未知';
  }
}
