import express from 'express';
import * as badgeController from '../controllers/badgeController';
import authMiddleware from '../middleware/authMiddleware';

const router = express.Router();

router.get('/', authMiddleware, badgeController.getBadges);

export default router;
