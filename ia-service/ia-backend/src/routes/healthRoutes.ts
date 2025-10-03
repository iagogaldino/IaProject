import { Router } from 'express';
import { healthController } from '../controllers/healthController';

const router = Router();

// Health check routes (no authentication required)
router.get('/', (req, res, next) => healthController.getHealthStatus(req, res, next));
router.get('/metrics', (req, res, next) => healthController.getMetrics(req, res, next));
router.get('/config', (req, res, next) => healthController.getConfigStatus(req, res, next));

export default router;
