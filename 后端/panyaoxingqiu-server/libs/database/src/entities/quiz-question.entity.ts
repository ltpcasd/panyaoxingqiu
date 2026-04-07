import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('quiz_questions')
export class QuizQuestion {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: string;

  @Column({ type: 'varchar', length: 32, comment: '分类' })
  category: string;

  @Column({ type: 'varchar', length: 256 })
  question: string;

  @Column({ type: 'json', comment: '选项' })
  options: { label: string; value: string; text: string }[];

  @Column({ name: 'correct_answer', type: 'varchar', length: 64, comment: '正确答案' })
  correctAnswer: string;

  @Column({ type: 'tinyint', default: 1, comment: '难度' })
  difficulty: number;

  @Column({ type: 'json', nullable: true, comment: '标签' })
  tags: string[] | null;

  @Column({ type: 'tinyint', default: 1 })
  status: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
