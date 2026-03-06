import { Request, Response } from 'express';
import { deckOfCardsService } from '../services/deckOfCards.service';
import { blizzardAuthService } from '../services/blizzardAuth.service';
import { hearthstoneService } from '../services/hearthstone.service';
import { deckService } from '../services/deck.service';
import { UnifiedApiResponse, ErrorResponse, CreateDeckRequest, AddCardToDeckRequest } from '../types/api.types';
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


  async getAllHearthstoneCards(req: Request, res: Response): Promise<void> {
    try {
      console.log('[ApiController] Obteniendo todas las cartas de Hearthstone...');

      // Permitir pageSize personalizado desde query params
      const pageSize = req.query.pageSize ? parseInt(req.query.pageSize as string) : undefined;
      const page = req.query.page ? parseInt(req.query.page as string) : undefined;

      const accessToken = await blizzardAuthService.getAccessToken();
      
      // Si se especifica pageSize o page, usar searchCards, si no usar getCards
      let cards;
      if (pageSize || page) {
        const searchParams: any = {};
        if (pageSize) searchParams.pageSize = pageSize;
        if (page) searchParams.page = page;
        cards = await hearthstoneService.searchCards(searchParams, accessToken);
      } else {
        cards = await hearthstoneService.getCards(accessToken);
      }

      res.status(200).json({
        success: true,
        data: {
          cards,
          total: cards.length,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      this.handleError(error, res);
    }
  }


  async searchHearthstoneCards(req: Request, res: Response): Promise<void> {
    try {
      console.log('[ApiController] Buscando cartas de Hearthstone con filtros...');

      const {
        set,
        class: cardClass,
        manaCost,
        attack,
        health,
        collectible,
        rarity,
        type,
        minionType,
        keyword,
        textFilter,
        page,
        pageSize,
        sort,
        order,
      } = req.query;

      const searchParams: any = {};
      if (set) searchParams.set = set;
      if (cardClass) searchParams.class = cardClass;
      if (manaCost) searchParams.manaCost = parseInt(manaCost as string);
      if (attack) searchParams.attack = parseInt(attack as string);
      if (health) searchParams.health = parseInt(health as string);
      if (collectible) searchParams.collectible = parseInt(collectible as string);
      if (rarity) searchParams.rarity = rarity;
      if (type) searchParams.type = type;
      if (minionType) searchParams.minionType = minionType;
      if (keyword) searchParams.keyword = keyword;
      if (textFilter) searchParams.textFilter = textFilter;
      if (page) searchParams.page = parseInt(page as string);
      if (pageSize) searchParams.pageSize = parseInt(pageSize as string);
      if (sort) searchParams.sort = sort;
      if (order) searchParams.order = order as 'asc' | 'desc';

      const accessToken = await blizzardAuthService.getAccessToken();
      const cards = await hearthstoneService.searchCards(searchParams, accessToken);

      res.status(200).json({
        success: true,
        data: {
          cards,
          total: cards.length,
          filters: searchParams,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      this.handleError(error, res);
    }
  }

  /**
   * Obtener información de una carta específica por ID
   */
  async getHearthstoneCardById(req: Request, res: Response): Promise<void> {
    try {
      const { cardId } = req.params;
      console.log(`[ApiController] Obteniendo carta con ID ${cardId}...`);

      if (!cardId || isNaN(parseInt(cardId))) {
        res.status(400).json({
          success: false,
          error: {
            message: 'ID de carta inválido',
            timestamp: new Date().toISOString(),
          },
        });
        return;
      }

      const accessToken = await blizzardAuthService.getAccessToken();
      const card = await hearthstoneService.getCardById(parseInt(cardId), accessToken);

      res.status(200).json({
        success: true,
        data: card,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      this.handleError(error, res);
    }
  }

  // ============= DECK MANAGEMENT ENDPOINTS =============

  /**
   * Crear un nuevo mazo vacío
   */
  async createDeck(req: Request, res: Response): Promise<void> {
    try {
      const { name }: CreateDeckRequest = req.body;

      if (!name || name.trim() === '') {
        res.status(400).json({
          success: false,
          error: {
            message: 'El nombre del mazo es requerido',
            timestamp: new Date().toISOString(),
          },
        });
        return;
      }

      console.log(`[ApiController] Creando nuevo mazo: ${name}`);
      const deck = deckService.createDeck(name);

      res.status(201).json({
        success: true,
        data: deck,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      this.handleError(error, res);
    }
  }

  /**
   * Obtener todos los mazos
   */
  async getAllDecks(req: Request, res: Response): Promise<void> {
    try {
      console.log('[ApiController] Obteniendo todos los mazos...');
      const decks = deckService.getAllDecks();

      res.status(200).json({
        success: true,
        data: {
          decks,
          total: decks.length,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      this.handleError(error, res);
    }
  }

  /**
   * Obtener un mazo específico por ID
   */
  async getDeckById(req: Request, res: Response): Promise<void> {
    try {
      const { deckId } = req.params;
      console.log(`[ApiController] Obteniendo mazo con ID ${deckId}...`);

      const deck = deckService.getDeckById(deckId);
      if (!deck) {
        res.status(404).json({
          success: false,
          error: {
            message: 'Mazo no encontrado',
            timestamp: new Date().toISOString(),
          },
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: deck,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      this.handleError(error, res);
    }
  }

  /**
   * Agregar una carta al mazo
   */
  async addCardToDeck(req: Request, res: Response): Promise<void> {
    try {
      const { deckId } = req.params;
      const { card }: AddCardToDeckRequest = req.body;

      if (!card || !card.id) {
        res.status(400).json({
          success: false,
          error: {
            message: 'La información de la carta es inválida',
            timestamp: new Date().toISOString(),
          },
        });
        return;
      }

      console.log(`[ApiController] Agregando carta ${card.id} al mazo ${deckId}...`);
      const updatedDeck = deckService.addCardToDeck(deckId, card);

      res.status(200).json({
        success: true,
        data: updatedDeck,
        message: `Carta "${card.name}" agregada al mazo`,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      this.handleError(error, res);
    }
  }

  /**
   * Eliminar una carta del mazo
   */
  async removeCardFromDeck(req: Request, res: Response): Promise<void> {
    try {
      const { deckId, cardId } = req.params;

      if (!cardId || isNaN(parseInt(cardId))) {
        res.status(400).json({
          success: false,
          error: {
            message: 'ID de carta inválido',
            timestamp: new Date().toISOString(),
          },
        });
        return;
      }

      console.log(`[ApiController] Eliminando carta ${cardId} del mazo ${deckId}...`);
      const updatedDeck = deckService.removeCardFromDeck(deckId, parseInt(cardId));

      res.status(200).json({
        success: true,
        data: updatedDeck,
        message: 'Carta eliminada del mazo',
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      this.handleError(error, res);
    }
  }

  /**
   * Limpiar todas las cartas de un mazo
   */
  async clearDeck(req: Request, res: Response): Promise<void> {
    try {
      const { deckId } = req.params;
      console.log(`[ApiController] Limpiando mazo ${deckId}...`);

      const clearedDeck = deckService.clearDeck(deckId);

      res.status(200).json({
        success: true,
        data: clearedDeck,
        message: 'Mazo limpiado exitosamente',
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      this.handleError(error, res);
    }
  }

  /**
   * Eliminar un mazo completamente
   */
  async deleteDeck(req: Request, res: Response): Promise<void> {
    try {
      const { deckId } = req.params;
      console.log(`[ApiController] Eliminando mazo ${deckId}...`);

      const deleted = deckService.deleteDeck(deckId);
      if (!deleted) {
        res.status(404).json({
          success: false,
          error: {
            message: 'Mazo no encontrado',
            timestamp: new Date().toISOString(),
          },
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Mazo eliminado exitosamente',
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      this.handleError(error, res);
    }
  }

  /**
   * Actualizar el nombre de un mazo
   */
  async updateDeckName(req: Request, res: Response): Promise<void> {
    try {
      const { deckId } = req.params;
      const { name } = req.body;

      if (!name || name.trim() === '') {
        res.status(400).json({
          success: false,
          error: {
            message: 'El nuevo nombre del mazo es requerido',
            timestamp: new Date().toISOString(),
          },
        });
        return;
      }

      console.log(`[ApiController] Actualizando nombre del mazo ${deckId}...`);
      const updatedDeck = deckService.updateDeckName(deckId, name);

      res.status(200).json({
        success: true,
        data: updatedDeck,
        message: 'Nombre del mazo actualizado',
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      this.handleError(error, res);
    }
  }

  /**
   * Obtener estadísticas de un mazo
   */
  async getDeckStats(req: Request, res: Response): Promise<void> {
    try {
      const { deckId } = req.params;
      console.log(`[ApiController] Obteniendo estadísticas del mazo ${deckId}...`);

      const stats = deckService.getDeckStats(deckId);

      res.status(200).json({
        success: true,
        data: stats,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      this.handleError(error, res);
    }
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
