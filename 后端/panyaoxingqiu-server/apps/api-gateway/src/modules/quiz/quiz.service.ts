import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import {
  QuizQuestionRepository,
  QuizRecordRepository,
  CoupleRepository,
} from '@app/database';
import { CouplesService } from '../couples/couples.service';
import { SubmitQuizDto, QuizQueryDto, QuizRecordQueryDto } from './dto/quiz.dto';

@Injectable()
export class QuizService {
  constructor(
    private readonly quizQuestionRepository: QuizQuestionRepository,
    private readonly quizRecordRepository: QuizRecordRepository,
    private readonly coupleRepository: CoupleRepository,
    private readonly couplesService: CouplesService,
  ) {}

  /**
   * 获取配对ID（必须已配对）
   */
  private async requireCouple(userId: string) {
    const couple = await this.coupleRepository.findByUserId(userId);
    if (!couple || couple.status !== 1) {
      throw new ForbiddenException('请先完成配对才能使用此功能');
    }
    return couple;
  }

  /**
   * 获取题目列表
   */
  async getQuestions(query: QuizQueryDto): Promise<{
    list: Record<string, any>[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    const page = query.page || 1;
    const pageSize = query.pageSize || 10;
    const skip = (page - 1) * pageSize;

    const qb = this.quizQuestionRepository
      .createQueryBuilder('q')
      .where('q.status = 1')
      .orderBy('q.created_at', 'DESC')
      .skip(skip)
      .take(pageSize);

    if (query.category) {
      qb.andWhere('q.category = :category', { category: query.category });
    }

    const [questions, total] = await qb.getManyAndCount();

    return {
      list: questions.map((q) => this.formatQuestion(q)),
      total,
      page,
      pageSize,
    };
  }

  /**
   * 获取今日题目（随机）
   */
  async getTodayQuestion(userId: string): Promise<Record<string, any> | null> {
    const couple = await this.requireCouple(userId);

    // 查看今日是否已有记录
    const todayRecord = await this.quizRecordRepository.findTodayRecord(couple.id);
    if (todayRecord) {
      const question = await this.quizQuestionRepository.findById(todayRecord.questionId);
      return question
        ? {
            question: this.formatQuestion(question),
            record: this.formatRecord(todayRecord),
            answered: true,
          }
        : null;
    }

    // 获取已答过的题目ID列表（避免重复）
    const answeredRecords = await this.quizRecordRepository.find({
      where: { coupleId: couple.id },
      select: ['questionId'],
    });
    const answeredIds = answeredRecords.map((r) => r.questionId);

    // 随机获取一道未答过的题目
    const question = await this.quizQuestionRepository.findRandomQuestion(answeredIds);

    if (!question) {
      return { message: '所有题目已完成！', completed: true };
    }

    return {
      question: this.formatQuestion(question),
      answered: false,
    };
  }

  /**
   * 提交答题
   */
  async submitQuiz(userId: string, dto: SubmitQuizDto): Promise<Record<string, any>> {
    const couple = await this.requireCouple(userId);

    const results: any[] = [];
    let totalScore = 0;

    for (const answerItem of dto.answers) {
      const question = await this.quizQuestionRepository.findById(answerItem.questionId);
      if (!question) continue;

      // 检查是否已答过此题
      const existingRecord = await this.quizRecordRepository.findByCoupleAndQuestion(
        couple.id,
        answerItem.questionId,
      );

      const isMatch = question.correctAnswer === answerItem.answer ? 1 : 0;
      const score = isMatch ? 20 : 0; // 答对得20分

      if (existingRecord) {
        // 更新已有记录
        const bothAnswered =
          (couple.userId1 === userId && existingRecord.user2Answer) ||
          (couple.userId2 === userId && existingRecord.user1Answer);

        const updateData: any = {};
        if (couple.userId1 === userId) {
          updateData.user1Answer = answerItem.answer;
        } else {
          updateData.user2Answer = answerItem.answer;
        }

        if (bothAnswered) {
          updateData.isMatch = isMatch;
        }

        await this.quizRecordRepository.updateRecord(existingRecord.id, updateData);
      } else {
        // 创建新记录
        const recordData: any = {
          coupleId: couple.id,
          questionId: answerItem.questionId,
          isMatch: 0,
        };

        if (couple.userId1 === userId) {
          recordData.userId1 = userId;
          recordData.user1Answer = answerItem.answer;
        } else {
          recordData.userId2 = userId;
          recordData.user2Answer = answerItem.answer;
        }

        await this.quizRecordRepository.createRecord(recordData);
      }

      totalScore += score;
      results.push({
        questionId: answerItem.questionId,
        yourAnswer: answerItem.answer,
        correctAnswer: question.correctAnswer,
        isCorrect: isMatch === 1,
        score,
      });
    }

    // 如果有得分，增加亲密度
    if (totalScore > 0) {
      await this.couplesService.addIntimacyScore(couple.id, totalScore);
    }

    // 重新计算默契度
    const compatibility = await this.quizRecordRepository.calculateCompatibility(couple.id);

    return {
      results,
      totalScore,
      compatibility,
    };
  }

  /**
   * 获取答题记录
   */
  async getQuizRecords(userId: string, query: QuizRecordQueryDto): Promise<{
    list: Record<string, any>[];
    total: number;
    page: number;
    pageSize: number;
    compatibility: number;
  }> {
    const couple = await this.requireCouple(userId);

    const page = query.page || 1;
    const pageSize = query.pageSize || 20;

    const [records, total] = await this.quizRecordRepository.findByCoupleId(
      couple.id,
      page,
      pageSize,
    );

    const compatibility = await this.quizRecordRepository.calculateCompatibility(couple.id);

    return {
      list: records.map((r) => this.formatRecord(r)),
      total,
      page,
      pageSize,
      compatibility,
    };
  }

  /**
   * 获取默契度统计
   */
  async getCompatibilityStats(userId: string): Promise<Record<string, any>> {
    const couple = await this.requireCouple(userId);

    const compatibility = await this.quizRecordRepository.calculateCompatibility(couple.id);

    const totalRecords = await this.quizRecordRepository.count({
      where: { coupleId: couple.id },
    });

    const matchedRecords = await this.quizRecordRepository.count({
      where: { coupleId: couple.id, isMatch: 1 },
    });

    return {
      compatibility,
      totalAnswered: totalRecords,
      totalMatched: matchedRecords,
      coupleId: couple.id,
    };
  }

  /**
   * 格式化题目数据
   */
  private formatQuestion(question: any): Record<string, any> {
    return {
      id: question.id,
      category: question.category,
      question: question.question,
      options: question.options,
      difficulty: question.difficulty,
    };
  }

  /**
   * 格式化答题记录（不暴露正确答案）
   */
  private formatRecord(record: any): Record<string, any> {
    return {
      id: record.id,
      coupleId: record.coupleId,
      questionId: record.questionId,
      user1Answer: record.user1Answer,
      user2Answer: record.user2Answer,
      isMatch: record.isMatch === 1,
      createdAt: record.createdAt,
    };
  }
}
