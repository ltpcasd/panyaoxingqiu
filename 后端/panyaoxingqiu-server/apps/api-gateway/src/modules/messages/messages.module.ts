import { Module } from '@nestjs/common';
import { MessagesController } from './messages.controller';
import { MessagesService } from './messages.service';
import { LetterRepository, CoupleRepository } from '@app/database';
import { CouplesModule } from '../couples/couples.module';

@Module({
  imports: [CouplesModule],
  controllers: [MessagesController],
  providers: [MessagesService, LetterRepository, CoupleRepository],
  exports: [MessagesService],
})
export class MessagesModule {}
