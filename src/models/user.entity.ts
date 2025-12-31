import { Entity, PrimaryGeneratedColumn, Column, OneToOne } from 'typeorm';
import { UserProfile } from './user_profile.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ default: 1, name: 'status' })
  status: number;

  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ name: 'updated_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @Column({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt: Date | null;

  @Column({ name: 'remember_token', nullable: true })
  rememberToken: string | null;

  @OneToOne(() => UserProfile, userProfile => userProfile.user)
  userProfile: UserProfile;
}
