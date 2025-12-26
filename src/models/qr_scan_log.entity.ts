import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { EquipmentQrCode } from './equipment_qr_code.entity';

@Entity('qr_scan_logs')
export class QrScanLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'qr_code_id', type: 'char', length: 36 })
  qrCodeId: string;

  @ManyToOne(() => EquipmentQrCode)
  @JoinColumn({ name: 'qr_code_id' })
  qrCode: EquipmentQrCode;

  @Column({ nullable: true })
  ip: string | null;

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent: string | null;

  @Column({ name: 'scanned_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  scannedAt: Date;

  @Column({ name: 'updated_at', type: 'timestamp', nullable: true, onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date | null;

  @Column({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt: Date | null;
}
