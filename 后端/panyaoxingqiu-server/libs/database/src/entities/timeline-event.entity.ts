import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('timeline_events')
export class TimelineEvent {
  @PrimaryGeneratedColumn('increment')
  id: string;

  @Column({ name: 'couple_id', type: 'int', comment: '配对ID' })
  coupleId: string;

  @Column({ name: 'creator_id', type: 'int', comment: '创建者ID' })
  creatorId: string;

  @Column({ name: 'event_type', type: 'tinyint', comment: '事件类型 1-纪念�?2-日常 3-旅行' })
  eventType: number;

  @Column({ type: 'varchar', length: 128, comment: '标题' })
  title: string;

  @Column({ type: 'text', nullable: true, comment: '内容' })
  content: string | null;

  @Column({ name: 'event_date', type: 'date', comment: '事件日期' })
  eventDate: Date;

  @Column({ type: 'varchar', length: 128, nullable: true, comment: '地点' })
  location: string | null;

  @Column({ type: 'varchar', length: 32, nullable: true, comment: '天气' })
  weather: string | null;

  @Column({ type: 'varchar', length: 32, nullable: true, comment: '心情' })
  mood: string | null;

  @Column({ type: 'text', nullable: true, comment: '图片数组（JSON字符串）', transformer: {
    to: (value: string[] | null) => value ? JSON.stringify(value) : null,
    from: (value: string | null) => value ? JSON.parse(value) : null,
  }})
  images: string[] | null;

  @Column({ name: 'is_important', type: 'tinyint', default: 0, comment: '是否重要' })
  isImportant: number;

  @Column({ name: 'likes_count', type: 'int', default: 0, comment: '点赞�? })
  likesCount: number;

  @Column({ name: 'comments_count', type: 'int', default: 0, comment: '评论�? })
  commentsCount: number;

  @Column({ type: 'tinyint', default: 1 })
  status: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
