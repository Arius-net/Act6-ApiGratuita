import express, { Application } from 'express';
import cors from 'cors';
import { config } from './config/config';
import routes from './routes';
import { requestLogger } from './middlewares/logger.middleware';
import { errorHandler } from './middlewares/errorHandler.middleware';
import { notFoundHandler } from './middlewares/notFound.middleware';

export function createApp(): Application {
  const app: Application = express();

app.use(cors({
  origin: true, // Esto permite CUALQUIER origen. Úsalo para probar si el error desaparece.
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

  app.use(express.json());

  app.use(express.urlencoded({ extended: true }));

  app.use(requestLogger);

  app.use(routes);

  app.use(notFoundHandler);

  app.use(errorHandler);

  return app;
}

export default createApp;
