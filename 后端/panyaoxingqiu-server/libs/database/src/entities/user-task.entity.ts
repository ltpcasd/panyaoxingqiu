import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('user_tasks')
export class UserTask {
  @PrimaryGeneratedColumn('increment')
  id: string;

  @Column({ name: 'user_id', type: 'int' })
  userId: string;

  @Column({ name: 'couple_id', type: 'int' })
  coupleId: string;

  @Column({ name: 'task_id', type: 'int' })
  taskId: string;

  @Column({ type: 'tinyint', default: 0, comment: '状�?0-未完�?1-已完�? })
  status: number;

  @Column({ type: 'int', default: 0, comment: '当前进度' })
  progress: number;

  @Column({ type: 'int', default: 1, comment: '目标�? })
  target: number;

  @Column({ name: 'intimacy_reward', type: 'int', default: 0, comment: '亲密度奖�? })
  intimacyReward: number;

  @Column({ name: 'task_date', type: 'date', nullable: true, comment: '任务日期' })
  taskDate: string | null;

  @Column({ name: 'completed_at', type: 'datetime', nullable: true })
  completedAt: Date | null;

  @Column({ type: 'varchar', length: 256, nullable: true, comment: '完成备注' })
  remark: string | null;

  @Column({ name: 'proof_image', type: 'varchar', length: 512, nullable: true, comment: '证明图片' })
  proofImage: string | null;

  @Column({ name: 'reward_claimed', type: 'tinyint', default: 0, comment: '奖励是否已领�?0-未领�?1-已领�? })
  rewardClaimed: boolean;

  @Column({ name: 'reward_claimed_at', type: 'datetime', nullable: true, comment: '奖励领取时间' })
  rewardClaimedAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
