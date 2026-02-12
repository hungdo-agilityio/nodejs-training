import { Request, Response } from 'express';
import { IUserController } from './user.controller.interface';
import { ApiError } from '@shared/errors';

export class UserController implements IUserController {
  async getMe(req: Request, res: Response): Promise<void> {
    // User is already loaded by loadUser middleware
    if (!req.user) {
      const error = ApiError.unauthorized('Authentication required');
      res.status(error.statusCode).json(error.toJSON());
      return;
    }

    res.json({
      data: {
        id: req.user.id,
        clerkUserId: req.user.clerkUserId,
        email: req.user.email,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        phoneNumber: req.user.phone,
        role: req.user.role,
        createdAt: req.user.createdAt,
        updatedAt: req.user.updatedAt,
      },
    });
  }
}
