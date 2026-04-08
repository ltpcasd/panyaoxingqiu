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
        const isProduction = configService.get('NODE_ENV') === 'production';
        const useSQLite = configService.get('USE_SQLITE', 'false') === 'true';
        
        if (useSQLite || isProduction) {
          // 使用 SQLite（适合 Railway 免费计划）
          return {
            type: 'sqlite',
            database: configService.get('SQLITE_DB_PATH', './data/panyaoxingqiu.sqlite'),
            entities: allEntities,
            synchronize: true,
            logging: !isProduction,
          };
        }
        
        // 使用 MySQL（本地开发）
        return {
          type: 'mysql',
          host: configService.get('DB_HOST', 'localhost'),
          port: configService.get('DB_PORT', 3306),
          username: configService.get('DB_USERNAME', 'root'),
          password: configService.get('DB_PASSWORD', ''),
          database: configService.get('DB_DATABASE', 'panyaoxingqiu'),
          entities: allEntities,
          synchronize: true,
          logging: configService.get('NODE_ENV') === 'development',
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
