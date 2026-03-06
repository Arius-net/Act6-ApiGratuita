import { createApp } from './app';
import { config } from './config/config';

const app = createApp();
const PORT = config.server.port;
const HOST = config.server.host;

app.listen(PORT, HOST, () => {
  console.log('='.repeat(50));
  console.log(`🚀 Servidor Express iniciado correctamente`);
  console.log(`📡 Escuchando en: ${HOST}:${PORT}`);
  console.log(`🌍 Entorno: ${config.server.env}`);
  console.log(`⏰ Timestamp: ${new Date().toISOString()}`);
  console.log('='.repeat(50));
  console.log('');
  console.log('📋 Endpoints disponibles:');
  console.log(`   GET http://localhost:${PORT}/health`);
  console.log(`   GET http://localhost:${PORT}/api/hearthstone-draw`);
  console.log('='.repeat(50));
});

export default app;
