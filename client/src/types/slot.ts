export interface AvailableSlot {
  startTime: string;
  endTime: string;
  available: boolean;
}

export interface SlotResponse {
  date: string;
  slots: AvailableSlot[];
}
