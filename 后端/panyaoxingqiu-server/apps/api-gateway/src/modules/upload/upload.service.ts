import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import * as fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

// OSS 图片类型目录映射
const TYPE_DIRS: Record<string, string> = {
  avatar: 'avatars',
  couple: 'couples',
  background: 'backgrounds',
  album: 'albums',
  timeline: 'timelines',
  common: 'common',
};

// 允许的图片类型
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

// 最大文件大小 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;

@Injectable()
export class UploadService {
  private readonly ossEnabled: boolean;
  private readonly cdnBaseUrl: string;
  private readonly localUploadDir: string;

  constructor(private readonly configService: ConfigService) {
    this.ossEnabled = this.configService.get<string>('OSS_ENABLED') === 'true';
    this.cdnBaseUrl = this.configService.get<string>('CDN_BASE_URL') || '';
    this.localUploadDir =
      this.configService.get<string>('LOCAL_UPLOAD_DIR') ||
      path.join(process.cwd(), 'uploads');
  }

  /**
   * 上传单张图片
   */
  async uploadImage(
    userId: string,
    file: { buffer: Buffer; originalname: string; mimetype: string; size: number },
    type: string = 'common',
  ): Promise<{ url: string; filename: string; size: number }> {
    this.validateFile(file);

    if (this.ossEnabled) {
      return this.uploadToOss(userId, file, type);
    }

    return this.uploadToLocal(userId, file, type);
  }

  /**
   * 批量上传图片
   */
  async uploadImages(
    userId: string,
    files: { buffer: Buffer; originalname: string; mimetype: string; size: number }[],
    type: string = 'album',
  ): Promise<{ url: string; filename: string; size: number }[]> {
    const results: { url: string; filename: string; size: number }[] = [];

    for (const file of files) {
      const result = await this.uploadImage(userId, file, type);
      results.push(result);
    }

    return results;
  }

  /**
   * 上传到本地（开发环境）
   */
  private async uploadToLocal(
    userId: string,
    file: { buffer: Buffer; originalname: string; mimetype: string; size: number },
    type: string,
  ): Promise<{ url: string; filename: string; size: number }> {
    const dir = TYPE_DIRS[type] || 'common';
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    const filename = `${dir}/${userId}/${uuidv4()}${ext}`;
    const fullPath = path.join(this.localUploadDir, filename);

    // 确保目录存在
    const dirPath = path.dirname(fullPath);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    // 写入文件
    fs.writeFileSync(fullPath, file.buffer);

    const baseUrl = this.configService.get<string>('APP_BASE_URL') || 'http://localhost:3000';
    const url = `${baseUrl}/uploads/${filename}`;

    return { url, filename, size: file.size };
  }

  /**
   * 上传到阿里云OSS
   */
  private async uploadToOss(
    userId: string,
    file: { buffer: Buffer; originalname: string; mimetype: string; size: number },
    type: string,
  ): Promise<{ url: string; filename: string; size: number }> {
    try {
      // 动态加载 ali-oss（避免强依赖）
      const OSS = require('ali-oss');

      const client = new OSS({
        region: this.configService.get<string>('OSS_REGION'),
        accessKeyId: this.configService.get<string>('OSS_ACCESS_KEY_ID'),
        accessKeySecret: this.configService.get<string>('OSS_ACCESS_KEY_SECRET'),
        bucket: this.configService.get<string>('OSS_BUCKET'),
      });

      const dir = TYPE_DIRS[type] || 'common';
      const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
      const filename = `panyaoxingqiu/${dir}/${userId}/${uuidv4()}${ext}`;

      await client.put(filename, file.buffer, {
        headers: { 'Content-Type': file.mimetype },
      });

      const cdnBase = this.cdnBaseUrl || `https://${this.configService.get('OSS_BUCKET')}.${this.configService.get('OSS_REGION')}.aliyuncs.com`;
      const url = `${cdnBase}/${filename}`;

      return { url, filename, size: file.size };
    } catch (error) {
      console.error('OSS上传失败:', error);
      throw new InternalServerErrorException('图片上传失败，请重试');
    }
  }

  /**
   * 验证文件
   */
  private validateFile(file: { mimetype: string; size: number; originalname: string }): void {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException('只支持 JPEG、PNG、WebP、GIF 格式图片');
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new BadRequestException('图片大小不能超过 10MB');
    }
  }
}
