import * as dotenv from 'dotenv';
dotenv.config();
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { User } from './models/user.entity';
import { Equipment } from './models/equipment.entity';
import { EquipmentController } from './equipment/equipment.controller';
import { EquipmentModule } from './equipment/equipment.module';
import { Institution } from './models/institution.entity';
import { CodigoQr } from './models/codigo_qr.entity';
import { QrModule } from './qr/qr.module';
import { EquipmentQrCode } from './models/equipment_qr_code.entity';
import { EquipmentDocument } from './models/equipment_document.entity';
import { UserProfile } from './models/user_profile.entity';
import { UserInstitution } from './models/user_institution.entity';

import { MaintenancesModule } from './maintenances/maintenances.module';
import { EquipmentMaintenance } from './models/equipment_maintenance.entity';
import { EquipmentMaintenancePhoto } from './models/equipment_maintenance_photo.entity';
import { EquipmentMaintenanceDocument } from './models/equipment_maintenance_document.entity';
import { EquipmentMaintenanceLog } from './models/equipment_maintenance_log.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || 'db',
      port: parseInt(process.env.DB_PORT, 10) || 3306,
      username: process.env.DB_USER || 'enfoque',
      password: process.env.DB_PASS || 'enfoquepass',
      database: process.env.DB_NAME || 'enfoqueqr',
      entities: [User, UserProfile, Equipment, Institution, CodigoQr, EquipmentQrCode, EquipmentDocument, UserInstitution, EquipmentMaintenance, EquipmentMaintenancePhoto, EquipmentMaintenanceDocument, EquipmentMaintenanceLog],
      synchronize: false,
      logging: true,
    }),
    // TypeOrmModule.forFeature([Equipment, Institution]),
    TypeOrmModule.forFeature([EquipmentDocument]),
    AuthModule,
    QrModule,
    EquipmentModule,
    MaintenancesModule,
  ],
  controllers: [AppController, EquipmentController],
  providers: [AppService],
})
export class AppModule {}
