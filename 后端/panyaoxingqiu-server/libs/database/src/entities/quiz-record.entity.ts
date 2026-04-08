import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('quiz_records')
export class QuizRecord {
  @PrimaryGeneratedColumn('increment')
  id: string;

  @Column({ name: 'couple_id', type: 'int' })
  coupleId: string;

  @Column({ name: 'question_id', type: 'int' })
  questionId: string;

  @Column({ name: 'user_id_1', type: 'int' })
  userId1: string;

  @Column({ name: 'user1_answer', type: 'varchar', length: 64, nullable: true, comment: '用户1的答案' })
  user1Answer: string | null;

  @Column({ name: 'answer_1', type: 'varchar', length: 64, nullable: true })
  answer1: string | null;

  @Column({ name: 'user_id_2', type: 'int' })
  userId2: string;

  @Column({ name: 'user2_answer', type: 'varchar', length: 64, nullable: true, comment: '用户2的答案' })
  user2Answer: string | null;

  @Column({ name: 'answer_2', type: 'varchar', length: 64, nullable: true })
  answer2: string | null;

  @Column({ name: 'is_match', type: 'tinyint', default: 0, comment: '是否匹配' })
  isMatch: number;

  @Column({ name: 'answered_at_1', type: 'datetime', nullable: true })
  answeredAt1: Date | null;

  @Column({ name: 'answered_at_2', type: 'datetime', nullable: true })
  answeredAt2: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
