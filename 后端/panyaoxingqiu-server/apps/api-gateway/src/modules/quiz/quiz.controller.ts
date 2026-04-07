import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { QuizService } from './quiz.service';
import { SubmitQuizDto, QuizQueryDto, QuizRecordQueryDto } from './dto/quiz.dto';
import { JwtAuthGuard, CurrentUserId } from '@app/common';

@ApiTags('Quiz')
@Controller('quiz')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT')
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @Get('questions')
  @ApiOperation({ summary: '获取题目列表' })
  async getQuestions(@Query() query: QuizQueryDto) {
    return this.quizService.getQuestions(query);
  }

  @Get('today')
  @ApiOperation({ summary: '获取今日题目' })
  async getTodayQuestion(@CurrentUserId() userId: string) {
    return this.quizService.getTodayQuestion(userId);
  }

  @Post('submit')
  @ApiOperation({ summary: '提交答题' })
  async submitQuiz(
    @CurrentUserId() userId: string,
    @Body() dto: SubmitQuizDto,
  ) {
    return this.quizService.submitQuiz(userId, dto);
  }

  @Get('records')
  @ApiOperation({ summary: '获取答题记录' })
  async getQuizRecords(
    @CurrentUserId() userId: string,
    @Query() query: QuizRecordQueryDto,
  ) {
    return this.quizService.getQuizRecords(userId, query);
  }

  @Get('compatibility')
  @ApiOperation({ summary: '获取默契度统计' })
  async getCompatibilityStats(@CurrentUserId() userId: string) {
    return this.quizService.getCompatibilityStats(userId);
  }
}
