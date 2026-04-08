import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('couples')
export class Couple {
  @PrimaryGeneratedColumn('increment')
  id: string;

  @Column({ name: 'user_id_1', type: 'int', comment: '用户1ID' })
  userId1: string;

  @Column({ name: 'user_id_2', type: 'int', nullable: true, comment: '用户2ID' })
  userId2: string | null;

  @Column({ name: 'pair_code', type: 'varchar', length: 16, unique: true, comment: '配对码' })
  pairCode: string;

  @Column({ name: 'couple_avatar', type: 'varchar', length: 255, nullable: true, comment: '双人头像' })
  coupleAvatar: string | null;

  @Column({ name: 'background_image', type: 'varchar', length: 255, nullable: true, comment: '主页背景图' })
  backgroundImage: string | null;

  @Column({ name: 'anniversary_date', type: 'date', nullable: true, comment: '纪念日' })
  anniversaryDate: Date | null;

  @Column({ name: 'together_days', type: 'int', default: 0, comment: '在一起天数' })
  togetherDays: number;

  @Column({ name: 'intimacy_score', type: 'int', default: 0, comment: '亲密度分数' })
  intimacyScore: number;

  @Column({ type: 'int', default: 1, comment: '等级' })
  level: number;

  @Column({ name: 'level_title', type: 'varchar', length: 32, default: '初识', comment: '等级称号' })
  levelTitle: string;

  @Column({ type: 'tinyint', default: 1, comment: '状态 0-解除 1-正常' })
  status: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
