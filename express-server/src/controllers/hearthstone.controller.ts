import { Request, Response } from 'express';
import type { HearthstoneDrawResponse, ApiErrorResponse } from '../types/api.types';
import deckOfCardsService from '../services/deckOfCards.service';
import hearthstoneService from '../services/hearthstone.service';

/**
 * Controller para el endpoint de Hearthstone Draw
 * Orquesta los servicios de Deck of Cards y Hearthstone (Patrón SOA)
 */
class HearthstoneController {
  /**
   * Handler para GET /api/hearthstone-draw
   * Roba una carta tradicional y obtiene una carta correspondiente de Hearthstone
   */
  async drawHearthstoneCard(req: Request, res: Response): Promise<void> {
    try {
      console.log('\n🎯 [HearthstoneController] Iniciando proceso de robo de carta...');
      const startTime = Date.now();

      // ==========================================
      // PASO 1: Robar carta de Deck of Cards
      // ==========================================
      console.log('📝 Paso 1: Robando carta tradicional...');
      const drawnCard = await deckOfCardsService.drawCard();

      // ==========================================
      // PASO 2 & 3: Obtener carta de Hearthstone
      // (La autenticación se maneja internamente en el servicio)
      // ==========================================
      console.log('🎮 Paso 2-3: Obteniendo carta de Hearthstone...');
      const hearthstoneCard = await hearthstoneService.getCardByValue(drawnCard.valor);

      // ==========================================
      // Construir respuesta consolidada
      // ==========================================
      const duration = Date.now() - startTime;
      console.log(`✅ [HearthstoneController] Proceso completado exitosamente en ${duration}ms\n`);

      const response: HearthstoneDrawResponse = {
        success: true,
        drawnCard,
        hearthstoneCard,
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);

    } catch (error) {
      console.error('❌ [HearthstoneController] Error en el proceso:', error);

      // Construir respuesta de error
      const errorResponse: ApiErrorResponse = {
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: error instanceof Error ? error.message : 'Error desconocido al procesar la solicitud',
        timestamp: new Date().toISOString(),
        path: req.path,
        statusCode: 500,
      };

      res.status(500).json(errorResponse);
    }
  }

  /**
   * Handler para verificar el estado del servicio (Health Check)
   */
  async healthCheck(req: Request, res: Response): Promise<void> {
    res.status(200).json({
      status: 'OK',
      message: 'Hearthstone API Service is running',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  }
}

export default new HearthstoneController();
