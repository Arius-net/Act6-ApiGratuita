import type { DeckOfCardsResponse, DrawnCardInfo } from '../types/api.types';

/**
 * Servicio para interactuar con la API de Deck of Cards
 * Implementa el patrón de servicio desacoplado (SOA)
 */
class DeckOfCardsService {
  private readonly API_URL = 'https://deckofcardsapi.com/api/deck/new/draw/?count=1';

  /**
   * Traduce el palo de inglés a español
   */
  private translateSuit(suit: string): string {
    const translations: Record<string, string> = {
      'HEARTS': 'Corazones',
      'DIAMONDS': 'Diamantes',
      'CLUBS': 'Tréboles',
      'SPADES': 'Espadas',
    };
    return translations[suit] || suit;
  }

  /**
   * Roba una carta de la baraja
   * @returns Información de la carta robada
   * @throws Error si la petición falla
   */
  async drawCard(): Promise<DrawnCardInfo> {
    try {
      console.log('🎴 [DeckOfCardsService] Robando carta...');

      const response = await fetch(this.API_URL, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
      }

      const data: DeckOfCardsResponse = await response.json();

      if (!data.success || !data.cards || data.cards.length === 0) {
        throw new Error('No se pudo obtener una carta válida de la API');
      }

      const card = data.cards[0];

      console.log(`✅ [DeckOfCardsService] Carta robada: ${card.value} de ${card.suit}`);

      return {
        valor: card.value,
        palo: this.translateSuit(card.suit),
        code: card.code,
      };
    } catch (error) {
      console.error('❌ [DeckOfCardsService] Error al robar carta:', error);
      throw new Error(
        `Error al consumir Deck of Cards API: ${error instanceof Error ? error.message : 'Error desconocido'}`
      );
    }
  }
}

export default new DeckOfCardsService();
