import express from 'express';
import * as cardController from '../controllers/cardController';
import authMiddleware from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validationMiddleware';
import { updateCardSchema } from '../validation/schemas';

const router = express.Router();

router.get('/', authMiddleware, cardController.getCards);
router.put('/:cardId', authMiddleware, validateRequest(updateCardSchema), cardController.updateCard);
router.delete('/:cardId', authMiddleware, cardController.deleteCard);
router.patch('/:cardId/review-flag', authMiddleware, cardController.toggleReviewFlag);

export default router;
