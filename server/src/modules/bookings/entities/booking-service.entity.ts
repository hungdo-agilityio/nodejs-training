import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
  Index,
} from 'typeorm';
import { Booking } from './booking.entity';
import { Service } from '@modules/services/entities/service.entity';
import { decimalTransformer } from '@shared/database/transformers/decimal.transformer';

@Entity('booking_services')
@Index(['bookingId', 'serviceId'], { unique: true })
export class BookingService {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'booking_id', type: 'uuid' })
  bookingId: string;

  @ManyToOne(() => Booking, (booking) => booking.bookingServices)
  @JoinColumn({ name: 'booking_id' })
  booking: Booking;

  @Column({ name: 'service_id', type: 'uuid' })
  serviceId: string;

  @ManyToOne(() => Service)
  @JoinColumn({ name: 'service_id' })
  service: Service;

  @Column({ name: 'service_name', type: 'varchar', length: 100 })
  serviceName: string;

  @Column({ name: 'service_price', type: 'decimal', precision: 10, scale: 2, transformer: decimalTransformer })
  servicePrice: number;

  @Column({ name: 'service_duration_minutes', type: 'integer' })
  serviceDurationMinutes: number;
}
