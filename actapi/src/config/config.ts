import dotenv from 'dotenv';

dotenv.config();

export const config = {

  server: {
    port: parseInt(process.env.PORT || '3001', 10),
    host: process.env.HOST || '0.0.0.0', // 0.0.0.0 para Docker
    env: process.env.NODE_ENV || 'development',
  },

  cors: {
    origin: process.env.FRONTEND_URL || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  },

  blizzard: {
    clientId: process.env.BLIZZARD_CLIENT_ID || '',
    clientSecret: process.env.BLIZZARD_CLIENT_SECRET || '',
    tokenUrl: 'https://oauth.battle.net/token',
    apiBaseUrl: 'https://us.api.blizzard.com',
  },

  apis: {
    deckOfCards: {
      baseUrl: 'https://deckofcardsapi.com/api',
      timeout: 10000,
    },
    hearthstone: {
      locale: 'es_MX',
      pageSize: 100, // Aumentado a 100 cartas por defecto
      timeout: 10000,
    },
  },

  timeouts: {
    default: 10000,
  },
};

export default config;
