import { Router, Request, Response } from 'express';
import { fileTypeFromBuffer } from 'file-type';
import type { Asset, ExifData } from '../types/assets.types';
import DatabaseService from '../services/database.service';
import StorageService from '../services/storage.service';
import ImageService from '../services/image.service';
import { upload } from '../middleware/upload';
import logger from '../middleware/logger';
import { NotFoundError, BadRequestError, InternalServerError } from '../middleware/error-handler';
import { existsSync, createReadStream, unlinkSync } from 'node:fs';
import { calculateBufferHashAsync } from '../utils/hash';

const router = Router();
const databaseService = DatabaseService.getInstance();
const storageService = StorageService.getInstance();
const imageService = ImageService.getInstance();

interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
}

/**
 * @swagger
 * /api/assets/upload:
 *   post:
 *     summary: 上传文件
 *     description: 上传图片或视频文件，自动生成缩略图并提取 EXIF 信息。如果文件已存在（基于 SHA-256 hash），则返回现有记录而不重复上传
 *     tags: [Assets]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: 要上传的文件(支持图片或视频)
 *     responses:
 *       200:
 *         description: 文件已存在，返回现有记录
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 duplicate:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: File already exists
 *                 data:
 *                   allOf:
 *                     - $ref: '#/components/schemas/Asset'
 *                     - type: object
 *                       properties:
 *                         exif:
 *                           $ref: '#/components/schemas/ExifData'
 *       201:
 *         description: 文件上传成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   allOf:
 *                     - $ref: '#/components/schemas/Asset'
 *                     - type: object
 *                       properties:
 *                         exif:
 *                           $ref: '#/components/schemas/ExifData'
 *       400:
 *         description: 请求错误(未上传文件或不支持的文件类型)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: 服务器内部错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/upload', upload.single('file'), async (req: Request, res: Response): Promise<void> => {
  logger.debug('[AssetController] Upload endpoint called');
  const file = req.file as MulterFile | undefined;

  if (!file) {
    logger.warn('[AssetController] No file uploaded');
    throw new BadRequestError('No file uploaded');
  }

  logger.debug('[AssetController] File received', {
    filename: file.originalname,
    size: file.size,
    mimetype: file.mimetype,
    path: file.path,
  });

  try {
    logger.debug('[AssetController] Reading file from path', { path: file.path });
    const buffer = await import('node:fs').then(fs => fs.readFileSync(file.path));
    logger.debug('[AssetController] File buffer read successfully', { bufferSize: buffer.length });
    
    // Calculate SHA-256 hash for deduplication
    const fileHash = await calculateBufferHashAsync(buffer);
    logger.debug('[AssetController] File hash calculated', { hash: fileHash });

    // Check if file with same hash already exists
    const existingAsset = databaseService.getAssetByHash(fileHash);
    if (existingAsset) {
      logger.info('[AssetController] Duplicate file detected, returning existing asset', {
        hash: fileHash,
        existingAssetId: existingAsset.id,
        originalName: file.originalname,
      });
      
      // Clean up temp file
      unlinkSync(file.path);
      
      // Return existing asset with EXIF data if available
      let exif: ExifData | undefined;
      if (existingAsset.file_type === 'image') {
        exif = databaseService.getExifByAssetId(existingAsset.id!);
      }
      
      // Return 200 with existing asset information
      res.status(200).json({
        success: true,
        duplicate: true,
        message: 'File already exists',
        data: {
          ...existingAsset,
          exif,
        },
      });
      return;
    }
    
    const type = await fileTypeFromBuffer(buffer);
    logger.debug('[AssetController] File type detected', { type });

    if (!type) {
      logger.warn('[AssetController] Could not detect file type', { filename: file.originalname });
      unlinkSync(file.path);
      throw new BadRequestError('Could not detect file type');
    }

    if (!type.mime.startsWith('image/') && !type.mime.startsWith('video/')) {
      logger.warn('[AssetController] Unsupported file type', { mime: type.mime, filename: file.originalname });
      unlinkSync(file.path);
      throw new BadRequestError(`Only image and video files are allowed. Detected type: ${type.mime}`);
    }

    logger.debug('[AssetController] Calling storageService.uploadFile');
    const uploadResult = storageService.uploadFile(file);
    logger.debug('[AssetController] File uploaded to storage', { uploadResult });
    unlinkSync(file.path);

    const fileType: 'image' | 'video' = type.mime.startsWith('image/') ? 'image' : 'video';

    let width: number | undefined;
    let height: number | undefined;
    let thumbnailPath: string | undefined;
    let exif: ExifData | undefined;

    if (fileType === 'image') {
      const ext = type.ext ? `.${type.ext}` : '.jpg';
      const thumbPath = storageService.getThumbnailPath(0, ext);

      try {
        const processResult = await imageService.processImage(
          uploadResult.filePath,
          type.mime,
          type.ext,
          thumbPath,
          512,
          0,
        );

        if (processResult.canProcess) {
          width = processResult.width;
          height = processResult.height;
          thumbnailPath = processResult.thumbnailPath;
        }
      } catch (processError) {
        logger.warn('[AssetController] Image processing failed', { error: processError });
      }
    }

    const asset: Asset = {
      original_name: file.originalname,
      stored_name: uploadResult.storedName,
      file_path: uploadResult.filePath,
      thumbnail_path: thumbnailPath,
      mime_type: type.mime,
      file_type: fileType,
      file_size: file.size,
      width,
      height,
      file_hash: fileHash,
      created_at: Date.now(),
    };

    const createdAsset = databaseService.createAsset(asset);

    if (fileType === 'image' && createdAsset.id) {
      try {
        const exifData = await imageService.extractExif(
          uploadResult.filePath,
          createdAsset.id,
        );
        if (exifData) {
          databaseService.createExif(exifData);
          exif = databaseService.getExifByAssetId(createdAsset.id);
        }
      } catch (exifError) {
        logger.warn('[AssetController] Failed to extract EXIF', { error: exifError });
      }
    }

    res.status(201).json({
      success: true,
      data: {
        ...createdAsset,
        exif,
      },
    });
  } catch (error) {
    logger.error('[AssetController] Upload error - Details:', {
      error: error as any,
      errorMessage: (error as any).message,
      errorCode: (error as any).code,
      errorStack: (error as any).stack,
    });
    if (file && existsSync(file.path)) {
      logger.debug('[AssetController] Cleaning up temp file', { path: file.path });
      unlinkSync(file.path);
    }
    throw new InternalServerError('Failed to upload file');
  }
});

/**
 * @swagger
 * /api/assets:
 *   get:
 *     summary: 获取资产列表
 *     description: 分页获取所有资产列表，支持按类型筛选
 *     tags: [Assets]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: 每页返回的数量
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: 偏移量(用于分页)
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [image, video]
 *         description: 按文件类型筛选
 *     responses:
 *       200:
 *         description: 成功获取资产列表
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Asset'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     limit:
 *                       type: integer
 *                     offset:
 *                       type: integer
 *       500:
 *         description: 服务器内部错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const limit = Number(req.query.limit) || 20;
    const offset = Number(req.query.offset) || 0;
    const type = req.query.type as string | undefined;

    const assets = databaseService.getAssets(limit, offset, type);

    res.json({
      success: true,
      data: assets,
      pagination: {
        limit,
        offset,
      },
    });
  } catch (error) {
    logger.error('[AssetController] List error', { error });
    throw new InternalServerError('Failed to retrieve assets');
  }
});

/**
 * @swagger
 * /api/assets/{id}:
 *   get:
 *     summary: 获取单个资产详情
 *     description: 根据 ID 获取资产的详细信息，包括 EXIF 信息(如果是图片)
 *     tags: [Assets]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 资产 ID
 *     responses:
 *       200:
 *         description: 成功获取资产详情
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   allOf:
 *                     - $ref: '#/components/schemas/Asset'
 *                     - type: object
 *                       properties:
 *                         exif:
 *                           $ref: '#/components/schemas/ExifData'
 *       404:
 *         description: 资产不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: 服务器内部错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const asset = databaseService.getAssetById(id);

    if (!asset) {
      throw new NotFoundError('Asset not found');
    }

    let exif: ExifData | undefined;
    if (asset.file_type === 'image') {
      exif = databaseService.getExifByAssetId(id);
    }

    res.json({
      success: true,
      data: {
        ...asset,
        exif,
      },
    });
  } catch (error) {
    logger.error('[AssetController] Get asset error', { error });
    if (error instanceof NotFoundError) {
      throw error;
    }
    throw new InternalServerError('Failed to retrieve asset');
  }
});

/**
 * @swagger
 * /api/assets/{id}/file:
 *   get:
 *     summary: 下载资产文件
 *     description: 根据 ID 下载原始文件
 *     tags: [Assets]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 资产 ID
 *     responses:
 *       200:
 *         description: 成功获取文件
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: 资产或文件不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: 服务器内部错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:id/file', async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const asset = databaseService.getAssetById(id);

    if (!asset) {
      throw new NotFoundError('Asset not found');
    }

    if (!existsSync(asset.file_path)) {
      throw new NotFoundError('File not found');
    }

    res.set('Content-Type', asset.mime_type);
    res.set('Content-Disposition', `inline; filename="${asset.original_name}"`);
    createReadStream(asset.file_path).pipe(res);
  } catch (error) {
    logger.error('[AssetController] Get file error', { error });
    if (error instanceof NotFoundError) {
      throw error;
    }
    throw new InternalServerError('Failed to retrieve file');
  }
});

/**
 * @swagger
 * /api/assets/{id}/thumbnail:
 *   get:
 *     summary: 获取资产缩略图
 *     description: 根据 ID 获取资产的缩略图(仅图片)
 *     tags: [Assets]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 资产 ID
 *     responses:
 *       200:
 *         description: 成功获取缩略图
 *         content:
 *           image/jpeg:
 *             schema:
 *               type: string
 *               format: binary
 *         headers:
 *           Cache-Control:
 *             schema:
 *               type: string
 *             example: public, max-age=31536000
 *       400:
 *         description: 资产没有缩略图
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: 资产或缩略图不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: 服务器内部错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:id/thumbnail', async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const asset = databaseService.getAssetById(id);

    if (!asset) {
      throw new NotFoundError('Asset not found');
    }

    if (!asset.thumbnail_path) {
      throw new BadRequestError('Asset does not have a thumbnail');
    }

    if (!existsSync(asset.thumbnail_path)) {
      throw new NotFoundError('Thumbnail not found');
    }

    res.set('Content-Type', 'image/jpeg');
    res.set('Cache-Control', 'public, max-age=31536000');
    createReadStream(asset.thumbnail_path).pipe(res);
  } catch (error) {
    logger.error('[AssetController] Get thumbnail error', { error });
    if (error instanceof NotFoundError || error instanceof BadRequestError) {
      throw error;
    }
    throw new InternalServerError('Failed to retrieve thumbnail');
  }
});

/**
 * @swagger
 * /api/assets/{id}/exif:
 *   get:
 *     summary: 获取资产 EXIF 信息
 *     description: 根据 ID 获取图片的 EXIF 信息
 *     tags: [Assets]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 资产 ID
 *     responses:
 *       200:
 *         description: 成功获取 EXIF 信息
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/ExifData'
 *       400:
 *         description: 资产不是图片
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: 资产不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: 服务器内部错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:id/exif', async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const asset = databaseService.getAssetById(id);

    if (!asset) {
      throw new NotFoundError('Asset not found');
    }

    if (asset.file_type !== 'image') {
      throw new BadRequestError('Only images have EXIF data');
    }

    const exif = databaseService.getExifByAssetId(id);

    res.json({
      success: true,
      data: exif,
    });
  } catch (error) {
    logger.error('[AssetController] Get EXIF error', { error });
    if (error instanceof NotFoundError || error instanceof BadRequestError) {
      throw error;
    }
    throw new InternalServerError('Failed to retrieve EXIF data');
  }
});

/**
 * @swagger
 * /api/assets/{id}:
 *   delete:
 *     summary: 删除资产
 *     description: 根据 ID 删除资产，同时删除文件和缩略图
 *     tags: [Assets]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 资产 ID
 *     responses:
 *       200:
 *         description: 成功删除资产
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Asset deleted successfully
 *       404:
 *         description: 资产不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: 服务器内部错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const asset = databaseService.getAssetById(id);

    if (!asset) {
      throw new NotFoundError('Asset not found');
    }

    const deleted = databaseService.deleteAsset(id);

    if (deleted) {
      storageService.deleteFile(asset.file_path);
      if (asset.thumbnail_path) {
        storageService.deleteFile(asset.thumbnail_path);
      }

      res.json({
        success: true,
        message: 'Asset deleted successfully',
      });
    } else {
      throw new InternalServerError('Failed to delete asset');
    }
  } catch (error) {
    logger.error('[AssetController] Delete error', { error });
    if (error instanceof NotFoundError) {
      throw error;
    }
    throw new InternalServerError('Failed to delete asset');
  }
});

export default router;
