import { HearthstoneCard } from '../types/api.types';

interface Deck {
  id: string;
  name: string;
  cards: HearthstoneCard[];
  createdAt: Date;
  updatedAt: Date;
}

export class DeckService {
  private decks: Map<string, Deck> = new Map();

  /**
   * Crear un nuevo mazo vacío
   */
  createDeck(name: string): Deck {
    const id = this.generateDeckId();
    const deck: Deck = {
      id,
      name,
      cards: [],      
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.decks.set(id, deck);
    console.log(`[DeckService] Mazo creado: ${name} (ID: ${id})`);
    return deck;
  }

  /**
   * Obtener todos los mazos
   */
  getAllDecks(): Deck[] {
    return Array.from(this.decks.values());
  }

  /**
   * Obtener un mazo por ID
   */
  getDeckById(deckId: string): Deck | null {
    const deck = this.decks.get(deckId);
    if (!deck) {
      console.log(`[DeckService] Mazo no encontrado: ${deckId}`);
      return null;
    }
    return deck;
  }

  /**
   * Agregar una carta al mazo
   */
  addCardToDeck(deckId: string, card: HearthstoneCard): Deck {
    const deck = this.decks.get(deckId);
    if (!deck) {
      throw new Error(`Mazo con ID ${deckId} no encontrado`);
    }

    // Verificar si la carta ya existe en el mazo
    const cardExists = deck.cards.some(c => c.id === card.id);
    if (cardExists) {
      throw new Error(`La carta ${card.name} ya está en el mazo`);
    }

    // Validar límite de 30 cartas (límite típico de Hearthstone)
    if (deck.cards.length >= 30) {
      throw new Error('El mazo ya tiene 30 cartas (límite máximo)');
    }

    deck.cards.push(card);
    deck.updatedAt = new Date();

    console.log(`[DeckService] Carta agregada al mazo ${deckId}: ${card.name}`);
    return deck;
  }

  /**
   * Eliminar una carta del mazo por el ID de la carta
   */
  removeCardFromDeck(deckId: string, cardId: number): Deck {
    const deck = this.decks.get(deckId);
    if (!deck) {
      throw new Error(`Mazo con ID ${deckId} no encontrado`);
    }

    const initialLength = deck.cards.length;
    deck.cards = deck.cards.filter(card => card.id !== cardId);

    if (deck.cards.length === initialLength) {
      throw new Error(`Carta con ID ${cardId} no encontrada en el mazo`);
    }

    deck.updatedAt = new Date();
    console.log(`[DeckService] Carta eliminada del mazo ${deckId}: ${cardId}`);
    return deck;
  }

  /**
   * Limpiar todas las cartas de un mazo
   */
  clearDeck(deckId: string): Deck {
    const deck = this.decks.get(deckId);
    if (!deck) {
      throw new Error(`Mazo con ID ${deckId} no encontrado`);
    }

    deck.cards = [];
    deck.updatedAt = new Date();
    console.log(`[DeckService] Mazo limpiado: ${deckId}`);
    return deck;
  }

  /**
   * Eliminar un mazo completamente
   */
  deleteDeck(deckId: string): boolean {
    const existed = this.decks.delete(deckId);
    if (existed) {
      console.log(`[DeckService] Mazo eliminado: ${deckId}`);
    }
    return existed;
  }

  /**
   * Actualizar el nombre del mazo
   */
  updateDeckName(deckId: string, newName: string): Deck {
    const deck = this.decks.get(deckId);
    if (!deck) {
      throw new Error(`Mazo con ID ${deckId} no encontrado`);
    }

    deck.name = newName;
    deck.updatedAt = new Date();
    console.log(`[DeckService] Nombre del mazo actualizado: ${deckId} -> ${newName}`);
    return deck;
  }

  /**
   * Generar un ID único para el mazo
   */
  private generateDeckId(): string {
    return `deck_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Obtener estadísticas del mazo
   */
  getDeckStats(deckId: string): any {
    const deck = this.decks.get(deckId);
    if (!deck) {
      throw new Error(`Mazo con ID ${deckId} no encontrado`);
    }

    const totalCards = deck.cards.length;
    const averageMana = totalCards > 0
      ? deck.cards.reduce((sum, card) => sum + (card.manaCost || 0), 0) / totalCards
      : 0;

    const cardsByRarity = deck.cards.reduce((acc, card) => {
      const rarity = card.rarityId || 0;
      acc[rarity] = (acc[rarity] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    const cardsByClass = deck.cards.reduce((acc, card) => {
      const classId = card.classId || 0;
      acc[classId] = (acc[classId] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    return {
      totalCards,
      averageManaCost: Math.round(averageMana * 100) / 100,
      cardsByRarity,
      cardsByClass,
      maxCards: 30,
      slotsRemaining: 30 - totalCards,
    };
  }
}

export const deckService = new DeckService();
