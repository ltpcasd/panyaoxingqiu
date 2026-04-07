import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('letters')
export class Letter {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: string;

  @Column({ name: 'couple_id', type: 'bigint', unsigned: true })
  coupleId: string;

  @Column({ name: 'sender_id', type: 'bigint', unsigned: true, comment: '发送者ID' })
  senderId: string;

  @Column({ name: 'receiver_id', type: 'bigint', unsigned: true, comment: '接收者ID' })
  receiverId: string;

  @Column({ type: 'varchar', length: 128, nullable: true })
  title: string | null;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'varchar', length: 32, nullable: true, comment: '心情标签' })
  mood: string | null;

  @Column({ name: 'background_style', type: 'varchar', length: 32, default: 'default', comment: '信纸样式' })
  backgroundStyle: string;

  @Column({ name: 'is_read', type: 'tinyint', default: 0 })
  isRead: number;

  @Column({ name: 'read_at', type: 'timestamp', nullable: true })
  readAt: Date | null;

  @Column({ type: 'tinyint', default: 1 })
  status: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
