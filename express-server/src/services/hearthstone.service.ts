import type { HearthstoneCardsResponse, HearthstoneCardInfo } from '../types/api.types';
import blizzardAuthService from './blizzard.service';

/**
 * Servicio para interactuar con la API de Hearthstone de Blizzard
 */
class HearthstoneService {
  private readonly API_URL = 'https://us.api.blizzard.com/hearthstone/cards';
  private readonly LOCALE = 'es_MX';

  /**
   * Mapea el valor de una carta tradicional a un costo de maná
   */
  private mapCardValueToManaCost(cardValue: string): number {
    const mapping: Record<string, number> = {
      'ACE': 1,
      '2': 2,
      '3': 3,
      '4': 4,
      '5': 5,
      '6': 6,
      '7': 7,
      '8': 8,
      '9': 9,
      '10': 10,
      'JACK': 11,
      'QUEEN': 12,
      'KING': 13,
    };

    return mapping[cardValue] || Math.floor(Math.random() * 10) + 1;
  }

  /**
   * Mapea el ID de rareza a su nombre
   */
  private mapRarityIdToName(rarityId?: number): string | undefined {
    if (!rarityId) return undefined;

    const rarityMap: Record<number, string> = {
      1: 'COMÚN',
      2: 'GRATIS',
      3: 'RARA',
      4: 'ÉPICA',
      5: 'LEGENDARIA',
    };

    return rarityMap[rarityId];
  }

  /**
   * Obtiene una carta de Hearthstone basada en el costo de maná
   * @param cardValue Valor de la carta tradicional robada
   * @returns Información de la carta de Hearthstone
   * @throws Error si la petición falla
   */
  async getCardByValue(cardValue: string): Promise<HearthstoneCardInfo> {
    try {
      console.log('🎮 [HearthstoneService] Obteniendo carta de Hearthstone...');

      // Obtener token de autenticación
      const accessToken = await blizzardAuthService.getAccessToken();

      // Mapear valor de carta a costo de maná
      const manaCost = this.mapCardValueToManaCost(cardValue);
      console.log(`📊 [HearthstoneService] Buscando cartas con costo de maná: ${manaCost}`);

      // Construir URL con parámetros
      const url = new URL(this.API_URL);
      url.searchParams.append('locale', this.LOCALE);
      url.searchParams.append('manaCost', manaCost.toString());
      url.searchParams.append('page', '1');
      url.searchParams.append('pageSize', '20');

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
      }

      const data: HearthstoneCardsResponse = await response.json();

      if (!data.cards || data.cards.length === 0) {
        console.warn(`⚠️  [HearthstoneService] No se encontraron cartas con costo de maná ${manaCost}`);
        throw new Error(`No se encontraron cartas de Hearthstone con costo de maná ${manaCost}`);
      }

      // Seleccionar una carta aleatoria
      const randomIndex = Math.floor(Math.random() * data.cards.length);
      const selectedCard = data.cards[randomIndex];

      console.log(`✅ [HearthstoneService] Carta seleccionada: ${selectedCard.name} (ID: ${selectedCard.id})`);

      return {
        id: selectedCard.id,
        name: selectedCard.name,
        manaCost: selectedCard.manaCost,
        image: selectedCard.image || selectedCard.cropImage,
        rarity: this.mapRarityIdToName(selectedCard.rarityId),
        text: selectedCard.text,
        attack: selectedCard.attack,
        health: selectedCard.health,
      };
    } catch (error) {
      console.error('❌ [HearthstoneService] Error al obtener carta:', error);
      throw new Error(
        `Error al consumir Hearthstone API: ${error instanceof Error ? error.message : 'Error desconocido'}`
      );
    }
  }

  /**
   * Obtiene múltiples cartas de Hearthstone (útil para futuras extensiones)
   * @param manaCost Costo de maná a buscar
   * @param limit Número máximo de cartas
   * @returns Array de cartas de Hearthstone
   */
  async getCardsByManaCost(manaCost: number, limit: number = 10): Promise<HearthstoneCardInfo[]> {
    try {
      const accessToken = await blizzardAuthService.getAccessToken();

      const url = new URL(this.API_URL);
      url.searchParams.append('locale', this.LOCALE);
      url.searchParams.append('manaCost', manaCost.toString());
      url.searchParams.append('page', '1');
      url.searchParams.append('pageSize', limit.toString());

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const data: HearthstoneCardsResponse = await response.json();

      return data.cards.map(card => ({
        id: card.id,
        name: card.name,
        manaCost: card.manaCost,
        image: card.image || card.cropImage,
        rarity: this.mapRarityIdToName(card.rarityId),
        text: card.text,
        attack: card.attack,
        health: card.health,
      }));
    } catch (error) {
      console.error('❌ [HearthstoneService] Error al obtener cartas:', error);
      throw error;
    }
  }
}

export default new HearthstoneService();
