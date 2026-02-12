import { Request, Response } from 'express';

export interface IBookingController {
  createBooking(req: Request, res: Response): Promise<void>;
  getBookings(req: Request, res: Response): Promise<void>;
}
