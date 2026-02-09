import { Request, Response, NextFunction } from 'express';
import { AppError } from './error-handler';

/**
 * Role-based authorization middleware factory
 * Use after loadUser middleware
 */
export const createRequireRole = (...allowedRoles: string[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new AppError(401, 'UNAUTHORIZED', 'User not loaded');
    }

    const userRole = req.user.role;

    if (!allowedRoles.includes(userRole)) {
      throw new AppError(403, 'FORBIDDEN', 'Insufficient permissions');
    }

    next();
  };
};
