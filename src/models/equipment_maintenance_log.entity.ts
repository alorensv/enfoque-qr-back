import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { EquipmentMaintenance } from './equipment_maintenance.entity';
import { User } from './user.entity';

@Entity('equipment_maintenance_logs')
export class EquipmentMaintenanceLog {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: string;

  @Column({ name: 'maintenance_id', type: 'bigint' })
  maintenanceId: string;

  @Column({ name: 'user_id', type: 'bigint' })
  userId: string;

  @Column({ type: 'varchar', length: 50 })
  action: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @ManyToOne(() => EquipmentMaintenance, maintenance => maintenance.logs, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'maintenance_id' })
  maintenance: EquipmentMaintenance;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
