import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

export enum CodigoQrEstado {
  GENERADO = 'GENERADO',
  ENROLADO = 'ENROLADO',
  ANULADO = 'ANULADO',
}

@Entity('codigo_qr')
export class CodigoQr {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 64 })
  token: string;

  @Column({ name: 'url_publica' })
  urlPublica: string;

  @Column({ name: 'imagen_path', nullable: true })
  imagenPath: string | null;

  @Column({
    type: 'enum',
    enum: CodigoQrEstado,
    default: CodigoQrEstado.GENERADO,
  })
  estado: CodigoQrEstado;

  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ name: 'updated_at', type: 'timestamp', nullable: true, onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date | null;

  @Column({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt: Date | null;
}
