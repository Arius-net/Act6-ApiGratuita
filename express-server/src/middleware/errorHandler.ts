import { Request, Response, NextFunction } from 'express';
import type { ApiErrorResponse } from '../types/api.types';

/**
 * Middleware de manejo global de errores
 * Captura errores no manejados y devuelve respuestas JSON consistentes
 */
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('❌ [ErrorHandler] Error no manejado:', err);

  const errorResponse: ApiErrorResponse = {
    success: false,
    error: err.name || 'INTERNAL_SERVER_ERROR',
    message: err.message || 'Ha ocurrido un error interno en el servidor',
    timestamp: new Date().toISOString(),
    path: req.path,
    statusCode: 500,
  };

  res.status(500).json(errorResponse);
};

/**
 * Middleware para manejar rutas no encontradas (404)
 */
export const notFoundHandler = (req: Request, res: Response): void => {
  const errorResponse: ApiErrorResponse = {
    success: false,
    error: 'NOT_FOUND',
    message: `La ruta ${req.method} ${req.path} no existe en esta API`,
    timestamp: new Date().toISOString(),
    path: req.path,
    statusCode: 404,
  };

  res.status(404).json(errorResponse);
};
