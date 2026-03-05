import axios from 'axios';
import { config } from '../config/config';
import { HearthstoneApiResponse, HearthstoneCard } from '../types/api.types';

export class HearthstoneService {
  private readonly baseUrl: string;
  private readonly locale: string;
  private readonly pageSize: number;
  private readonly timeout: number;

  constructor() {
    this.baseUrl = config.blizzard.apiBaseUrl;
    this.locale = config.apis.hearthstone.locale;
    this.pageSize = config.apis.hearthstone.pageSize;
    this.timeout = config.apis.hearthstone.timeout;
  }


  async getCards(accessToken: string): Promise<HearthstoneCard[]> {
    try {
      console.log('[HearthstoneService] Solicitando cartas...');

      const response = await axios.get<HearthstoneApiResponse>(
        `${this.baseUrl}/hearthstone/cards`,
        {
          params: {
            locale: this.locale,
            pageSize: this.pageSize,
          },
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          timeout: this.timeout,
        }
      );

      const cards = response.data.cards || [];
      console.log(`[HearthstoneService] ${cards.length} cartas obtenidas`);

      return cards;
    } catch (error: any) {
      console.error('[HearthstoneService] Error:', error.message);

      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new Error('Token de acceso inválido o expirado');
        } else if (error.response?.status === 404) {
          throw new Error('Endpoint de Hearthstone no encontrado');
        }
      }

      throw new Error(`Error al obtener cartas de Hearthstone: ${error.message}`);
    }
  }

  async getCardById(cardId: number, accessToken: string): Promise<HearthstoneCard> {
    try {
      console.log(`[HearthstoneService] Solicitando carta con ID ${cardId}...`);

      const response = await axios.get<HearthstoneCard>(
        `${this.baseUrl}/hearthstone/cards/${cardId}`,
        {
          params: {
            locale: this.locale,
          },
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          timeout: this.timeout,
        }
      );

      console.log(`[HearthstoneService] Carta ${cardId} obtenida`);
      return response.data;
    } catch (error: any) {
      console.error('[HearthstoneService] Error:', error.message);
      throw new Error(`Error al obtener carta ${cardId}: ${error.message}`);
    }
  }


  async searchCards(
    params: {
      set?: string;
      class?: string;
      manaCost?: number;
      attack?: number;
      health?: number;
      collectible?: number;
      rarity?: string;
      type?: string;
      minionType?: string;
      keyword?: string;
      textFilter?: string;
      page?: number;
      pageSize?: number;
      sort?: string;
      order?: 'asc' | 'desc';
    },
    accessToken: string
  ): Promise<HearthstoneCard[]> {
    try {
      console.log('[HearthstoneService] Buscando cartas con filtros...');

      const response = await axios.get<HearthstoneApiResponse>(
        `${this.baseUrl}/hearthstone/cards`,
        {
          params: {
            locale: this.locale,
            ...params,
          },
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          timeout: this.timeout,
        }
      );

      const cards = response.data.cards || [];
      console.log(`[HearthstoneService] ${cards.length} cartas encontradas`);

      return cards;
    } catch (error: any) {
      console.error('[HearthstoneService] Error:', error.message);
      throw new Error(`Error en búsqueda de cartas: ${error.message}`);
    }
  }
}

export const hearthstoneService = new HearthstoneService();
