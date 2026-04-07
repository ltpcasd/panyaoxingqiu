import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Album } from '../entities/album.entity';

@Injectable()
export class AlbumRepository extends Repository<Album> {
  constructor(private dataSource: DataSource) {
    super(Album, dataSource.createEntityManager());
  }

  async findById(id: string): Promise<Album | null> {
    return this.findOne({ where: { id } });
  }

  async findByCoupleId(coupleId: string): Promise<Album[]> {
    return this.find({
      where: { coupleId, status: 1 },
      order: { sortOrder: 'ASC', createdAt: 'DESC' },
    });
  }

  async createAlbum(albumData: Partial<Album>): Promise<Album> {
    const album = this.create(albumData);
    return this.save(album);
  }

  async updateAlbum(id: string, albumData: Partial<Album>): Promise<void> {
    await this.update(id, albumData);
  }

  async deleteAlbum(id: string): Promise<void> {
    await this.update(id, { status: 0 });
  }

  async incrementPhotoCount(id: string): Promise<void> {
    await this.increment({ id }, 'photoCount', 1);
  }

  async decrementPhotoCount(id: string): Promise<void> {
    await this.decrement({ id }, 'photoCount', 1);
  }
}
