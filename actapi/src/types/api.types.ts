export interface DeckOfCardsCard {
  code: string;
  image: string;
  images: {
    svg: string;
    png: string;
  };
  value: string;
  suit: string;
}

export interface DeckOfCardsResponse {
  success: boolean;
  deck_id: string;
  cards: DeckOfCardsCard[];
  remaining: number;
}



export interface BlizzardTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}



export interface HearthstoneCard {
  id: number;
  collectible: number;
  slug: string;
  classId: number;
  multiClassIds: number[];
  cardTypeId: number;
  cardSetId: number;
  rarityId: number;
  artistName: string;
  manaCost: number;
  name: string;
  text: string;
  image: string;
  imageGold: string;
  flavorText: string;
  cropImage: string;
}

export interface HearthstoneApiResponse {
  cards: HearthstoneCard[];
  cardCount: number;
  pageCount: number;
  page: number;
}


export interface DeckCardData {
  value: string;
  suit: string;
  code: string;
  image: string;
}

export interface HearthstoneCardsData {
  total: number;
  sample: HearthstoneCard[];
}

export interface UnifiedApiResponse {
  success: boolean;
  data: {
    deckCard: DeckCardData;
    hearthstoneCards: HearthstoneCardsData;
  };
  timestamp: string;
}


export interface ErrorResponse {
  success: false;
  error: {
    message: string;
    details?: string;
    timestamp: string;
  };
}


// Deck Types
export interface Deck {
  id: string;
  name: string;
  cards: HearthstoneCard[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateDeckRequest {
  name: string;
}

export interface AddCardToDeckRequest {
  card: HearthstoneCard;
}

export interface DeckStats {
  totalCards: number;
  averageManaCost: number;
  cardsByRarity: Record<number, number>;
  cardsByClass: Record<number, number>;
  maxCards: number;
  slotsRemaining: number;
}
