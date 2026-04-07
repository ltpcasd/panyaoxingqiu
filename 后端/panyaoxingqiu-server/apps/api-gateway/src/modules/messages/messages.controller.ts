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
import { MessagesService } from './messages.service';
import { SendLetterDto, LetterQueryDto, MessageHistoryQueryDto } from './dto/message.dto';
import { JwtAuthGuard, CurrentUserId } from '@app/common';

@ApiTags('Messages')
@Controller('messages')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  @ApiOperation({ summary: '发送信件' })
  async sendLetter(
    @CurrentUserId() userId: string,
    @Body() dto: SendLetterDto,
  ) {
    return this.messagesService.sendLetter(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: '获取信件列表' })
  async getLetters(
    @CurrentUserId() userId: string,
    @Query() query: LetterQueryDto,
  ) {
    return this.messagesService.getLetters(userId, query);
  }

  @Get('unread')
  @ApiOperation({ summary: '获取未读信件数量' })
  async getUnread(@CurrentUserId() userId: string) {
    return this.messagesService.getUnreadCount(userId);
  }

  @Get('unread-count')
  @ApiOperation({ summary: '获取未读数量（别名）' })
  async getUnreadCount(@CurrentUserId() userId: string) {
    return this.messagesService.getUnreadCount(userId);
  }

  @Get('history')
  @ApiOperation({ summary: '获取信件历史' })
  async getMessageHistory(
    @CurrentUserId() userId: string,
    @Query() query: MessageHistoryQueryDto,
  ) {
    return this.messagesService.getMessageHistory(userId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取信件详情（自动标记已读）' })
  async getLetterById(
    @CurrentUserId() userId: string,
    @Param('id') id: string,
  ) {
    return this.messagesService.getLetterById(userId, id);
  }

  @Put(':id/read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '标记信件为已读' })
  async markAsRead(
    @CurrentUserId() userId: string,
    @Param('id') id: string,
  ) {
    return this.messagesService.markAsRead(id, userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '删除信件' })
  async deleteMessage(
    @CurrentUserId() userId: string,
    @Param('id') id: string,
  ) {
    return this.messagesService.deleteMessage(id, userId);
  }
}
