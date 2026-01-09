import { File as MulterFile } from 'multer';
// Importar tipos de Express para Multer
import type { Request as ExpressRequest } from 'express';
import { Injectable, Inject, forwardRef, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Equipment } from '../models/equipment.entity';
import { QrService } from '../qr/qr.service';
import { CodigoQrEstado } from '../models/codigo_qr.entity';
import { EquipmentQrCode } from '../models/equipment_qr_code.entity';

import { EquipmentDocument } from '../models/equipment_document.entity';

@Injectable()
export class EquipmentService {
  
  constructor(
    @InjectRepository(Equipment)
    private readonly equipmentRepository: Repository<Equipment>,
    @InjectRepository(EquipmentDocument)
    private readonly documentRepository: Repository<EquipmentDocument>,
    @InjectRepository(EquipmentQrCode)
    private readonly equipmentQrCodeRepository: Repository<EquipmentQrCode>,
    @Inject(forwardRef(() => QrService))
    private readonly qrService: QrService,
  ) {}

  async findOne(id: number) {
    return this.equipmentRepository
      .createQueryBuilder('equipment')
      .where('equipment.deleted_at IS NULL')
      .andWhere('equipment.id = :id', { id })
      .getOne();
  }

  findAll() {
    return this.equipmentRepository
      .createQueryBuilder('equipment')
      .where('equipment.deleted_at IS NULL')
      .getMany();
  }

  async create(createEquipmentDto: Partial<Equipment>, equipmentPhotoFile?: MulterFile): Promise<Equipment> {
    if (Array.isArray(createEquipmentDto)) {
      throw new BadRequestException('Se esperaba un solo equipo');
    }

    // 1. Crear el equipo en la BD para obtener el ID
    const tempEquipo = this.equipmentRepository.create(createEquipmentDto);
    const savedEquipo = await this.equipmentRepository.save(tempEquipo);
    const equipmentId = savedEquipo.id;

    // 2. Mover la foto del equipo si existe
    if (equipmentPhotoFile) {
      const path = require('path');
      const fs = require('fs');
      
      // Ruta final: public/equipos/<id>/foto_equipo/
      const finalDir = path.join(process.cwd(), 'public', 'equipos', String(equipmentId), 'foto_equipo');
      if (!fs.existsSync(finalDir)) fs.mkdirSync(finalDir, { recursive: true });
      
      const finalPath = path.join(finalDir, equipmentPhotoFile.filename);
      const tempPath = equipmentPhotoFile.path;

      fs.renameSync(tempPath, finalPath);

      // Actualizar la ruta en la BD
      const photoRelPath = `/equipos/${equipmentId}/foto_equipo/${equipmentPhotoFile.filename}`;
      savedEquipo.equipmentPhoto = photoRelPath;
      await this.equipmentRepository.save(savedEquipo);
    }

    // 3. Generar QR
    const token = Array.from({ length: 40 }, () =>
      Math.random().toString(36).charAt(2),
    ).join('');
    const baseUrl = process.env.QR_FRONT_PUBLIC_BASE_URL ?? 'http://localhost:3000/qr';
    const urlPublica = `${baseUrl}/${token}`;

    // La generación de la imagen QR se hará en el qr.service
    await this.qrService.create({
      token,
      urlPublica,
      imagenPath: null, // Se actualizará después
      estado: CodigoQrEstado.GENERADO,
    }, equipmentId);

    const equipmentQrCode = this.equipmentQrCodeRepository.create({
      token,
      equipmentId: savedEquipo.id,
      enabled: 1,
      assignedAt: new Date(),
    });

    await this.equipmentQrCodeRepository.save(equipmentQrCode);
    return savedEquipo;
  }

  async addDocument(equipmentId: number, file: MulterFile, body: { name: string; type?: string; userId: number; isPrivate?: number }) {
    const path = require('path');
    const fs = require('fs');

    // 1. Mover el archivo a su carpeta final
    const finalDir = path.join(process.cwd(), 'public', 'equipos', String(equipmentId), 'documentos');
    if (!fs.existsSync(finalDir)) fs.mkdirSync(finalDir, { recursive: true });
    
    const finalPath = path.join(finalDir, file.filename);
    fs.renameSync(file.path, finalPath);

    // 2. Crear el registro en la base de datos
    const relPath = `/equipos/${equipmentId}/documentos/${file.filename}`;
    const doc = this.documentRepository.create({
      equipmentId,
      name: body.name || file.originalname,
      originalName: file.originalname,
      type: body.type || file.mimetype,
      filePath: relPath,
      userId: body.userId,
      isPrivate: body.isPrivate ? 1 : 0,
    });

    return this.documentRepository.save(doc);
  }

  async update(id: number, updateEquipmentDto: any) {
    const equipo = await this.equipmentRepository.findOne({ where: { id, deletedAt: null } });
    if (!equipo) return null;
    Object.assign(equipo, updateEquipmentDto);
    return this.equipmentRepository.save(equipo);
  }

  async softDelete(id: number) {
    const equipo = await this.equipmentRepository.findOne({ where: { id, deletedAt: null } });
    if (!equipo) return null;
    equipo.deletedAt = new Date();
    await this.equipmentRepository.save(equipo);
    return true;
  }

  /**
   * Obtiene los QR activos asociados a un equipo
   */
  async findQrsByEquipmentId(equipmentId: number) {
    // Buscar los tokens activos asociados al equipo
    const qrLinks = await this.equipmentQrCodeRepository.find({
      where: { equipmentId, deletedAt: null, enabled: 1, revokedAt: null },
    });
    if (!qrLinks.length) return [];
    // Buscar los QR completos usando los tokens
    const tokens = qrLinks.map(qr => qr.token);
    // Buscar los QR en la tabla codigo_qr
    const { In } = require('typeorm');
    const qrs = await this.qrService['qrRepository'].find({
      where: { token: In(tokens), deletedAt: null },
    });
    // Devolver solo los datos relevantes
    return qrs.map(qr => ({
      id: qr.id,
      token: qr.token,
      urlPublica: qr.urlPublica,
      imagenPath: qr.imagenPath,
      estado: qr.estado,
    }));
  }
}
