import { createApp } from './app';
import { config } from './config/config';

const app = createApp();
const HOST = config.server.host;

// En lugar de usar config.server.port y host fijos:
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log(`🚀 Servidor iniciado en puerto: ${PORT}`);
  console.log(`🌍 Entorno: ${process.env.NODE_ENV}`);
  console.log('='.repeat(50));
});

export default app;
