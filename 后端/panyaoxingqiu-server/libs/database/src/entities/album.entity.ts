import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('albums')
export class Album {
  @PrimaryGeneratedColumn('increment')
  id: string;

  @Column({ name: 'couple_id', type: 'int' })
  coupleId: string;

  @Column({ name: 'creator_id', type: 'int', comment: '创建者ID' })
  creatorId: string;

  @Column({ type: 'varchar', length: 64, comment: '相册名称' })
  name: string;

  @Column({ type: 'varchar', length: 256, nullable: true, comment: '相册描述' })
  description: string | null;

  @Column({ name: 'cover_image', type: 'varchar', length: 255, nullable: true, comment: '封面图' })
  coverImage: string | null;

  @Column({ name: 'photo_count', type: 'int', default: 0, comment: '照片数量' })
  photoCount: number;

  @Column({ name: 'sort_order', type: 'int', default: 0, comment: '排序' })
  sortOrder: number;

  @Column({ type: 'tinyint', default: 1 })
  status: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
