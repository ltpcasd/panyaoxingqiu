import { Module } from '@nestjs/common';
import { AlbumController } from './album.controller';
import { AlbumService } from './album.service';
import { AlbumRepository, PhotoRepository, CoupleRepository } from '@app/database';
import { CouplesModule } from '../couples/couples.module';

@Module({
  imports: [CouplesModule],
  controllers: [AlbumController],
  providers: [AlbumService, AlbumRepository, PhotoRepository, CoupleRepository],
  exports: [AlbumService],
})
export class AlbumModule {}
