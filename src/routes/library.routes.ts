import { Router, Request, Response, NextFunction } from 'express';
import { upload } from '../middleware/upload';
import { BadRequestError, InternalServerError, NotFoundError } from '../middleware/error-handler';
import DatabaseService from '../services/database.service';
import LibraryService from '../services/library.service';
import type { ImportResult } from '../types/library.types';

const router = Router();
const databaseService = DatabaseService.getInstance();
const libraryService = LibraryService.getInstance();

function asyncRoute(handler: (req: Request, res: Response) => Promise<void>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    void handler(req, res).catch(next);
  };
}

interface MulterFile {
  originalname: string;
  size: number;
  path: string;
}

/**
 * MVP library asset listing with filters for visual browsing.
 */
router.get('/assets', (req: Request, res: Response): void => {
  const filters = libraryService.parseFilters(req.query);
  if (filters.groupBy && filters.groupBy !== 'flat') {
    const groups = libraryService.groupAssets(filters);
    res.json({
      success: true,
      data: groups,
      pagination: {
        limit: filters.limit,
        offset: filters.offset,
        hasMore: false,
      },
    });
    return;
  }
  const result = libraryService.listAssets(filters);
  res.json({
    success: true,
    data: result.assets,
    pagination: {
      limit: filters.limit,
      offset: filters.offset,
      hasMore: result.hasMore,
    },
  });
});

router.put('/assets/batch/tags', (req: Request, res: Response): void => {
  if (!Array.isArray(req.body?.assetIds)) {
    throw new BadRequestError('assetIds must be an array');
  }
  if (!Array.isArray(req.body?.tags)) {
    throw new BadRequestError('tags must be an array');
  }
  res.json({
    success: true,
    data: libraryService.batchTags(req.body.assetIds.map(Number), req.body.tags.map(String)),
  });
});

router.put('/assets/batch/favorite', (req: Request, res: Response): void => {
  if (!Array.isArray(req.body?.assetIds)) {
    throw new BadRequestError('assetIds must be an array');
  }
  res.json({
    success: true,
    data: libraryService.batchFavorite(req.body.assetIds.map(Number), Boolean(req.body?.favorite)),
  });
});

router.delete('/assets/batch', (req: Request, res: Response): void => {
  if (!Array.isArray(req.body?.assetIds)) {
    throw new BadRequestError('assetIds must be an array');
  }
  if (req.body?.confirmed !== true) {
    throw new BadRequestError('Batch delete requires confirmation');
  }
  res.json({
    success: true,
    data: libraryService.batchDelete(req.body.assetIds.map(Number)),
  });
});

/**
 * MVP library detail view model for a single asset.
 */
router.get('/assets/:id', (req: Request, res: Response): void => {
  const id = Number(req.params.id);
  const asset = libraryService.getAssetDetail(id);
  if (!asset) {
    throw new NotFoundError('Asset not found');
  }
  res.json({ success: true, data: asset });
});

/**
 * Sets the lightweight personal favorite marker for an asset.
 */
router.put('/assets/:id/favorite', (req: Request, res: Response): void => {
  const id = Number(req.params.id);
  if (!databaseService.getAssetById(id)) {
    throw new NotFoundError('Asset not found');
  }
  const favorite = Boolean(req.body?.favorite);
  libraryService.setFavorite(id, favorite);
  res.json({ success: true, data: { assetId: id, favorite } });
});

/**
 * Replaces free-form personal tags for an asset.
 */
router.put('/assets/:id/tags', (req: Request, res: Response): void => {
  const id = Number(req.params.id);
  if (!databaseService.getAssetById(id)) {
    throw new NotFoundError('Asset not found');
  }
  if (!Array.isArray(req.body?.tags)) {
    throw new BadRequestError('Tags must be an array');
  }
  const tags = libraryService.replaceTags(id, req.body.tags.map(String));
  res.json({ success: true, data: { assetId: id, tags } });
});

/**
 * Returns per-file import outcomes for a batch selected in the MVP UI.
 */
router.post('/import', upload.array('files'), asyncRoute(async (req: Request, res: Response): Promise<void> => {
  const files = req.files as MulterFile[] | undefined;
  if (!files || files.length === 0) {
    throw new BadRequestError('No files uploaded');
  }

  const results: ImportResult[] = [];
  for (const file of files) {
    results.push(await libraryService.importUploadedFile(file));
  }

  res.json({ success: true, data: { results, summary: libraryService.createImportSummary(results) } });
}));

/**
 * Read-only personal library health summary.
 */
router.get('/health', (_req: Request, res: Response): void => {
  res.json({ success: true, data: libraryService.getHealth() });
});

/**
 * Downloads a catalog/metadata index. Original media files are excluded.
 */
router.get('/export', (_req: Request, res: Response): void => {
  const summary = libraryService.getSummaryExport();
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="lenbrary-library-summary.json"');
  res.json(summary);
});

router.use((_req: Request, _res: Response): void => {
  throw new InternalServerError('Library route not implemented');
});

export default router;
