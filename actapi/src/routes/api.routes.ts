import { Router } from 'express';
import { apiController } from '../controllers/api.controller';

const router = Router();

router.get('/hearthstone-draw', (req, res) => apiController.hearthstoneDraw(req, res));

router.get('/hearthstone/cards', (req, res) => apiController.getAllHearthstoneCards(req, res));

router.get('/hearthstone/cards/search', (req, res) => apiController.searchHearthstoneCards(req, res));

router.get('/hearthstone/cards/:cardId', (req, res) => apiController.getHearthstoneCardById(req, res));

router.post('/decks', (req, res) => apiController.createDeck(req, res));

router.get('/decks', (req, res) => apiController.getAllDecks(req, res));

router.get('/decks/:deckId', (req, res) => apiController.getDeckById(req, res));

router.get('/decks/:deckId/stats', (req, res) => apiController.getDeckStats(req, res));

router.patch('/decks/:deckId', (req, res) => apiController.updateDeckName(req, res));

router.post('/decks/:deckId/cards', (req, res) => apiController.addCardToDeck(req, res));

router.delete('/decks/:deckId/cards/:cardId', (req, res) => apiController.removeCardFromDeck(req, res));

router.delete('/decks/:deckId/cards', (req, res) => apiController.clearDeck(req, res));

router.delete('/decks/:deckId', (req, res) => apiController.deleteDeck(req, res));

export default router;
