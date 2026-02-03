import { Router, Response } from 'express';
import assetsRoutes from './assets.routes';

const router = Router();

/**
 * @swagger
 * /api/:
 *   get:
 *     summary: API 健康检查
 *     description: 返回 API 服务状态信息
 *     tags: [General]
 *     responses:
 *       200:
 *         description: 服务正常
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                   example: lenbrary-server
 *                 version:
 *                   type: string
 *                   example: 1.0.0
 *                 status:
 *                   type: string
 *                   example: ok
 */
router.get('/', (_req: any, res: Response) => {
  res.json({
    name: 'lenbrary-server',
    version: '1.0.0',
    status: 'ok',
  });
});

router.use('/assets', assetsRoutes);

export default router;
