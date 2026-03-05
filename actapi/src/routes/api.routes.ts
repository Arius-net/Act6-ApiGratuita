import { Router } from 'express';
import { apiController } from '../controllers/api.controller';

const router = Router();


router.get('/hearthstone-draw', (req, res) => apiController.hearthstoneDraw(req, res));

export default router;
