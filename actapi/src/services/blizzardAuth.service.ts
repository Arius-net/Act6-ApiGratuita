import axios from 'axios';
import { config } from '../config/config';
import { BlizzardTokenResponse } from '../types/api.types';

export class BlizzardAuthService {
  private readonly tokenUrl: string;
  private readonly clientId: string;
  private readonly clientSecret: string;
  private cachedToken: string | null = null;
  private tokenExpiry: number = 0;

  constructor() {
    this.tokenUrl = config.blizzard.tokenUrl;
    this.clientId = config.blizzard.clientId;
    this.clientSecret = config.blizzard.clientSecret;

    this.validateCredentials();
  }

  private validateCredentials(): void {
    if (!this.clientId || !this.clientSecret) {
      throw new Error(
        'Las credenciales de Blizzard no están configuradas en las variables de entorno'
      );
    }
  }

  private isTokenValid(): boolean {
    if (!this.cachedToken) {
      return false;
    }
    return Date.now() < this.tokenExpiry - 60000;
  }

  async getAccessToken(): Promise<string> {
    if (this.isTokenValid()) {
      console.log('[BlizzardAuthService] Usando token en cache');
      return this.cachedToken!;
    }

    try {
      console.log('[BlizzardAuthService] Solicitando nuevo token de acceso...');

      const credentials = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString(
        'base64'
      );

      const response = await axios.post<BlizzardTokenResponse>(
        this.tokenUrl,
        'grant_type=client_credentials',
        {
          headers: {
            Authorization: `Basic ${credentials}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          timeout: config.timeouts.default,
        }
      );

      this.cachedToken = response.data.access_token;
      this.tokenExpiry = Date.now() + response.data.expires_in * 1000;

      console.log('[BlizzardAuthService] Token obtenido exitosamente');
      return this.cachedToken;
    } catch (error: any) {
      console.error('[BlizzardAuthService] Error:', error.message);

      if (axios.isAxiosError(error) && error.response?.status === 401) {
        throw new Error('Credenciales de Blizzard inválidas');
      }

      throw new Error(`Error al obtener token de Blizzard: ${error.message}`);
    }
  }

  invalidateToken(): void {
    console.log('[BlizzardAuthService] Token invalidado');
    this.cachedToken = null;
    this.tokenExpiry = 0;
  }
}

export const blizzardAuthService = new BlizzardAuthService();
