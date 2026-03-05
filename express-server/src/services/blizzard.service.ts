import type { BlizzardTokenResponse } from '../types/api.types';

/**
 * Servicio para autenticación OAuth 2.0 con Blizzard
 * Implementa el flujo de Client Credentials
 */
class BlizzardAuthService {
  private readonly TOKEN_URL = 'https://oauth.battle.net/token';
  private accessToken: string | null = null;
  private tokenExpiration: number | null = null;

  /**
   * Obtiene las credenciales desde variables de entorno
   * @throws Error si las credenciales no están configuradas
   */
  private getCredentials(): { clientId: string; clientSecret: string } {
    const clientId = process.env.BLIZZARD_CLIENT_ID;
    const clientSecret = process.env.BLIZZARD_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new Error(
        'Las credenciales de Blizzard no están configuradas. ' +
        'Verifica que BLIZZARD_CLIENT_ID y BLIZZARD_CLIENT_SECRET estén en el archivo .env'
      );
    }

    return { clientId, clientSecret };
  }

  /**
   * Verifica si el token actual aún es válido
   */
  private isTokenValid(): boolean {
    if (!this.accessToken || !this.tokenExpiration) {
      return false;
    }
    // Agregar un margen de 60 segundos antes de la expiración
    return Date.now() < this.tokenExpiration - 60000;
  }

  /**
   * Solicita un nuevo access token a Blizzard
   * @returns Access token válido
   * @throws Error si la autenticación falla
   */
  private async requestNewToken(): Promise<string> {
    try {
      console.log('🔐 [BlizzardAuthService] Solicitando nuevo token de Blizzard...');

      const { clientId, clientSecret } = this.getCredentials();

      // Codificar credenciales en Base64 para Basic Auth
      const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

      const response = await fetch(this.TOKEN_URL, {
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
        throw new Error(`Error HTTP: ${response.status} - ${errorText}`);
      }

      const data: BlizzardTokenResponse = await response.json();

      // Guardar token y calcular tiempo de expiración
      this.accessToken = data.access_token;
      this.tokenExpiration = Date.now() + (data.expires_in * 1000);

      console.log(`✅ [BlizzardAuthService] Token obtenido exitosamente (expira en ${data.expires_in}s)`);

      return data.access_token;
    } catch (error) {
      console.error('❌ [BlizzardAuthService] Error al obtener token:', error);
      throw new Error(
        `Error de autenticación con Blizzard: ${error instanceof Error ? error.message : 'Error desconocido'}`
      );
    }
  }

  /**
   * Obtiene un access token válido (reutiliza si aún es válido)
   * @returns Access token válido
   */
  async getAccessToken(): Promise<string> {
    if (this.isTokenValid() && this.accessToken) {
      console.log('♻️  [BlizzardAuthService] Reutilizando token existente');
      return this.accessToken;
    }

    return this.requestNewToken();
  }

  /**
   * Invalida el token actual (útil para testing o forzar renovación)
   */
  invalidateToken(): void {
    this.accessToken = null;
    this.tokenExpiration = null;
    console.log('🔄 [BlizzardAuthService] Token invalidado');
  }
}

export default new BlizzardAuthService();
