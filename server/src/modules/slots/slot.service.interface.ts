import { Result } from '@shared/utils';
import { ApiError } from '@shared/errors';

export interface SlotInfo {
  startTime: string;
  endsAt?: string;
  capacity: number;
  occupied: number;
  available: boolean;
}

export interface BusinessHoursInfo {
  openTime: string;
  closeTime: string;
  lunchBreak?: {
    start: string;
    end: string;
  };
  capacity: number;
  slotInterval?: number;
}

export interface SlotAvailabilityResponse {
  date: string;
  dayOfWeek: number;
  dayName: string;
  businessHours: BusinessHoursInfo;
  requiredDuration?: number;
  slots: SlotInfo[];
}

export interface GetSlotsParams {
  date: string;
  serviceIds?: string[];
}

export interface ISlotService {
  getAvailableSlots(
    params: GetSlotsParams
  ): Promise<Result<SlotAvailabilityResponse, ApiError>>;
}
