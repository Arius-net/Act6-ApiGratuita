import { NextResponse } from 'next/server';
import type {
  DeckOfCardsResponse,
  BlizzardTokenResponse,
  HearthstoneCardsResponse,
  DrawHearthstoneResponse,
  ErrorResponse,
  DrawnCardInfo,
  HearthstoneCardInfo,
} from '@/types/api.types';

// ==========================================
// Constantes
// ==========================================

const DECK_OF_CARDS_API = 'https://deckofcardsapi.com/api/deck/new/draw/?count=1';
const BLIZZARD_TOKEN_URL = 'https://oauth.battle.net/token';
const HEARTHSTONE_API_URL = 'https://us.api.blizzard.com/hearthstone/cards';

// ==========================================
// Datos Mock para Respaldo
// ==========================================

const MOCK_RESPONSE: DrawHearthstoneResponse = {
  success: true,
  drawnCard: {
    valor: 'KING',
    palo: 'HEARTS',
    code: 'KH',
  },
  hearthstoneCard: {
    id: 1004,
    name: 'Rey Lich',
    manaCost: 8,
    image: 'https://d15f34w2p8l1cc.cloudfront.net/hearthstone/Card_Not_Found.png',
    rarity: 'LEGENDARY',
    text: 'Una carta legendaria poderosa',
    attack: 8,
    health: 8,
  },
};

// ==========================================
// Función Auxiliar: Obtener Token de Blizzard
// ==========================================

async function getBlizzardAccessToken(): Promise<string> {
  const clientId = process.env.BLIZZARD_CLIENT_ID;
  const clientSecret = process.env.BLIZZARD_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Las credenciales de Blizzard no están configuradas en las variables de entorno');
  }

  // Codificar credenciales en Base64 para Basic Auth
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const response = await fetch(BLIZZARD_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error al obtener token de Blizzard: ${response.status} - ${errorText}`);
  }

  const data: BlizzardTokenResponse = await response.json();
  return data.access_token;
}

// ==========================================
// Función Auxiliar: Mapear Valor de Carta
// ==========================================

function mapCardValueToManaCost(cardValue: string): number {
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

// ==========================================
// Función Auxiliar: Traducir Palo
// ==========================================

function translateSuit(suit: string): string {
  const translations: Record<string, string> = {
    'HEARTS': 'Corazones',
    'DIAMONDS': 'Diamantes',
    'CLUBS': 'Tréboles',
    'SPADES': 'Espadas',
  };

  return translations[suit] || suit;
}

// ==========================================
// Handler Principal del Endpoint
// ==========================================

export async function GET() {
  try {
    // ==========================================
    // PASO 1: Robar carta de Deck of Cards API
    // ==========================================
    console.log('📝 Paso 1: Robando carta de Deck of Cards API...');
    
    const deckResponse = await fetch(DECK_OF_CARDS_API, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!deckResponse.ok) {
      throw new Error(`Error al robar carta: ${deckResponse.status}`);
    }

    const deckData: DeckOfCardsResponse = await deckResponse.json();

    if (!deckData.success || !deckData.cards || deckData.cards.length === 0) {
      throw new Error('No se pudo obtener una carta válida de Deck of Cards API');
    }

    const drawnCard = deckData.cards[0];
    const drawnCardInfo: DrawnCardInfo = {
      valor: drawnCard.value,
      palo: translateSuit(drawnCard.suit),
      code: drawnCard.code,
    };

    console.log(`✅ Carta robada: ${drawnCard.value} de ${drawnCard.suit}`);

    // ==========================================
    // PASO 2: Autenticación con Blizzard
    // ==========================================
    console.log('🔐 Paso 2: Autenticando con Blizzard OAuth...');
    
    const accessToken = await getBlizzardAccessToken();
    
    console.log('✅ Token de acceso obtenido exitosamente');

    // ==========================================
    // PASO 3: Obtener carta de Hearthstone
    // ==========================================
    console.log('🎮 Paso 3: Obteniendo carta de Hearthstone...');
    
    // Mapear el valor de la carta robada a un costo de maná
    const manaCost = mapCardValueToManaCost(drawnCard.value);
    
    // Construir la URL con parámetros de búsqueda
    const hearthstoneUrl = new URL(HEARTHSTONE_API_URL);
    hearthstoneUrl.searchParams.append('locale', 'es_MX');
    hearthstoneUrl.searchParams.append('manaCost', manaCost.toString());
    hearthstoneUrl.searchParams.append('page', '1');
    hearthstoneUrl.searchParams.append('pageSize', '20');

    const hearthstoneResponse = await fetch(hearthstoneUrl.toString(), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json',
      },
    });

    if (!hearthstoneResponse.ok) {
      throw new Error(`Error al obtener cartas de Hearthstone: ${hearthstoneResponse.status}`);
    }

    const hearthstoneData: HearthstoneCardsResponse = await hearthstoneResponse.json();

    if (!hearthstoneData.cards || hearthstoneData.cards.length === 0) {
      throw new Error('No se encontraron cartas de Hearthstone para el costo de maná especificado');
    }

    // Seleccionar una carta aleatoria de las devueltas
    const randomIndex = Math.floor(Math.random() * hearthstoneData.cards.length);
    const selectedCard = hearthstoneData.cards[randomIndex];

    // Mapear la rareza
    const rarityMap: Record<number, string> = {
      1: 'COMÚN',
      2: 'GRATIS',
      3: 'RARA',
      4: 'ÉPICA',
      5: 'LEGENDARIA',
    };

    const hearthstoneCardInfo: HearthstoneCardInfo = {
      id: selectedCard.id,
      name: selectedCard.name,
      manaCost: selectedCard.manaCost,
      image: selectedCard.image || selectedCard.cropImage,
      rarity: selectedCard.rarityId ? rarityMap[selectedCard.rarityId] : undefined,
      text: selectedCard.text,
      attack: selectedCard.attack,
      health: selectedCard.health,
    };

    console.log(`✅ Carta de Hearthstone seleccionada: ${selectedCard.name}`);

    // ==========================================
    // PASO 4: Respuesta Consolidada
    // ==========================================
    const response: DrawHearthstoneResponse = {
      success: true,
      drawnCard: drawnCardInfo,
      hearthstoneCard: hearthstoneCardInfo,
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    // ==========================================
    // Manejo de Errores
    // ==========================================
    console.error('❌ Error en el endpoint /api/draw-hearthstone:', error);

    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';

    // Devolver respuesta mock como respaldo
    const errorResponse: ErrorResponse = {
      success: false,
      error: 'API_ERROR',
      message: `Error al procesar la solicitud: ${errorMessage}`,
      drawnCard: MOCK_RESPONSE.drawnCard,
      hearthstoneCard: MOCK_RESPONSE.hearthstoneCard,
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}

// ==========================================
// Soporte para método POST (opcional)
// ==========================================

export async function POST() {
  // Redirigir al método GET para simplificar
  return GET();
}
