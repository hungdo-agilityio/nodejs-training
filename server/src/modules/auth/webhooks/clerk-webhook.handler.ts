import { Request, Response } from 'express';
import { verifyWebhook, WebhookEvent } from '@clerk/express/webhooks';
import { ILogger } from '@shared/types';
import { IUserService, ClerkUserData } from '@modules/users';
import { IClerkWebhookHandler } from './clerk-webhook.handler.interface';
import { ApiError } from '@shared/errors';

export class ClerkWebhookHandler implements IClerkWebhookHandler {
  constructor(
    private userService: IUserService,
    private logger: ILogger
  ) {}

  async handle(req: Request, res: Response): Promise<void> {
    let event: WebhookEvent;

    try {
      event = await verifyWebhook(req);
    } catch (err) {
      this.logger.error('Webhook verification failed', err as Error);
      const error = ApiError.validationError('Webhook verification failed');
      res.status(error.statusCode).json(error.toJSON());
      return;
    }

    this.logger.info(`Received webhook event: ${event.type}`);

    switch (event.type) {
      case 'user.created':
      case 'user.updated': {
        const result = await this.userService.syncUserFromClerk(
          event.data as unknown as ClerkUserData
        );

        if (result.isErr()) {
          const apiError = result.getError();
          this.logger.error('Failed to sync user', apiError);
          res.status(apiError.statusCode).json(apiError.toJSON());
          return;
        }
        break;
      }

      case 'user.deleted': {
        if (event.data.id) {
          const result = await this.userService.deleteUserByClerkId(
            event.data.id
          );

          if (result.isErr()) {
            const apiError = result.getError();
            this.logger.error('Failed to delete user', apiError);
            res.status(apiError.statusCode).json(apiError.toJSON());
            return;
          }
        }
        break;
      }

      default:
        this.logger.info(`Unhandled webhook event type: ${event.type}`);
    }

    res.status(200).json({ received: true });
  }
}
