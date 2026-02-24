import { Request, Response } from 'express';

export interface IBookingController {
  createBooking(req: Request, res: Response): Promise<void>;
  getBookings(req: Request, res: Response): Promise<void>;
  getBookingById(req: Request, res: Response): Promise<void>;
  cancelBooking(req: Request, res: Response): Promise<void>;
  getDailyBookings(req: Request, res: Response): Promise<void>;
  checkInBooking(req: Request, res: Response): Promise<void>;
}
