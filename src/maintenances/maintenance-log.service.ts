import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EquipmentMaintenanceLog } from '../models/equipment_maintenance_log.entity';

@Injectable()
export class MaintenanceLogService {
  constructor(
    @InjectRepository(EquipmentMaintenanceLog)
    private readonly logRepository: Repository<EquipmentMaintenanceLog>,
  ) {}

  async createLog(maintenanceId: string, userId: string, action: string, description: string): Promise<EquipmentMaintenanceLog> {
    const log = this.logRepository.create({
      maintenanceId,
      userId,
      action,
      description,
    });
    return this.logRepository.save(log);
  }

  async getLogsByMaintenance(maintenanceId: string): Promise<EquipmentMaintenanceLog[]> {
    return this.logRepository.find({
      where: { maintenanceId },
      order: { createdAt: 'DESC' },
    });
  }
}
