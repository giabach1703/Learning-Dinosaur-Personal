import express from 'express';
import * as deckController from '../controllers/deckController';
import authMiddleware from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validationMiddleware';
import { deckSchema, cardSchema } from '../validation/schemas';

const router = express.Router();

router.get('/tags/all', authMiddleware, deckController.getTags);
router.get('/', authMiddleware, deckController.getDecks);
router.post('/', authMiddleware, validateRequest(deckSchema), deckController.createDeck);

router.get('/:deckId', authMiddleware, deckController.getDeckById);
router.put('/:deckId', authMiddleware, validateRequest(deckSchema), deckController.updateDeck);
router.delete('/:deckId', authMiddleware, deckController.deleteDeck);

router.get('/:deckId/cards', authMiddleware, deckController.getDeckCards);
router.post('/:deckId/cards', authMiddleware, validateRequest(cardSchema), deckController.createCardInDeck);

export default router;
