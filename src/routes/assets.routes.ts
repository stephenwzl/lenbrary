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

router.post('/upload', upload.single('file'), async (req: Request, res: Response): Promise<void> => {
  const file = req.file as MulterFile | undefined;

  if (!file) {
    throw new BadRequestError('No file uploaded');
  }

  try {
    const buffer = await import('node:fs').then(fs => fs.readFileSync(file.path));
    const type = await fileTypeFromBuffer(buffer);

    if (!type) {
      unlinkSync(file.path);
      throw new BadRequestError('Could not detect file type');
    }

    if (!type.mime.startsWith('image/') && !type.mime.startsWith('video/')) {
      unlinkSync(file.path);
      throw new BadRequestError(`Only image and video files are allowed. Detected type: ${type.mime}`);
    }

    const uploadResult = storageService.uploadFile(file);
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
    if (file && existsSync(file.path)) {
      unlinkSync(file.path);
    }
    logger.error('[AssetController] Upload error', { error });
    throw new InternalServerError('Failed to upload file');
  }
});

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
