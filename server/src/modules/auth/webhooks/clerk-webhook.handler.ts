import { Request, Response } from 'express';
import { verifyWebhook, WebhookEvent } from '@clerk/express/webhooks';
import { ILogger } from '@shared/types';
import { IUserService, ClerkUserData } from '@modules/users';
import { IClerkWebhookHandler } from './clerk-webhook.handler.interface';

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
      res.status(400).json({ error: 'Webhook verification failed' });
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
          this.logger.error('Failed to sync user', new Error(result.getError()));
          res.status(500).json({ error: result.getError() });
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
            this.logger.error('Failed to delete user', new Error(result.getError()));
            res.status(500).json({ error: result.getError() });
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
