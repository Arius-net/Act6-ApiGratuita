import { Router } from 'express';
import apiRoutes from './api.routes';
import healthRoutes from './health.routes';

const router = Router();

// Montar rutas
router.use('/api', apiRoutes);
router.use('/', healthRoutes);

export default router;
