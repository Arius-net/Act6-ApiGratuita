import { Request, Response, NextFunction } from 'express';
import { config } from '../config/config';
import { ErrorResponse } from '../types/api.types';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('[GLOBAL ERROR]', err);

  const errorResponse: ErrorResponse = {
    success: false,
    error: {
      message: 'Error interno del servidor',
      details: config.server.env === 'development' ? err.message : undefined,
      timestamp: new Date().toISOString(),
    },
  };

  res.status(500).json(errorResponse);
};
