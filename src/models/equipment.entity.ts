import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Institution } from './institution.entity';


@Index('idx_equipments_name', ['name'])
@Index('idx_equipments_serial_number', ['serialNumber'])
@Index('idx_equipments_status', ['status'])
@Index('idx_equipments_institution_status', ['institutionId', 'status'])
@Index('idx_equipments_created_at', ['createdAt'])
@Entity('equipments')
export class Equipment {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column()
  name: string;

  @Column({ name: 'serial_number', nullable: true })
  serialNumber: string | null;

  @Column({ nullable: true, type: 'text' })
  description: string | null;

  @Column({ nullable: true })
  status: string | null;

  @Column({ name: 'institution_id', nullable: true })
  institutionId: number | null;

  @ManyToOne(() => Institution, { nullable: true })
  @JoinColumn({ name: 'institution_id' })
  institution: Institution;

  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ name: 'updated_at', type: 'timestamp', nullable: true, onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date | null;

  @Column({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt: Date | null;
}
