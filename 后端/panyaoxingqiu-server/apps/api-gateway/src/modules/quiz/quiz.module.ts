import { Module } from '@nestjs/common';
import { QuizController } from './quiz.controller';
import { QuizService } from './quiz.service';
import {
  QuizQuestionRepository,
  QuizRecordRepository,
  CoupleRepository,
} from '@app/database';
import { CouplesModule } from '../couples/couples.module';

@Module({
  imports: [CouplesModule],
  controllers: [QuizController],
  providers: [
    QuizService,
    QuizQuestionRepository,
    QuizRecordRepository,
    CoupleRepository,
  ],
  exports: [QuizService],
})
export class QuizModule {}
