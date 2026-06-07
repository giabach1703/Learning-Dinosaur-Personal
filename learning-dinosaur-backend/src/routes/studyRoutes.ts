import express from 'express';
import * as studyController from '../controllers/studyController';
import authMiddleware from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validationMiddleware';
import { reviewCardSchema } from '../validation/schemas';

const router = express.Router();

router.get('/decks/:deckId/session', authMiddleware, studyController.getStudySession);
router.post('/cards/:cardId/review', authMiddleware, validateRequest(reviewCardSchema), studyController.reviewCard);

export default router;
