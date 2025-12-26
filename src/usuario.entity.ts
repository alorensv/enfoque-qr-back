import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ default: 1 })
  estado: number;

  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ name: 'updated_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @Column({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt: Date | null;

  @Column({ name: 'remember_token', nullable: true })
  rememberToken: string | null;
}
