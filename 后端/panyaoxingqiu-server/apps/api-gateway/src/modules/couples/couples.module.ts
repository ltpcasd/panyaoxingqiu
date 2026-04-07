import { Module } from '@nestjs/common';
import { CouplesController } from './couples.controller';
import { CouplesService } from './couples.service';
import { CoupleRepository, UserRepository } from '@app/database';
import { RedisModule } from '@app/redis';

@Module({
  imports: [RedisModule],
  controllers: [CouplesController],
  providers: [CouplesService, CoupleRepository, UserRepository],
  exports: [CouplesService],
})
export class CouplesModule {}
