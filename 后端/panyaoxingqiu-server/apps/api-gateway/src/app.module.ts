import { Module, Controller, Get } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseModule } from '@app/database';
import { RedisModule } from '@app/redis';
import { CommonModule } from '@app/common';

// 健康检查控制器（支持 /health 和 /api/health 访问）
@Controller()
class HealthController {
  @Get('health')
  @Get('api/health')
  healthCheck() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'panyaoxingqiu-api',
      version: '1.0.0'
    };
  }
}

// Feature Modules
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { CouplesModule } from './modules/couples/couples.module';
import { TimelineModule } from './modules/timeline/timeline.module';
import { AlbumModule } from './modules/album/album.module';
import { QuizModule } from './modules/quiz/quiz.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { MessagesModule } from './modules/messages/messages.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { UploadModule } from './modules/upload/upload.module';

@Module({
  controllers: [HealthController],
  imports: [
    // 配置模块
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),

    // 限流模块
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1分钟
        limit: 100, // 最多100次请求
      },
    ]),

    // JWT模块
    JwtModule.registerAsync({
      global: true,
      useFactory: () => ({
        secret: process.env.JWT_SECRET || 'panyaoxingqiu-jwt-secret-key',
        signOptions: {
          expiresIn: process.env.JWT_EXPIRES_IN || '7d',
        },
      }),
    }),

    // 共享库
    CommonModule,
    DatabaseModule,
    RedisModule,

    // 业务模块
    AuthModule,
    UsersModule,
    CouplesModule,
    TimelineModule,
    AlbumModule,
    QuizModule,
    TasksModule,
    MessagesModule,
    NotificationsModule,
    UploadModule,
  ],
})
export class AppModule {}
