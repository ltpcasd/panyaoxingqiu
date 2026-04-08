import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('user_settings')
export class UserSetting {
  @PrimaryGeneratedColumn('increment')
  id: string;

  @Column({ name: 'user_id', type: 'int', unique: true })
  userId: string;

  @Column({ name: 'notification_enabled', type: 'tinyint', default: 1, comment: '消息通知开�? })
  notificationEnabled: number;

  @Column({ name: 'sound_enabled', type: 'tinyint', default: 1, comment: '声音开�? })
  soundEnabled: number;

  @Column({ name: 'vibration_enabled', type: 'tinyint', default: 1, comment: '震动开�? })
  vibrationEnabled: number;

  @Column({ name: 'privacy_level', type: 'tinyint', default: 1, comment: '隐私级别' })
  privacyLevel: number;

  @Column({ type: 'varchar', length: 32, default: 'default', comment: '主题' })
  theme: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToOne(() => User, (user) => user.settings)
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: User;
}
