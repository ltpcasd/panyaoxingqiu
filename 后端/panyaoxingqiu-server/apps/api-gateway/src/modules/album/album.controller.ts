import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AlbumService } from './album.service';
import {
  CreateAlbumDto,
  UpdateAlbumDto,
  AlbumQueryDto,
  UploadPhotosDto,
  PhotoQueryDto,
} from './dto/album.dto';
import { JwtAuthGuard, CurrentUserId } from '@app/common';

@ApiTags('Album')
@Controller('albums')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT')
export class AlbumController {
  constructor(private readonly albumService: AlbumService) {}

  // =================== 相册接口 ===================

  @Post()
  @ApiOperation({ summary: '创建相册' })
  async createAlbum(
    @CurrentUserId() userId: string,
    @Body() dto: CreateAlbumDto,
  ) {
    return this.albumService.createAlbum(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: '获取相册列表' })
  async getAlbums(
    @CurrentUserId() userId: string,
    @Query() query: AlbumQueryDto,
  ) {
    return this.albumService.getAlbums(userId, query);
  }

  @Get(':albumId')
  @ApiOperation({ summary: '获取相册详情' })
  async getAlbumById(
    @CurrentUserId() userId: string,
    @Param('albumId') albumId: string,
  ) {
    return this.albumService.getAlbumById(userId, albumId);
  }

  @Put(':albumId')
  @ApiOperation({ summary: '更新相册信息' })
  async updateAlbum(
    @CurrentUserId() userId: string,
    @Param('albumId') albumId: string,
    @Body() dto: UpdateAlbumDto,
  ) {
    return this.albumService.updateAlbum(userId, albumId, dto);
  }

  @Delete(':albumId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '删除相册' })
  async deleteAlbum(
    @CurrentUserId() userId: string,
    @Param('albumId') albumId: string,
  ) {
    return this.albumService.deleteAlbum(userId, albumId);
  }

  // =================== 照片接口 ===================

  @Post(':albumId/photos')
  @ApiOperation({ summary: '上传照片到相册' })
  async uploadPhotos(
    @CurrentUserId() userId: string,
    @Param('albumId') albumId: string,
    @Body() dto: UploadPhotosDto,
  ) {
    return this.albumService.uploadPhotos(userId, albumId, dto);
  }

  @Get(':albumId/photos')
  @ApiOperation({ summary: '获取相册照片列表' })
  async getPhotos(
    @CurrentUserId() userId: string,
    @Param('albumId') albumId: string,
    @Query() query: PhotoQueryDto,
  ) {
    return this.albumService.getPhotos(userId, albumId, query);
  }

  @Delete('photos/:photoId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '删除照片' })
  async deletePhoto(
    @CurrentUserId() userId: string,
    @Param('photoId') photoId: string,
  ) {
    return this.albumService.deletePhoto(userId, photoId);
  }
}
