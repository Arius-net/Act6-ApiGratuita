import axios from 'axios';
import { config } from '../config/config';
import { DeckOfCardsResponse, DeckOfCardsCard } from '../types/api.types';

export class DeckOfCardsService {
  private readonly baseUrl: string;
  private readonly timeout: number;

  constructor() {
    this.baseUrl = config.apis.deckOfCards.baseUrl;
    this.timeout = config.apis.deckOfCards.timeout;
  }

  async drawCard(): Promise<DeckOfCardsCard> {
    try {
      console.log('[DeckOfCardsService] Solicitando carta...');

      const response = await axios.get<DeckOfCardsResponse>(
        `${this.baseUrl}/deck/new/draw/?count=1`,
        { timeout: this.timeout }
      );

      if (!response.data.success || !response.data.cards.length) {
        throw new Error('No se pudo obtener una carta del Deck of Cards API');
      }

      const card = response.data.cards[0];
      console.log(`[DeckOfCardsService] Carta obtenida: ${card.value} of ${card.suit}`);

      return card;
    } catch (error: any) {
      console.error('[DeckOfCardsService] Error:', error.message);
      throw new Error(`Error al obtener carta: ${error.message}`);
    }
  }


  async drawCards(count: number): Promise<DeckOfCardsCard[]> {
    try {
      console.log(`[DeckOfCardsService] Solicitando ${count} cartas...`);

      const response = await axios.get<DeckOfCardsResponse>(
        `${this.baseUrl}/deck/new/draw/?count=${count}`,
        { timeout: this.timeout }
      );

      if (!response.data.success) {
        throw new Error('Error al obtener cartas del Deck of Cards API');
      }

      console.log(`[DeckOfCardsService] ${response.data.cards.length} cartas obtenidas`);
      return response.data.cards;
    } catch (error: any) {
      console.error('[DeckOfCardsService] Error:', error.message);
      throw new Error(`Error al obtener cartas: ${error.message}`);
    }
  }
}

export const deckOfCardsService = new DeckOfCardsService();
