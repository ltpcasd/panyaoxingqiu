import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

export type PointsRecordType = 'task' | 'quiz' | 'checkin' | 'other';

@Entity('points_records')
export class PointsRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ type: 'int' })
  points: number;

  @Column({ type: 'varchar', length: 32, comment: '类型: task, quiz, checkin, other' })
  type: PointsRecordType;

  @Column({ name: 'source_id', nullable: true })
  sourceId: string;

  @Column({ nullable: true })
  description: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
