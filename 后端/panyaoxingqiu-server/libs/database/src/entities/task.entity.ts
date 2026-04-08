import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn('increment')
  id: string;

  @Column({ type: 'varchar', length: 128, comment: '任务标题' })
  title: string;

  @Column({ type: 'text', nullable: true, comment: '任务描述' })
  description: string | null;

  @Column({ name: 'task_type', type: 'tinyint', comment: '任务类型 1-日常 2-周任�?3-挑战' })
  taskType: number;

  @Column({ type: 'varchar', length: 128, nullable: true, comment: '图标' })
  icon: string | null;

  @Column({ name: 'intimacy_reward', type: 'int', default: 15, comment: '亲密度奖�? })
  intimacyReward: number;

  @Column({ name: 'sort_order', type: 'int', default: 0, comment: '排序' })
  sortOrder: number;

  @Column({ type: 'tinyint', default: 1, comment: '状�?1-正常 0-禁用' })
  status: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
