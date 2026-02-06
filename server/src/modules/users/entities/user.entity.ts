import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '@shared/database/entities';
import { UserRole } from '@shared/types';
import { Booking } from '@modules/bookings/entities/booking.entity';

@Entity('users')
export class User extends BaseEntity {
  @Column({ name: 'clerk_user_id', type: 'varchar', length: 255, unique: true })
  clerkUserId: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ name: 'first_name', type: 'varchar', length: 100 })
  firstName: string;

  @Column({ name: 'last_name', type: 'varchar', length: 100 })
  lastName: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string | null;

  @Column({ type: 'varchar', length: 20, default: UserRole.USER })
  role: UserRole;

  @OneToMany(() => Booking, (booking) => booking.user)
  bookings: Booking[];
}
