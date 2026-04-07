import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import * as compression from 'compression';
import { AppModule } from './app.module';
import { HttpExceptionFilter, AllExceptionsFilter } from '@app/common';
import { TransformInterceptor, LoggingInterceptor } from '@app/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn', 'debug'],
  });

  const configService = app.get(ConfigService);
  const port = configService.get('PORT', 3000);
  const apiPrefix = configService.get('API_PREFIX', 'api/v1');

  // 安全头
  app.use(helmet());

  // 启用压缩
  app.use(compression());

  // CORS配置
  app.enableCors({
    origin: configService.get('CORS_ORIGIN', '*'),
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
  });

  // 全局路由前缀
  app.setGlobalPrefix(apiPrefix);

  // 全局验证管道
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // 全局异常过滤器
  app.useGlobalFilters(
    new AllExceptionsFilter(),
    new HttpExceptionFilter(),
  );

  // 全局拦截器
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new TransformInterceptor(),
  );

  // Swagger API文档
  if (configService.get('NODE_ENV') !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('潘瑶星球 API')
      .setDescription('潘瑶星球微信小程序后端 API 接口文档')
      .setVersion('1.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'Authorization',
          description: '请输入 JWT Token',
          in: 'header',
        },
        'JWT',
      )
      .addTag('Auth', '认证相关接口')
      .addTag('Users', '用户相关接口')
      .addTag('Couples', '配对相关接口')
      .addTag('Timeline', '时光轴相关接口')
      .addTag('Album', '相册相关接口')
      .addTag('Quiz', '默契考验相关接口')
      .addTag('Tasks', '任务相关接口')
      .addTag('Messages', '信箱相关接口')
      .addTag('Notifications', '通知相关接口')
      .addTag('Upload', '文件上传相关接口')
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup(`${apiPrefix}/docs`, app, document, {
      swaggerOptions: {
        persistAuthorization: true,
      },
    });

    console.log(`📚 API文档地址: http://localhost:${port}/${apiPrefix}/docs`);
  }

  await app.listen(port);
  console.log(`🚀 潘瑶星球后端服务启动成功: http://localhost:${port}/${apiPrefix}`);
}

bootstrap().catch(console.error);
