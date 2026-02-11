import { Request, Response } from 'express';
import { getAuth } from '@clerk/express';
import { IUserController } from './user.controller.interface';

export class UserController implements IUserController {
  async getMe(req: Request, res: Response): Promise<void> {
    // User is already loaded by loadUser middleware
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    res.json({
      data: {
        id: req.user.id,
        clerkUserId: req.user.clerkUserId,
        email: req.user.email,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        phoneNumber: req.user.phoneNumber,
        role: req.user.role,
        createdAt: req.user.createdAt,
        updatedAt: req.user.updatedAt,
      },
    });
  }
}
