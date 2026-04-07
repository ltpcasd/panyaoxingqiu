import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { NotificationRepository, UserRepository } from '@app/database';
import { RedisModule } from '@app/redis';

@Module({
  imports: [RedisModule],
  controllers: [NotificationsController],
  providers: [NotificationsService, NotificationRepository, UserRepository],
  exports: [NotificationsService],
})
export class NotificationsModule {}
