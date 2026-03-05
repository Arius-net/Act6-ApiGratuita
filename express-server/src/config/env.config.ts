import type { AppConfig } from '../types/api.types';

/**
 * Valida que todas las variables de entorno requeridas estén presentes
 * @throws Error si falta alguna variable requerida
 */
const validateEnv = (): void => {
  const required = ['BLIZZARD_CLIENT_ID', 'BLIZZARD_CLIENT_SECRET'];
  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Variables de entorno faltantes: ${missing.join(', ')}\n` +
      'Por favor, crea un archivo .env basado en .env.example'
    );
  }
};

/**
 * Carga y valida la configuración de la aplicación
 * @returns Objeto de configuración completo
 */
export const loadConfig = (): AppConfig => {
  validateEnv();

  const config: AppConfig = {
    port: parseInt(process.env.PORT || '4000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    corsOrigin: process.env.CORS_ORIGIN 
      ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
      : ['http://localhost:3000'],
    blizzard: {
      clientId: process.env.BLIZZARD_CLIENT_ID!,
      clientSecret: process.env.BLIZZARD_CLIENT_SECRET!,
    },
  };

  return config;
};
