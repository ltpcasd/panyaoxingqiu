import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TimelineService } from './timeline.service';
import {
  CreateTimelineEventDto,
  UpdateTimelineEventDto,
  TimelineQueryDto,
} from './dto/timeline.dto';
import { JwtAuthGuard, CurrentUserId } from '@app/common';

@ApiTags('Timeline')
@Controller('timeline')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT')
export class TimelineController {
  constructor(private readonly timelineService: TimelineService) {}

  @Post()
  @ApiOperation({ summary: '创建时光轴事件' })
  async createEvent(
    @CurrentUserId() userId: string,
    @Body() dto: CreateTimelineEventDto,
  ) {
    return this.timelineService.createEvent(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: '获取时光轴列表' })
  async getEvents(
    @CurrentUserId() userId: string,
    @Query() query: TimelineQueryDto,
  ) {
    return this.timelineService.getEvents(userId, query);
  }

  @Get('important')
  @ApiOperation({ summary: '获取重要纪念日列表' })
  async getImportantEvents(@CurrentUserId() userId: string) {
    return this.timelineService.getImportantEvents(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取事件详情' })
  async getEventById(
    @CurrentUserId() userId: string,
    @Param('id') eventId: string,
  ) {
    return this.timelineService.getEventById(userId, eventId);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新时光轴事件' })
  async updateEvent(
    @CurrentUserId() userId: string,
    @Param('id') eventId: string,
    @Body() dto: UpdateTimelineEventDto,
  ) {
    return this.timelineService.updateEvent(userId, eventId, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '删除时光轴事件' })
  async deleteEvent(
    @CurrentUserId() userId: string,
    @Param('id') eventId: string,
  ) {
    return this.timelineService.deleteEvent(userId, eventId);
  }
}
