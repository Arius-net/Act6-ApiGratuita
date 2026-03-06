import express, { Application } from 'express';
import cors from 'cors';
import { config } from './config/config';
import routes from './routes';
import { requestLogger } from './middlewares/logger.middleware';
import { errorHandler } from './middlewares/errorHandler.middleware';
import { notFoundHandler } from './middlewares/notFound.middleware';

export function createApp(): Application {
  const app: Application = express();

const corsOptions = {
  // Asegúrate de que esta variable NO tenga una diagonal '/' al final en Vercel
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  optionsSuccessStatus: 200 // Vital para navegadores antiguos y algunos frameworks
};

app.use(cors(corsOptions));

// Opcional: Manejar explícitamente las peticiones OPTIONS
app.options('*', cors(corsOptions));

  app.use(express.json());

  app.use(express.urlencoded({ extended: true }));

  app.use(requestLogger);

  app.use(routes);

  app.use(notFoundHandler);

  app.use(errorHandler);

  return app;
}

export default createApp;
