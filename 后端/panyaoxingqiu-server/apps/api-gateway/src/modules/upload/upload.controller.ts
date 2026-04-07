import {
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  BadRequestException,
  Query,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { UploadService } from './upload.service';
import { JwtAuthGuard, CurrentUserId } from '@app/common';

@ApiTags('Upload')
@Controller('upload')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('image')
  @ApiOperation({ summary: '上传单张图片' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        type: { type: 'string', description: '上传类型: avatar/couple/background/album/timeline' },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @CurrentUserId() userId: string,
    @UploadedFile() file: Express.Multer.File,
    @Query('type') type: string = 'common',
  ) {
    if (!file) {
      throw new BadRequestException('请选择要上传的图片');
    }
    return this.uploadService.uploadImage(userId, file, type);
  }

  @Post('images')
  @ApiOperation({ summary: '批量上传图片（最多9张）' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('files', 9))
  async uploadImages(
    @CurrentUserId() userId: string,
    @UploadedFiles() files: Express.Multer.File[],
    @Query('type') type: string = 'album',
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('请选择要上传的图片');
    }
    return this.uploadService.uploadImages(userId, files, type);
  }
}
