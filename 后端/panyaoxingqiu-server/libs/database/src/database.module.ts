import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as entities from './entities';

const allEntities = Object.values(entities).filter(
  (entity) => typeof entity === 'function',
);

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const useSQLite = configService.get('USE_SQLITE', 'false') === 'true';
        const dbHost = configService.get('DB_HOST', '');
        
        // 仅当明确设置 USE_SQLITE=true 且没有 MySQL 连接信息时使用 SQLite
        if (useSQLite && !dbHost) {
          return {
            type: 'sqlite',
            database: configService.get('SQLITE_DB_PATH', './data/panyaoxingqiu.sqlite'),
            entities: allEntities,
            synchronize: true,
            logging: true,
          };
        }
        
        // 默认使用 MySQL（本地开发 & Railway 生产环境）
        const isProduction = configService.get('NODE_ENV') === 'production';
        return {
          type: 'mysql',
          host: dbHost || 'localhost',
          port: parseInt(configService.get('DB_PORT', '3306'), 10),
          username: configService.get('DB_USERNAME', 'root'),
          password: configService.get('DB_PASSWORD', ''),
          database: configService.get('DB_DATABASE', 'panyaoxingqiu'),
          entities: allEntities,
          synchronize: true,
          logging: !isProduction,
          charset: 'utf8mb4',
          timezone: '+08:00',
          extra: {
            connectionLimit: 10,
            queueLimit: 0,
            waitForConnections: true,
          },
        };
      },
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature(allEntities),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
