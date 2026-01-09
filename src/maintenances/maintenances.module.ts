import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MaintenancesController } from './maintenances.controller';
import { MaintenancesService } from './maintenances.service';
import { EquipmentMaintenance } from '../models/equipment_maintenance.entity';
import { EquipmentMaintenancePhoto } from '../models/equipment_maintenance_photo.entity';
import { EquipmentMaintenanceDocument } from '../models/equipment_maintenance_document.entity';
import { EquipmentMaintenanceLog } from '../models/equipment_maintenance_log.entity';
import { MaintenanceLogService } from './maintenance-log.service';

@Module({
  imports: [TypeOrmModule.forFeature([
    EquipmentMaintenance,
    EquipmentMaintenancePhoto,
    EquipmentMaintenanceDocument,
    EquipmentMaintenanceLog,
  ])],
  controllers: [MaintenancesController],
  providers: [MaintenancesService, MaintenanceLogService],
  exports: [MaintenancesService, MaintenanceLogService],
})
export class MaintenancesModule {}
