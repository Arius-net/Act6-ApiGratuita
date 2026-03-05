import { Router } from 'express';
import hearthstoneController from '../controllers/hearthstone.controller';

const router = Router();

/**
 * @route   GET /api/hearthstone-draw
 * @desc    Roba una carta y obtiene una carta correspondiente de Hearthstone
 * @access  Public
 */
router.get('/hearthstone-draw', (req, res) => 
  hearthstoneController.drawHearthstoneCard(req, res)
);

/**
 * @route   GET /api/health
 * @desc    Verifica el estado del servicio
 * @access  Public
 */
router.get('/health', (req, res) => 
  hearthstoneController.healthCheck(req, res)
);

export default router;
