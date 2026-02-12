import { Request, Response, NextFunction } from 'express';
import { getAuth } from '@clerk/express';
import { IUserService } from '@modules/users';
import { ApiError } from '@shared/errors';

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
      next(ApiError.unauthorized('Authentication required'));
      return;
    }

    const result = await userService.getUserByClerkId(auth.userId);

    if (result.isErr()) {
      next(result.getError());
      return;
    }

    req.user = result.getValue();
    next();
  };
};
