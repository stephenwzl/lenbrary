import { Router, Response } from 'express';
import assetsRoutes from './assets.routes';

const router = Router();

router.get('/', (_req: any, res: Response) => {
  res.json({
    name: 'lenbrary-server',
    version: '1.0.0',
    status: 'ok',
  });
});

router.use('/assets', assetsRoutes);

export default router;
