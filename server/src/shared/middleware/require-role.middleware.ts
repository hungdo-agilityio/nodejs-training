import { Request, Response, NextFunction } from 'express';
import { ApiError } from '@shared/errors';

/**
 * Role-based authorization middleware factory
 * Use after loadUser middleware
 */
export const createRequireRole = (...allowedRoles: string[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(ApiError.unauthorized('User not loaded'));
      return;
    }

    const userRole = req.user.role;

    if (!allowedRoles.includes(userRole)) {
      next(ApiError.forbidden('Insufficient permissions'));
      return;
    }

    next();
  };
};
