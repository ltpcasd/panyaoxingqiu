import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { AlbumRepository, PhotoRepository, CoupleRepository } from '@app/database';
import { CouplesService } from '../couples/couples.service';
import {
  CreateAlbumDto,
  UpdateAlbumDto,
  AlbumQueryDto,
  UploadPhotosDto,
  PhotoQueryDto,
} from './dto/album.dto';

@Injectable()
export class AlbumService {
  constructor(
    private readonly albumRepository: AlbumRepository,
    private readonly photoRepository: PhotoRepository,
    private readonly coupleRepository: CoupleRepository,
    private readonly couplesService: CouplesService,
  ) {}

  /**
   * 获取配对ID（必须已配对）
   */
  private async requireCoupleId(userId: string): Promise<string> {
    const couple = await this.coupleRepository.findByUserId(userId);
    if (!couple || couple.status !== 1) {
      throw new ForbiddenException('请先完成配对才能使用此功能');
    }
    return couple.id;
  }

  // =================== 相册管理 ===================

  /**
   * 创建相册
   */
  async createAlbum(userId: string, dto: CreateAlbumDto): Promise<Record<string, any>> {
    const coupleId = await this.requireCoupleId(userId);

    const album = await this.albumRepository.save(
      this.albumRepository.create({
        coupleId,
        creatorId: userId,
        name: dto.name,
        description: dto.description || null,
        coverImage: dto.coverImage || null,
        photoCount: 0,
        status: 1,
      }),
    );

    return this.formatAlbum(album);
  }

  /**
   * 获取相册列表
   */
  async getAlbums(
    userId: string,
    query: AlbumQueryDto,
  ): Promise<{ list: Record<string, any>[]; total: number; page: number; pageSize: number }> {
    const couple = await this.coupleRepository.findByUserId(userId);
    if (!couple || couple.status !== 1) {
      return { list: [], total: 0, page: query.page || 1, pageSize: query.pageSize || 20 };
    }

    const page = query.page || 1;
    const pageSize = query.pageSize || 20;
    const skip = (page - 1) * pageSize;

    const [albums, total] = await this.albumRepository.findAndCount({
      where: { coupleId: couple.id, status: 1 },
      order: { createdAt: 'DESC' },
      skip,
      take: pageSize,
    });

    return {
      list: albums.map((a) => this.formatAlbum(a)),
      total,
      page,
      pageSize,
    };
  }

  /**
   * 获取相册详情
   */
  async getAlbumById(userId: string, albumId: string): Promise<Record<string, any>> {
    const couple = await this.coupleRepository.findByUserId(userId);
    if (!couple || couple.status !== 1) {
      throw new ForbiddenException('请先完成配对');
    }

    const album = await this.albumRepository.findOne({
      where: { id: albumId, coupleId: couple.id, status: 1 },
    });

    if (!album) {
      throw new NotFoundException('相册不存在');
    }

    return this.formatAlbum(album);
  }

  /**
   * 更新相册
   */
  async updateAlbum(
    userId: string,
    albumId: string,
    dto: UpdateAlbumDto,
  ): Promise<Record<string, any>> {
    const couple = await this.coupleRepository.findByUserId(userId);
    if (!couple || couple.status !== 1) {
      throw new ForbiddenException('请先完成配对');
    }

    const album = await this.albumRepository.findOne({
      where: { id: albumId, coupleId: couple.id, status: 1 },
    });

    if (!album) {
      throw new NotFoundException('相册不存在');
    }

    const updateData: any = {};
    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.coverImage !== undefined) updateData.coverImage = dto.coverImage;

    await this.albumRepository.update(albumId, updateData);

