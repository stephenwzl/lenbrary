import { Inject, HTTPController, HTTPMethod, HTTPMethodEnum, type Context } from 'egg';
import { fileTypeFromBuffer } from 'file-type';
import type { Asset, ExifData } from '../schema/AssetsSchema';

interface EggFile {
  filepath: string;
  originalname?: string;
  size?: number;
}

@HTTPController({
  path: '/assets',
})
export class AssetController {
  @Inject()
  private ctx: Context;

  @Inject()
  private storageService: any;

  @Inject()
  private imageService: any;

  @Inject()
  private databaseService: any;

  @HTTPMethod({
    method: HTTPMethodEnum.POST,
    path: '/upload',
  })
  async upload() {
    const { ctx } = this;
    const file = ctx.request.files?.[0] as EggFile | undefined;

    if (!file) {
      ctx.status = 400;
      ctx.body = { success: false, error: 'No file uploaded' };
      return;
    }

    try {
      // 从 buffer 检测 MIME 类型
      const fs = await import('node:fs');
      const buffer = fs.readFileSync(file.filepath);
      let type = await fileTypeFromBuffer(buffer);

      // 无法检测 MIME 类型，拒绝上传
      if (!type) {
        ctx.status = 400;
        ctx.body = {
          success: false,
          error: 'Could not detect file type',
        };
        return;
      }

      // 只允许 image 和 video 类型
      if (!type.mime.startsWith('image/') && !type.mime.startsWith('video/')) {
        ctx.status = 400;
        ctx.body = {
          success: false,
          error: `Only image and video files are allowed. Detected type: ${type.mime}`,
        };
        return;
      }

      // 保存文件
      const uploadResult = this.storageService.uploadFile(file);

      // 确定文件类型
      const fileType: 'image' | 'video' =
        type.mime.startsWith('image/') ? 'image' : 'video';

      let width: number | undefined;
      let height: number | undefined;
      let thumbnailPath: string | undefined;
      let exif: ExifData | undefined;

      // 如果是图片，尝试处理（生成缩略图、提取 EXIF）
      if (fileType === 'image') {
        const ext = type.ext ? `.${type.ext}` : '.jpg';
        const thumbPath = this.storageService.getThumbnailPath(0, ext);

        try {
          const processResult = await this.imageService.processImage(
            uploadResult.filePath,
            type.mime,
            type.ext,
            thumbPath,
            ctx.app.config.assets.thumbnailSize,
            0, // assetId 先用 0，等到数据库插入后再更新
          );

          if (processResult.canProcess) {
            width = processResult.width;
            height = processResult.height;
            thumbnailPath = processResult.thumbnailPath;
          }
        } catch (processError) {
          ctx.logger.warn('[AssetController] Image processing failed: %s', processError);
          // 图片处理失败，继续保存但不生成缩略图
        }
      }

      // 创建资产记录
      const asset: Asset = {
        original_name: file.originalname || file.filepath.split('/').pop() || 'unknown',
        stored_name: uploadResult.storedName,
        file_path: uploadResult.filePath,
        thumbnail_path: thumbnailPath,
        mime_type: type.mime,
        file_type: fileType,
        file_size: file.size || 0,
        width,
        height,
        created_at: Date.now(),
      };

      const createdAsset = this.databaseService.createAsset(asset);

      // 如果是图片，提取并保存 EXIF
      if (fileType === 'image' && createdAsset.id) {
        try {
          const exifData = await this.imageService.extractExif(
            uploadResult.filePath,
            createdAsset.id,
          );
          if (exifData) {
            this.databaseService.createExif(exifData);
            exif = this.databaseService.getExifByAssetId(createdAsset.id);
          }
        } catch (exifError) {
          ctx.logger.warn('[AssetController] Failed to extract EXIF: %s', exifError);
          // EXIF 提取失败，不中断流程
        }
      }

      ctx.status = 201;
      ctx.body = {
        success: true,
        data: {
          ...createdAsset,
          exif,
        },
      };
    } catch (error) {
      ctx.logger.error('[AssetController] Upload error: %s', error);
      ctx.status = 500;
      ctx.body = {
        success: false,
        error: 'Failed to upload file',
      };
    }
  }

  @HTTPMethod({
    method: HTTPMethodEnum.GET,
    path: '/',
  })
  async list() {
    const { ctx } = this;
    try {
      const limit = Number(ctx.query.limit) || 20;
      const offset = Number(ctx.query.offset) || 0;
      const type = ctx.query.type as string | undefined;

      const assets = this.databaseService.getAssets(limit, offset, type);

      ctx.body = {
        success: true,
        data: assets,
        pagination: {
          limit,
          offset,
        },
      };
    } catch (error) {
      ctx.logger.error('[AssetController] List error: %s', error);
      ctx.status = 500;
      ctx.body = {
        success: false,
        error: 'Failed to retrieve assets',
      };
    }
  }

