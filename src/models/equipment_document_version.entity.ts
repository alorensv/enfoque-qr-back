import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { EquipmentDocument } from './equipment_document.entity';

@Entity('equipment_document_versions')
export class EquipmentDocumentVersion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'document_id' })
  documentId: number;

  @ManyToOne(() => EquipmentDocument)
  @JoinColumn({ name: 'document_id' })
  document: EquipmentDocument;

  @Column()
  version: number;

  @Column({ name: 'file_path' })
  filePath: string;

  @Column({ nullable: true })
  checksum: string | null;

  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ name: 'updated_at', type: 'timestamp', nullable: true, onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date | null;

  @Column({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt: Date | null;
}
