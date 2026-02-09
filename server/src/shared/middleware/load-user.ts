import { Request, Response, NextFunction } from 'express';
import { getAuth } from '@clerk/express';
import { IUserService } from '@modules/users';
import { AppError } from './error-handler';

/**
 * Middleware factory that loads the authenticated user from database
 * Use after requireAuthentication middleware
 */
export const createLoadUser = (userService: IUserService) => {
  return async (
    req: Request,
    _res: Response,
    next: NextFunction
  ): Promise<void> => {
    const auth = getAuth(req);

    if (!auth.userId) {
      next(new AppError(401, 'UNAUTHORIZED', 'Authentication required'));
      return;
    }

    const result = await userService.getUserByClerkId(auth.userId);

    if (result.isErr()) {
      next(new AppError(404, 'USER_NOT_FOUND', result.getError()));
      return;
    }

    req.user = result.getValue();
    next();
  };
};
