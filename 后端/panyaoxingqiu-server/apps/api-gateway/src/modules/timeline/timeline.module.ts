import { Module } from '@nestjs/common';
import { TimelineController } from './timeline.controller';
import { TimelineService } from './timeline.service';
import { TimelineRepository, CoupleRepository } from '@app/database';
import { CouplesModule } from '../couples/couples.module';

@Module({
  imports: [CouplesModule],
  controllers: [TimelineController],
  providers: [TimelineService, TimelineRepository, CoupleRepository],
  exports: [TimelineService],
})
export class TimelineModule {}
