import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('user_tasks')
export class UserTask {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: string;

  @Column({ name: 'user_id', type: 'bigint', unsigned: true })
  userId: string;

  @Column({ name: 'couple_id', type: 'bigint', unsigned: true })
  coupleId: string;

  @Column({ name: 'task_id', type: 'bigint', unsigned: true })
  taskId: string;

  @Column({ type: 'tinyint', default: 0, comment: '状态 0-未完成 1-已完成' })
  status: number;

  @Column({ type: 'int', default: 0, comment: '当前进度' })
  progress: number;

  @Column({ type: 'int', default: 1, comment: '目标值' })
  target: number;

  @Column({ name: 'intimacy_reward', type: 'int', default: 0, comment: '亲密度奖励' })
  intimacyReward: number;

  @Column({ name: 'task_date', type: 'date', nullable: true, comment: '任务日期' })
  taskDate: string | null;

  @Column({ name: 'completed_at', type: 'datetime', nullable: true })
  completedAt: Date | null;

  @Column({ type: 'varchar', length: 256, nullable: true, comment: '完成备注' })
  remark: string | null;

  @Column({ name: 'proof_image', type: 'varchar', length: 512, nullable: true, comment: '证明图片' })
  proofImage: string | null;

  @Column({ name: 'reward_claimed', type: 'tinyint', default: 0, comment: '奖励是否已领取 0-未领取 1-已领取' })
  rewardClaimed: boolean;

  @Column({ name: 'reward_claimed_at', type: 'datetime', nullable: true, comment: '奖励领取时间' })
  rewardClaimedAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
