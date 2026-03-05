import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { loadConfig } from './config/env.config';
import { requestLogger } from './middleware/logger';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import hearthstoneRoutes from './routes/hearthstone.routes';

// ==========================================
// Cargar Variables de Entorno
// ==========================================
dotenv.config();

// ==========================================
// Crear Aplicación Express
// ==========================================
const app: Application = express();

// ==========================================
// Cargar Configuración
// ==========================================
let config;
try {
  config = loadConfig();
  console.log('✅ Configuración cargada exitosamente');
} catch (error) {
  console.error('❌ Error al cargar configuración:', error);
  process.exit(1);
}

// ==========================================
// Middleware Global
// ==========================================

// CORS - Configurado para permitir peticiones del frontend
app.use(cors({
  origin: config.corsOrigin,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// Parser JSON
app.use(express.json());

// Parser URL-encoded
app.use(express.urlencoded({ extended: true }));

// Logger de peticiones
app.use(requestLogger);

// ==========================================
// Ruta de Bienvenida
// ==========================================
app.get('/', (req, res) => {
  res.json({
    message: '🎮 Hearthstone API Service - SOA Architecture',
    version: '1.0.0',
    endpoints: {
      draw: 'GET /api/hearthstone-draw',
      health: 'GET /api/health',
    },
    documentation: 'Consulta el archivo README.md para más información',
  });
});

// ==========================================
// Rutas de la API
// ==========================================
app.use('/api', hearthstoneRoutes);

// ==========================================
// Middleware de Manejo de Errores
// ==========================================

// Handler para rutas no encontradas (debe ir antes del error handler)
app.use(notFoundHandler);

// Handler global de errores (debe ser el último middleware)
app.use(errorHandler);

// ==========================================
// Iniciar Servidor
// ==========================================
const PORT = config.port;

app.listen(PORT, () => {
  console.log('\n' + '='.repeat(60));
  console.log('🚀 Servidor Express iniciado exitosamente');
  console.log('='.repeat(60));
  console.log(`📍 URL: http://localhost:${PORT}`);
  console.log(`🌍 Entorno: ${config.nodeEnv}`);
  console.log(`🔗 CORS habilitado para: ${config.corsOrigin.join(', ')}`);
  console.log('='.repeat(60));
  console.log('\n📋 Endpoints disponibles:');
  console.log(`   GET  http://localhost:${PORT}/`);
  console.log(`   GET  http://localhost:${PORT}/api/hearthstone-draw`);
  console.log(`   GET  http://localhost:${PORT}/api/health`);
  console.log('='.repeat(60) + '\n');
});

// ==========================================
// Manejo de Errores de Proceso
// ==========================================

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Manejo de cierre graceful
process.on('SIGTERM', () => {
  console.log('⚠️  SIGTERM recibido. Cerrando servidor...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\n⚠️  SIGINT recibido. Cerrando servidor...');
  process.exit(0);
});

export default app;