  @HTTPMethod({
    method: HTTPMethodEnum.GET,
    path: '/:id',
  })
  async getAsset() {
    const { ctx } = this;
    try {
      const id = ctx.params?.id ? Number(ctx.params.id) : 0;
      const asset = this.databaseService.getAssetById(id);

      if (!asset) {
        ctx.status = 404;
        ctx.body = {
          success: false,
          error: 'Asset not found',
        };
        return;
      }

      let exif: ExifData | undefined;
      if (asset.file_type === 'image') {
        exif = this.databaseService.getExifByAssetId(id);
      }

      ctx.body = {
        success: true,
        data: {
          ...asset,
          exif,
        },
      };
    } catch (error) {
      ctx.logger.error('[AssetController] Get asset error: %s', error);
      ctx.status = 500;
      ctx.body = {
        success: false,
        error: 'Failed to retrieve asset',
      };
    }
  }

  @HTTPMethod({
    method: HTTPMethodEnum.GET,
    path: '/:id/file',
  })
  async getFile() {
    const { ctx } = this;
    try {
      const id = ctx.params?.id ? Number(ctx.params.id) : 0;
      const asset = this.databaseService.getAssetById(id);

      if (!asset) {
        ctx.status = 404;
        ctx.body = {
          success: false,
          error: 'Asset not found',
        };
        return;
      }

      const fs = await import('node:fs');
      if (!fs.existsSync(asset.file_path)) {
        ctx.status = 404;
        ctx.body = {
          success: false,
          error: 'File not found',
        };
        return;
      }

      ctx.set('Content-Type', asset.mime_type);
      ctx.set('Content-Disposition', `inline; filename="${asset.original_name}"`);
      ctx.body = fs.createReadStream(asset.file_path);
    } catch (error) {
      ctx.logger.error('[AssetController] Get file error: %s', error);
      ctx.status = 500;
      ctx.body = {
        success: false,
        error: 'Failed to retrieve file',
      };
    }
  }

  @HTTPMethod({
    method: HTTPMethodEnum.GET,
    path: '/:id/thumbnail',
  })
  async getThumbnail() {
    const { ctx } = this;
    try {
      const id = ctx.params?.id ? Number(ctx.params.id) : 0;
      const asset = this.databaseService.getAssetById(id);

      if (!asset) {
        ctx.status = 404;
        ctx.body = {
          success: false,
          error: 'Asset not found',
        };
        return;
      }

      if (!asset.thumbnail_path) {
        ctx.status = 400;
        ctx.body = {
          success: false,
          error: 'Asset does not have a thumbnail',
        };
        return;
      }

      const fs = await import('node:fs');
      if (!fs.existsSync(asset.thumbnail_path)) {
        ctx.status = 404;
        ctx.body = {
          success: false,
          error: 'Thumbnail not found',
        };
        return;
      }

      ctx.set('Content-Type', 'image/jpeg');
      ctx.set('Cache-Control', 'public, max-age=31536000');
      ctx.body = fs.createReadStream(asset.thumbnail_path);
    } catch (error) {
      ctx.logger.error('[AssetController] Get thumbnail error: %s', error);
      ctx.status = 500;
      ctx.body = {
        success: false,
        error: 'Failed to retrieve thumbnail',
      };
    }
  }

  @HTTPMethod({
    method: HTTPMethodEnum.GET,
    path: '/:id/exif',
  })
  async getExif() {
    const { ctx } = this;
    try {
      const id = ctx.params?.id ? Number(ctx.params.id) : 0;
      const asset = this.databaseService.getAssetById(id);

      if (!asset) {
        ctx.status = 404;
        ctx.body = {
          success: false,
          error: 'Asset not found',
        };
        return;
      }

      if (asset.file_type !== 'image') {
        ctx.status = 400;
        ctx.body = {
          success: false,
          error: 'Only images have EXIF data',
        };
        return;
      }

      const exif = this.databaseService.getExifByAssetId(id);

      ctx.body = {
        success: true,
        data: exif,
      };
    } catch (error) {
      ctx.logger.error('[AssetController] Get EXIF error: %s', error);
      ctx.status = 500;
      ctx.body = {
        success: false,
        error: 'Failed to retrieve EXIF data',
      };
    }
  }

  @HTTPMethod({
    method: HTTPMethodEnum.DELETE,
    path: '/:id',
  })
  async deleteAsset() {
    const { ctx } = this;
    try {
      const id = ctx.params?.id ? Number(ctx.params.id) : 0;
      const asset = this.databaseService.getAssetById(id);

      if (!asset) {
        ctx.status = 404;
        ctx.body = {
          success: false,
          error: 'Asset not found',
        };
        return;
      }

      // 删除数据库记录（会级联删除 EXIF）
      const deleted = this.databaseService.deleteAsset(id);

      if (deleted) {
        // 删除文件
        this.storageService.deleteFile(asset.file_path);
        if (asset.thumbnail_path) {
          this.storageService.deleteFile(asset.thumbnail_path);
        }

        ctx.body = {
          success: true,
          message: 'Asset deleted successfully',
        };
      } else {
        ctx.status = 500;
        ctx.body = {
          success: false,
          error: 'Failed to delete asset',
        };
      }
    } catch (error) {
      ctx.logger.error('[AssetController] Delete error: %s', error);
      ctx.status = 500;
      ctx.body = {
        success: false,
        error: 'Failed to delete asset',
      };
    }
  }
}
