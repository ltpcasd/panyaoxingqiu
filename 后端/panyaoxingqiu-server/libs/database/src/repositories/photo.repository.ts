import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Photo } from '../entities/photo.entity';

@Injectable()
export class PhotoRepository extends Repository<Photo> {
  constructor(private dataSource: DataSource) {
    super(Photo, dataSource.createEntityManager());
  }

  async findById(id: string): Promise<Photo | null> {
    return this.findOne({ where: { id } });
  }

  async findByAlbumId(albumId: string, page = 1, pageSize = 20): Promise<[Photo[], number]> {
    return this.findAndCount({
      where: { albumId, status: 1 },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
  }

  async findByCoupleId(coupleId: string, page = 1, pageSize = 20): Promise<[Photo[], number]> {
    return this.findAndCount({
      where: { coupleId, status: 1 },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
  }

  async createPhoto(photoData: Partial<Photo>): Promise<Photo> {
    const photo = this.create(photoData);
    return this.save(photo);
  }

  async updatePhoto(id: string, photoData: Partial<Photo>): Promise<void> {
    await this.update(id, photoData);
  }

  async deletePhoto(id: string): Promise<void> {
    await this.update(id, { status: 0 });
  }
}
