import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TasksService } from './tasks.service';
import { TaskQueryDto, CompleteTaskDto } from './dto/task.dto';
import { JwtAuthGuard, CurrentUserId } from '@app/common';

@ApiTags('Tasks')
@Controller('tasks')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  @ApiOperation({ summary: '获取任务列表' })
  async getTasks(
    @CurrentUserId() userId: string,
    @Query() query: TaskQueryDto,
  ) {
    return this.tasksService.getTasks(userId, query);
  }

  @Get('today')
  @ApiOperation({ summary: '获取今日任务' })
  async getTodayTasks(@CurrentUserId() userId: string) {
    return this.tasksService.getTodayTasks(userId);
  }

  @Get('level')
  @ApiOperation({ summary: '获取等级信息' })
  async getUserLevel(@CurrentUserId() userId: string) {
    return this.tasksService.getUserLevel(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取任务详情' })
  async getTaskById(
    @CurrentUserId() userId: string,
    @Param('id') id: string,
  ) {
    return this.tasksService.getTaskById(userId, id);
  }

  @Get(':id/progress')
  @ApiOperation({ summary: '获取任务进度' })
  async getTaskProgress(
    @CurrentUserId() userId: string,
    @Param('id') id: string,
  ) {
    return this.tasksService.getTaskProgress(id, userId);
  }

  @Post(':id/complete')
  @ApiOperation({ summary: '完成任务' })
  async completeTask(
    @CurrentUserId() userId: string,
    @Param('id') id: string,
    @Body() dto: CompleteTaskDto,
  ) {
    return this.tasksService.completeTask(userId, id, dto);
  }

  @Post(':id/claim')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '领取任务奖励' })
  async claimReward(
    @CurrentUserId() userId: string,
    @Param('id') id: string,
  ) {
    return this.tasksService.claimReward(id, userId);
  }
}
