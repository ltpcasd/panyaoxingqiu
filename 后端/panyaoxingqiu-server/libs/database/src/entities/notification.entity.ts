import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('increment')
  id: string;

  @Column({ name: 'user_id', type: 'int' })
  userId: string;

  @Column({ type: 'varchar', length: 128, comment: '通知标题' })
  title: string;

  @Column({ type: 'text', comment: '通知内容' })
  content: string;

  @Column({ name: 'notify_type', type: 'tinyint', comment: '通知类型 1-系统 2-配对 3-互动 4-任务 5-纪念日' })
  notifyType: number;

  @Column({ name: 'extra_data', type: 'text', nullable: true, comment: '额外数据(JSON)' })
  extraData: string | null;

  @Column({ type: 'tinyint', default: 1, comment: '状态 0-禁用 1-启用' })
  status: number;

  @Column({ name: 'is_read', type: 'tinyint', default: 0 })
  isRead: number;

  @Column({ name: 'read_at', type: 'datetime', nullable: true })
  readAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
