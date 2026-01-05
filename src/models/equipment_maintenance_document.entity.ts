import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { EquipmentMaintenance } from './equipment_maintenance.entity';

@Entity('equipment_maintenance_documents')
export class EquipmentMaintenanceDocument {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'maintenance_id', type: 'bigint', unsigned: true })
  maintenanceId: number;

  @ManyToOne(() => EquipmentMaintenance)
  @JoinColumn({ name: 'maintenance_id' })
  maintenance: EquipmentMaintenance;

  @Column({ name: 'name', type: 'varchar', length: 255 })
  name: string;

  @Column({ name: 'file_path', type: 'varchar', length: 255 })
  filePath: string;

  @Column({ name: 'uploaded_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  uploadedAt: Date;
}
