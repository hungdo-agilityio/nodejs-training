import { Request, Response, NextFunction } from 'express';
import { ILogger } from '@shared/types';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (logger: ILogger) => {
  return (err: Error, req: Request, res: Response, _next: NextFunction) => {
    logger.error('Error occurred:', err);

    if (err instanceof AppError) {
      return res.status(err.statusCode).json({
        error: {
          code: err.code,
          message: err.message,
        },
      });
    }

    // Default error response
    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred',
      },
    });
  };
};
