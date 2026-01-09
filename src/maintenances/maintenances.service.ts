import { Injectable } from '@nestjs/common';
import { MaintenanceLogService } from './maintenance-log.service';
import { File as MulterFile } from 'multer';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EquipmentMaintenance } from '../models/equipment_maintenance.entity';
import { EquipmentMaintenancePhoto } from '../models/equipment_maintenance_photo.entity';
import { EquipmentMaintenanceDocument } from '../models/equipment_maintenance_document.entity';

@Injectable()
export class MaintenancesService {
  constructor(
    @InjectRepository(EquipmentMaintenance)
    private readonly maintenanceRepo: Repository<EquipmentMaintenance>,
    @InjectRepository(EquipmentMaintenancePhoto)
    private readonly photoRepo: Repository<EquipmentMaintenancePhoto>,
    @InjectRepository(EquipmentMaintenanceDocument)
    private readonly documentRepo: Repository<EquipmentMaintenanceDocument>,
    private readonly maintenanceLogService: MaintenanceLogService,
  ) {}

  async getLogsByMaintenance(maintenanceId: number) {
    return this.maintenanceLogService.getLogsByMaintenance(String(maintenanceId));
  }

  async getDocumentById(docId: number) {
    return this.documentRepo.findOne({ where: { id: docId } });
  }

  async getByEquipment(equipmentId: number) {
    return this.maintenanceRepo.find({
      where: { equipmentId, deletedAt: null },
      order: { performedAt: 'DESC', createdAt: 'DESC' },
      relations: ['user', 'user.userProfile'],
    });
  }

  async createForEquipment(equipmentId: number, data: any) {
    // Aquí deberías obtener el userId autenticado, por ahora null
    const maintenance = this.maintenanceRepo.create({
      equipmentId,
      userId: data.userId || null, // Ajustar según autenticación
      description: data.description,
      performedAt: data.performedAt,
      technician: data.technician,
      status: data.status,
    });
    const saved = await this.maintenanceRepo.save(maintenance);
    // Registrar log de creación
    if (saved && saved.id && saved.userId) {
      await this.maintenanceLogService.createLog(
        String(saved.id),
        String(saved.userId),
        'CREACION',
        'Se registró la mantención.'
      );
    }
    return saved;
  }

  async getById(id: number) {
    // Obtener la mantención con relaciones de usuario y perfil
    const maintenance = await this.maintenanceRepo.findOne({
      where: { id, deletedAt: null },
      relations: ['user', 'user.userProfile'],
    });
    if (!maintenance) return null;

    // Separar fecha y hora de performedAt
    let fecha = null;
    let hora = null;
    if (maintenance.performedAt) {
      // Si performedAt es tipo Date o string ISO
      const dateObj = new Date(maintenance.performedAt);
      if (!isNaN(dateObj.getTime())) {
        fecha = dateObj.toISOString().slice(0, 10);
        hora = dateObj.toISOString().slice(11, 19);
      } else if (typeof maintenance.performedAt === 'string') {
        // Si solo es fecha (YYYY-MM-DD)
        fecha = maintenance.performedAt;
        hora = null;
      }
    }

    // Obtener nombre completo del responsable
    let responsable = null;
    if (maintenance.user && maintenance.user.userProfile) {
      responsable = maintenance.user.userProfile.fullName;
    }

    return {
      ...maintenance,
      fecha,
      hora,
      responsable,
    };
  }

  async update(id: number, data: any) {
    // Obtener la mantención actual
    const maintenance = await this.maintenanceRepo.findOne({ where: { id } });
    if (!maintenance) throw new Error('Mantención no encontrada');
    // Actualizar campos permitidos
    if (data.description !== undefined) maintenance.description = data.description;
    if (data.performedAt !== undefined) maintenance.performedAt = data.performedAt;
    if (data.technician !== undefined) maintenance.technician = data.technician;
    if (data.status !== undefined) maintenance.status = data.status;
    // Guardar cambios
    const updated = await this.maintenanceRepo.save(maintenance);
    // Registrar log de edición
    if (updated && updated.id && updated.userId) {
      await this.maintenanceLogService.createLog(
        String(updated.id),
        String(updated.userId),
        'EDICION',
        'Se editó la mantención.'
      );
    }
    return updated;
  }

  async uploadPhotos(id: number, files: MulterFile[]) {
    if (!files || files.length === 0) throw new Error('No se subió ningún archivo');

    const maintenance = await this.maintenanceRepo.findOne({ where: { id } });
    if (!maintenance) throw new Error('Mantención no encontrada');
    const equipmentId = maintenance.equipmentId;

    const path = require('path');
    const fs = require('fs');

    const saved = [];
    for (const file of files) {
      if (!file || !file.path) throw new Error('Archivo inválido');

      // Mover archivo
      const finalDir = path.join(process.cwd(), 'public', 'equipos', String(equipmentId), 'mantenciones', String(id), 'fotos');
      if (!fs.existsSync(finalDir)) fs.mkdirSync(finalDir, { recursive: true });
      
      const finalPath = path.join(finalDir, file.filename);
      fs.renameSync(file.path, finalPath);

      // Guardar path relativo
      const relativePath = `/equipos/${equipmentId}/mantenciones/${id}/fotos/${file.filename}`;
      const photo = this.photoRepo.create({
        maintenanceId: id,
        filePath: relativePath,
      });
      saved.push(await this.photoRepo.save(photo));
    }
    return { id, photos: saved };
  }

  async uploadDocuments(id: number, files: MulterFile[]) {
    if (!files || files.length === 0) throw new Error('No se subió ningún archivo');

    const maintenance = await this.maintenanceRepo.findOne({ where: { id } });
    if (!maintenance) throw new Error('Mantención no encontrada');
    const equipmentId = maintenance.equipmentId;

    const path = require('path');
    const fs = require('fs');

    const saved = [];
    for (const file of files) {
      if (!file || !file.path) throw new Error('Archivo inválido');
      
      // Mover archivo
      const finalDir = path.join(process.cwd(), 'public', 'equipos', String(equipmentId), 'mantenciones', String(id), 'documentos');
      if (!fs.existsSync(finalDir)) fs.mkdirSync(finalDir, { recursive: true });

      const finalPath = path.join(finalDir, file.filename);
      fs.renameSync(file.path, finalPath);

      // Guardar path relativo
      const relativePath = `/equipos/${equipmentId}/mantenciones/${id}/documentos/${file.filename}`;
      const doc = this.documentRepo.create({
        maintenanceId: id,
        name: file.originalname,
        filePath: relativePath,
      });
      saved.push(await this.documentRepo.save(doc));
    }
    return { id, documents: saved };
  }

  async listPhotos(id: number) {
    return this.photoRepo.find({ where: { maintenanceId: id } });
  }

  async listDocuments(id: number) {
    return this.documentRepo.find({ where: { maintenanceId: id } });
  }

  async complete(id: number) {
    // TODO: Implementar lógica para marcar como completada
    return { id, status: 'completada' };
  }

  async delete(id: number) {
    // TODO: Implementar lógica para eliminar mantención (soft delete)
    return { id, deleted: true };
  }
}
