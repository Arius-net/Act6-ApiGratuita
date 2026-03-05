import { Request, Response } from 'express';
import { ErrorResponse } from '../types/api.types';

export const notFoundHandler = (req: Request, res: Response): void => {
  const errorResponse: ErrorResponse = {
    success: false,
    error: {
      message: 'Endpoint no encontrado',
      details: `La ruta ${req.method} ${req.path} no existe`,
      timestamp: new Date().toISOString(),
    },
  };

  res.status(404).json(errorResponse);
};
