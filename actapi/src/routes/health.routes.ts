import { Router } from 'express';
import { apiController } from '../controllers/api.controller';

const router = Router();

router.get('/health', (req, res) => apiController.healthCheck(req, res));

export default router;
