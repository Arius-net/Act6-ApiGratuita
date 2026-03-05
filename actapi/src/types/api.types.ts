// ==========================================
// Tipos para la API de Deck of Cards
// ==========================================

export interface DeckOfCardsCard {
  image: string;
  value: string;
  suit: string;
  code: string;
}

export interface DeckOfCardsResponse {
  success: boolean;
  deck_id: string;
  cards: DeckOfCardsCard[];
  remaining: number;
}

// ==========================================
// Tipos para la API de Blizzard OAuth
// ==========================================

export interface BlizzardTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  sub?: string;
}

// ==========================================
// Tipos para la API de Hearthstone
// ==========================================

export interface HearthstoneImage {
  image?: string;
  imageGold?: string;
}

export interface HearthstoneCard {
  id: number;
  collectible: number;
  slug: string;
  classId?: number;
  multiClassIds?: number[];
  cardTypeId: number;
  cardSetId: number;
  rarityId?: number;
  artistName?: string;
  health?: number;
  attack?: number;
  manaCost: number;
  name: string;
  text?: string;
  image?: string;
  imageGold?: string;
  flavorText?: string;
  cropImage?: string;
  keywordIds?: number[];
  duels?: {
    relevant: boolean;
    constructed: boolean;
  };
}

export interface HearthstoneMetadata {
  sets?: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
  setGroups?: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
  arenaIds?: number[];
  types?: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
  rarities?: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
  classes?: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
  minionTypes?: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
  keywords?: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
}

export interface HearthstoneCardsResponse {
  cards: HearthstoneCard[];
  cardCount: number;
  pageCount: number;
  page: number;
}

// ==========================================
// Tipos para la Respuesta del BFF
// ==========================================

export interface DrawnCardInfo {
  valor: string;
  palo: string;
  code: string;
}

export interface HearthstoneCardInfo {
  id: number;
  name: string;
  manaCost: number;
  image?: string;
  rarity?: string;
  text?: string;
  attack?: number;
  health?: number;
}

export interface DrawHearthstoneResponse {
  success: boolean;
  drawnCard: DrawnCardInfo;
  hearthstoneCard: HearthstoneCardInfo;
}

export interface ErrorResponse {
  success: false;
  error: string;
  message: string;
  drawnCard?: DrawnCardInfo;
  hearthstoneCard?: HearthstoneCardInfo;
}
