import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { UserSetting } from './user-setting.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('increment')
  id: string;

  @Column({ type: 'varchar', length: 64, unique: true, comment: '微信OpenID' })
  openid: string;

  @Column({ type: 'varchar', length: 64, nullable: true, comment: '微信UnionID' })
  unionid: string | null;

  @Column({ type: 'varchar', length: 64, nullable: true, comment: '昵称' })
  nickname: string | null;

  @Column({ name: 'avatar_url', type: 'varchar', length: 255, nullable: true, comment: '头像URL' })
  avatarUrl: string | null;

  @Column({ type: 'tinyint', default: 0, comment: '性别 0-未知 1-�?2-�? })
  gender: number;

  @Column({ type: 'varchar', length: 32, nullable: true })
  country: string | null;

  @Column({ type: 'varchar', length: 32, nullable: true })
  province: string | null;

  @Column({ type: 'varchar', length: 32, nullable: true })
  city: string | null;

  @Column({ type: 'varchar', length: 16, default: 'zh_CN' })
  language: string;

  @Column({ type: 'tinyint', default: 1, comment: '状�?0-禁用 1-正常' })
  status: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToOne(() => UserSetting, (setting) => setting.user)
  @JoinColumn({ name: 'id', referencedColumnName: 'userId' })
  settings: UserSetting;
}
