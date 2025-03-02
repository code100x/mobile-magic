import type { Request, Response, NextFunction } from 'express';
import { logger } from './monitoring';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  logger.error('Request error', {
    error: err.message,
    path: req.path,
    method: req.method,
    ip: req.ip
  });
  
  if (!res.headersSent) {
    res.status(500).json({ 
      error: 'Internal server error',
      requestId: req.headers['x-request-id']
    });
  }
}