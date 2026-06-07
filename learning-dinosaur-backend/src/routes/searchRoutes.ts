import express from 'express';
import * as searchController from '../controllers/searchController';
import authMiddleware from '../middleware/authMiddleware';

const router = express.Router();

router.get('/', authMiddleware, searchController.globalSearch);

export default router;
