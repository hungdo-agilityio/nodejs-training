import { Entity, Column } from 'typeorm';
import { BaseEntity } from '@shared/database/entities';
import { decimalTransformer } from '@shared/database/transformers/decimal.transformer';

@Entity('services')
export class Service extends BaseEntity {
  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    transformer: decimalTransformer,
  })
  price: number;

  @Column({ name: 'duration_minutes', type: 'integer' })
  durationMinutes: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;
}
