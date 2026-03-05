import { Request, Response } from 'express';
import { deckOfCardsService } from '../services/deckOfCards.service';
import { blizzardAuthService } from '../services/blizzardAuth.service';
import { hearthstoneService } from '../services/hearthstone.service';
import { UnifiedApiResponse, ErrorResponse } from '../types/api.types';
import axios from 'axios';
import { config } from '../config/config';

export class ApiController {

  async hearthstoneDraw(req: Request, res: Response): Promise<void> {
    try {
      console.log('[ApiController] Iniciando orquestación de APIs...');

      console.log('[STEP 1] Solicitando carta de Deck of Cards API...');
      const deckCard = await deckOfCardsService.drawCard();
      console.log(`[SUCCESS] Carta obtenida: ${deckCard.value} of ${deckCard.suit}`);

      console.log('[STEP 2] Solicitando token de acceso de Blizzard...');
      const accessToken = await blizzardAuthService.getAccessToken();
      console.log('[SUCCESS] Token de acceso obtenido');

      console.log('[STEP 3] Solicitando cartas de Hearthstone API...');
      const hearthstoneCards = await hearthstoneService.getCards(accessToken);
      console.log(`[SUCCESS] ${hearthstoneCards.length} cartas de Hearthstone obtenidas`);

      const response: UnifiedApiResponse = {
        success: true,
        data: {
          deckCard: {
            value: deckCard.value,
            suit: deckCard.suit,
            code: deckCard.code,
            image: deckCard.image,
          },
          hearthstoneCards: {
            total: hearthstoneCards.length,
            sample: hearthstoneCards.slice(0, 5), 
          },
        },
        timestamp: new Date().toISOString(),
      };

      console.log('[ApiController] Respuesta unificada construida exitosamente');
      res.status(200).json(response);
    } catch (error: any) {
      this.handleError(error, res);
    }
  }


  async healthCheck(req: Request, res: Response): Promise<void> {
    res.status(200).json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      service: 'Hearthstone Proxy API',
    });
  }


  private handleError(error: any, res: Response): void {
    console.error('[ApiController] Error en la orquestación:', error.message);

    let errorMessage = 'Error al procesar la solicitud';
    let statusCode = 500;

    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED') {
        errorMessage = 'Timeout al conectar con las APIs externas';
        statusCode = 504;
      } else if (error.response) {
        errorMessage = `Error en API externa: ${error.response.status} - ${error.response.statusText}`;
        statusCode = 502;
      } else if (error.request) {
        errorMessage = 'No se pudo conectar con las APIs externas';
        statusCode = 503;
      }
    } else if (error.message.includes('credenciales')) {
      errorMessage = 'Error de configuración del servidor';
      statusCode = 500;
    } else if (error.message.includes('Token')) {
      errorMessage = 'Error de autenticación con Blizzard';
      statusCode = 401;
    }

    const errorResponse: ErrorResponse = {
      success: false,
      error: {
        message: errorMessage,
        details: config.server.env === 'development' ? error.message : undefined,
        timestamp: new Date().toISOString(),
      },
    };

    res.status(statusCode).json(errorResponse);
  }
}

export const apiController = new ApiController();
