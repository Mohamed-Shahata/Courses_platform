import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);
  public async uploadImageAndUpdate(
    filePath: string,
    folder: string = 'uplaods',
  ) {
    try {
      const result = await cloudinary.uploader.upload(filePath, { folder });

      if (fs.existsSync(filePath)) await fs.promises.unlink(filePath);

      return {
        url: result.secure_url,
        publicId: result.public_id,
      };
    } catch (error) {
      if (filePath && fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
      }

      throw new BadRequestException('File upload failed');
    }
  }

  async deleteImage(publicId: string): Promise<void> {
    try {
      const result = await cloudinary.uploader.destroy(publicId);

      if (result.result !== 'ok' && result.result !== 'not found') {
        throw new Error('Unexpected Cloudinary response');
      }
    } catch (err) {
      this.logger.error('Cloudinary delete failed', err);
      throw new BadRequestException('Image deletion failed');
    }
  }

  async uploadVideo(
    filePath: string,
    folder: string = 'videos',
    options?: {
      resource_type?: 'video' | 'auto';
      public_id?: string;
      eager?: any;
      chunk_size?: number;
    },
  ) {
    try {
      const result = await cloudinary.uploader.upload(filePath, {
        folder,
        resource_type: 'video',
        chunk_size: 6000000,
        eager: options?.eager || [
          { width: 300, height: 200, crop: 'pad', format: 'mp4' },
          { width: 854, height: 480, crop: 'pad', format: 'mp4' },
          { width: 1280, height: 720, crop: 'pad', format: 'mp4' },
        ],
        eager_async: true,
        ...options,
      });

      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
      }

      return {
        url: result.secure_url,
        publicId: result.public_id,
        duration: result.duration,
        format: result.format,
        bytes: result.bytes,
        width: result.width,
        height: result.height,
        eager: result.eager,
      };
    } catch (error) {
      this.logger.error('Video upload failed', error);

      if (filePath && fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
      }

      throw new BadRequestException('Video upload failed');
    }
  }

  async uploadVideoWithProgress(
    filePath: string,
    folder: string = 'videos',
    onProgress?: (progress: number) => void,
  ) {
    try {
      const result = await cloudinary.uploader.upload(
        filePath,
        {
          folder,
          resource_type: 'video',
          chunk_size: 6000000,
          eager: [
            { width: 300, height: 200, crop: 'pad', format: 'mp4' },
            { width: 854, height: 480, crop: 'pad', format: 'mp4' },
            { width: 1280, height: 720, crop: 'pad', format: 'mp4' },
          ],
          eager_async: true,
        },
        (progress) => {
          if (onProgress && progress) {
            const percentComplete = (progress.loaded / progress.total) * 100;
            onProgress(percentComplete);
          }
        },
      );

      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
      }

      return {
        url: result.secure_url,
        publicId: result.public_id,
        duration: result.duration,
        format: result.format,
        bytes: result.bytes,
        width: result.width,
        height: result.height,
        eager: result.eager,
      };
    } catch (error) {
      if (filePath && fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
      }

      throw new BadRequestException('Video upload failed');
    }
  }

  async deleteVideo(publicId: string): Promise<void> {
    try {
      const result = await cloudinary.uploader.destroy(publicId, {
        resource_type: 'video',
      });

      if (result.result !== 'ok' && result.result !== 'not found') {
        throw new Error('Unexpected Cloudinary response');
      }
    } catch (err) {
      this.logger.error('Cloudinary video delete failed', err);
      throw new BadRequestException('Video deletion failed');
    }
  }
}
