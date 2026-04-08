import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('quiz_questions')
export class QuizQuestion {
  @PrimaryGeneratedColumn('increment')
  id: string;

  @Column({ type: 'varchar', length: 32, comment: '分类' })
  category: string;

  @Column({ type: 'varchar', length: 256 })
  question: string;

  @Column({ type: 'text', comment: '选项（JSON字符串）', transformer: {
    to: (value: any[]) => JSON.stringify(value),
    from: (value: string) => JSON.parse(value),
  }})
  options: { label: string; value: string; text: string }[];

  @Column({ name: 'correct_answer', type: 'varchar', length: 64, comment: '正确答案' })
  correctAnswer: string;

  @Column({ type: 'tinyint', default: 1, comment: '难度' })
  difficulty: number;

  @Column({ type: 'text', nullable: true, comment: '标签（JSON字符串）', transformer: {
    to: (value: string[] | null) => value ? JSON.stringify(value) : null,
    from: (value: string | null) => value ? JSON.parse(value) : null,
  }})
  tags: string[] | null;

  @Column({ type: 'tinyint', default: 1 })
  status: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
