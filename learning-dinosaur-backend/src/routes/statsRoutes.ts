import express from 'express';
import * as statsController from '../controllers/statsController';
import authMiddleware from '../middleware/authMiddleware';

const router = express.Router();

router.get('/overview', authMiddleware, statsController.getOverview);
router.get('/weekly', authMiddleware, statsController.getWeeklyStats);

export default router;
