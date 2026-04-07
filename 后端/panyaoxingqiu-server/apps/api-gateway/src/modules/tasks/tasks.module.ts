import { Module } from '@nestjs/common';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { TaskRepository, UserTaskRepository, CoupleRepository } from '@app/database';
import { CouplesModule } from '../couples/couples.module';

@Module({
  imports: [CouplesModule],
  controllers: [TasksController],
  providers: [TasksService, TaskRepository, UserTaskRepository, CoupleRepository],
  exports: [TasksService],
})
export class TasksModule {}