    const updated = await this.albumRepository.findOne({ where: { id: albumId } });
    return this.formatAlbum(updated!);
  }

  /**
   * 删除相册（软删除）
   */
  async deleteAlbum(userId: string, albumId: string): Promise<{ message: string }> {
    const couple = await this.coupleRepository.findByUserId(userId);
    if (!couple || couple.status !== 1) {
      throw new ForbiddenException('请先完成配对');
    }

    const album = await this.albumRepository.findOne({
      where: { id: albumId, coupleId: couple.id, status: 1 },
    });

    if (!album) {
      throw new NotFoundException('相册不存在');
    }

    if (album.creatorId !== userId) {
      throw new ForbiddenException('只有创建者可以删除相册');
    }

    await this.albumRepository.update(albumId, { status: 0 });

    return { message: '删除成功' };
  }

  // =================== 照片管理 ===================

  /**
   * 上传照片到相册
   */
  async uploadPhotos(
    userId: string,
    albumId: string,
    dto: UploadPhotosDto,
  ): Promise<Record<string, any>[]> {
    const couple = await this.coupleRepository.findByUserId(userId);
    if (!couple || couple.status !== 1) {
      throw new ForbiddenException('请先完成配对');
    }

    const album = await this.albumRepository.findOne({
      where: { id: albumId, coupleId: couple.id, status: 1 },
    });

    if (!album) {
      throw new NotFoundException('相册不存在');
    }

    if (!dto.urls || dto.urls.length === 0) {
      throw new BadRequestException('请提供图片URL');
    }

    // 批量创建照片记录
    const photos = dto.urls.map((url) =>
      this.photoRepository.create({
        albumId,
        coupleId: couple.id,
        uploaderId: userId,
        url,
        description: dto.description || null,
        status: 1,
      }),
    );

    const savedPhotos = await this.photoRepository.save(photos);

    // 更新相册照片数量和封面（如果没有封面）
    const updateData: any = { photoCount: (album.photoCount || 0) + dto.urls.length };
    if (!album.coverImage && dto.urls.length > 0) {
      updateData.coverImage = dto.urls[0];
    }
    await this.albumRepository.update(albumId, updateData);

    // 增加亲密度
    await this.couplesService.addIntimacyScore(couple.id, dto.urls.length * 5);

    return savedPhotos.map((p) => this.formatPhoto(p));
  }

  /**
   * 获取相册照片列表
   */
  async getPhotos(
    userId: string,
    albumId: string,
    query: PhotoQueryDto,
  ): Promise<{ list: Record<string, any>[]; total: number; page: number; pageSize: number }> {
    const couple = await this.coupleRepository.findByUserId(userId);
    if (!couple || couple.status !== 1) {
      throw new ForbiddenException('请先完成配对');
    }

    const album = await this.albumRepository.findOne({
      where: { id: albumId, coupleId: couple.id, status: 1 },
    });

    if (!album) {
      throw new NotFoundException('相册不存在');
    }

    const page = query.page || 1;
    const pageSize = query.pageSize || 30;
    const skip = (page - 1) * pageSize;

    const [photos, total] = await this.photoRepository.findAndCount({
      where: { albumId, status: 1 },
      order: { createdAt: 'DESC' },
      skip,
      take: pageSize,
    });

    return {
      list: photos.map((p) => this.formatPhoto(p)),
      total,
      page,
      pageSize,
    };
  }

  /**
   * 删除照片（软删除）
   */
  async deletePhoto(userId: string, photoId: string): Promise<{ message: string }> {
    const couple = await this.coupleRepository.findByUserId(userId);
    if (!couple || couple.status !== 1) {
      throw new ForbiddenException('请先完成配对');
    }

    const photo = await this.photoRepository.findOne({
      where: { id: photoId, coupleId: couple.id, status: 1 },
    });

    if (!photo) {
      throw new NotFoundException('照片不存在');
    }

    if (photo.uploaderId !== userId) {
      throw new ForbiddenException('只能删除自己上传的照片');
    }

    await this.photoRepository.update(photoId, { status: 0 });

    // 更新相册照片数量
    const album = await this.albumRepository.findOne({ where: { id: photo.albumId } });
    if (album && album.photoCount > 0) {
      await this.albumRepository.update(photo.albumId, {
        photoCount: album.photoCount - 1,
      });
    }

    return { message: '删除成功' };
  }

  /**
   * 格式化相册数据
   */
  private formatAlbum(album: any): Record<string, any> {
    return {
      id: album.id,
      coupleId: album.coupleId,
      creatorId: album.creatorId,
      name: album.name,
      description: album.description,
      coverImage: album.coverImage,
      photoCount: album.photoCount || 0,
      createdAt: album.createdAt,
      updatedAt: album.updatedAt,
    };
  }

  /**
   * 格式化照片数据
   */
  private formatPhoto(photo: any): Record<string, any> {
    return {
      id: photo.id,
      albumId: photo.albumId,
      uploaderId: photo.uploaderId,
      url: photo.url,
      description: photo.description,
      createdAt: photo.createdAt,
    };
  }
}
