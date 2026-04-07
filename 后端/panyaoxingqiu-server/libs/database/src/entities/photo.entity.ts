import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('photos')
export class Photo {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: string;

  @Column({ name: 'album_id', type: 'bigint', unsigned: true })
  albumId: string;

  @Column({ name: 'couple_id', type: 'bigint', unsigned: true })
  coupleId: string;

  @Column({ name: 'uploader_id', type: 'bigint', unsigned: true })
  uploaderId: string;

  @Column({ type: 'varchar', length: 255, comment: '图片URL' })
  url: string;

  @Column({ name: 'original_url', type: 'varchar', length: 255, comment: '原图URL' })
  originalUrl: string;

  @Column({ name: 'thumbnail_url', type: 'varchar', length: 255, nullable: true, comment: '缩略图URL' })
  thumbnailUrl: string | null;

  @Column({ type: 'int', nullable: true })
  width: number | null;

  @Column({ type: 'int', nullable: true })
  height: number | null;

  @Column({ type: 'int', nullable: true, comment: '文件大小(字节)' })
  size: number | null;

  @Column({ type: 'varchar', length: 256, nullable: true })
  description: string | null;

  @Column({ type: 'simple-array', nullable: true, comment: '标签' })
  tags: string[] | null;

  @Column({ name: 'taken_at', type: 'datetime', nullable: true, comment: '拍摄时间' })
  takenAt: Date | null;

  @Column({ type: 'tinyint', default: 1 })
  status: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
