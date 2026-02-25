import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { BaseEntity } from '@shared/database/entities';
import { BookingStatus, PaymentMethod } from '@shared/types';
import { decimalTransformer } from '@shared/database/transformers/decimal.transformer';
import { User } from '@modules/users/entities/user.entity';
import { BookingService } from './booking-service.entity';

@Entity('bookings')
@Index(['appointmentDate', 'appointmentDatetime'])
@Index(['appointmentDatetime'])
@Index(['stripePaymentIntentId'])
export class Booking extends BaseEntity {
  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, (user) => user.bookings)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'appointment_datetime', type: 'datetime' })
  appointmentDatetime: Date;

  @Column({ name: 'appointment_date', type: 'date' })
  appointmentDate: string;

  @Column({ name: 'total_duration_minutes', type: 'integer' })
  totalDurationMinutes: number;

  @Column({
    type: 'varchar',
    length: 20,
    default: BookingStatus.PENDING_PAYMENT,
  })
  status: BookingStatus;

  @Column({ name: 'payment_method', type: 'varchar', length: 20 })
  paymentMethod: PaymentMethod;

  @Column({
    name: 'total_price',
    type: 'decimal',
    precision: 10,
    scale: 2,
    transformer: decimalTransformer,
  })
  totalPrice: number;

  @Column({ type: 'varchar', length: 3, default: 'USD' })
  currency: string;

  @Column({
    name: 'stripe_payment_intent_id',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  stripePaymentIntentId: string | null;

  @Column({
    name: 'idempotency_key',
    type: 'varchar',
    length: 255,
    unique: true,
  })
  idempotencyKey: string;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ name: 'checked_in_at', type: 'datetime', nullable: true })
  checkedInAt: Date | null;

  @Column({ name: 'completed_at', type: 'datetime', nullable: true })
  completedAt: Date | null;

  @Column({ name: 'cancelled_at', type: 'datetime', nullable: true })
  cancelledAt: Date | null;

  @OneToMany(() => BookingService, (bookingService) => bookingService.booking)
  bookingServices: BookingService[];
}
