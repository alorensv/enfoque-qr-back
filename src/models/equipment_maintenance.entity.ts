import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Equipment } from './equipment.entity';
import { User } from './user.entity';

@Entity('equipment_maintenances')
export class EquipmentMaintenance {
  @PrimaryGeneratedColumn()
  id: number;


  @Column({ name: 'equipment_id', type: 'bigint', unsigned: true })
  equipmentId: number;

  @ManyToOne(() => Equipment)
  @JoinColumn({ name: 'equipment_id' })
  equipment: Equipment;

  @Column({ name: 'user_id' })
  userId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'performed_at', type: 'date', nullable: true })
  performedAt: string | null;

  @Column({ nullable: true })
  technician: string | null;


  @Column({ nullable: true })
  status: string | null;


  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ name: 'updated_at', type: 'timestamp', nullable: true, onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date | null;

  @Column({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt: Date | null;
}
