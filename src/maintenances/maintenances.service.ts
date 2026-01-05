import { Injectable } from '@nestjs/common';
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
  ) {}

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
    return saved;
  }

  async getById(id: number) {
    // TODO: Implementar lógica para ver detalle de mantención
    return { id };
  }

  async update(id: number, data: any) {
    // TODO: Implementar lógica para editar mantención
    return { id, ...data };
  }

  async uploadPhotos(id: number, files: MulterFile[]) {
    if (!files || files.length === 0) throw new Error('No se subió ningún archivo');
    const saved = [];
    for (const file of files) {
      if (!file || !(file.filename || file.path)) throw new Error('Archivo inválido');
      // Guardar path relativo: /mantenciones/{id}/fotos/{filename}
      const relativePath = `/mantenciones/${id}/fotos/${file.filename}`;
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
    const saved = [];
    for (const file of files) {
      if (!file || !(file.filename || file.path)) throw new Error('Archivo inválido');
      // Guardar path relativo: /mantenciones/{id}/documentos/{filename}
      const relativePath = `/mantenciones/${id}/documentos/${file.filename}`;
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
