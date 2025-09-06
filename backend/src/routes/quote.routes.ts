import { Router } from 'express';
import * as quoteController from '../controllers/quote.controller';

const router = Router();

// Public routes - no authentication required for motivational quotes
router.get('/daily', quoteController.getDailyQuote);
router.get('/random', quoteController.getRandomQuotes);
router.get('/category/:category', quoteController.getQuotesByCategory);
router.get('/', quoteController.getAllQuotes);

export default router;