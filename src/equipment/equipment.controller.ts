import { Response } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EquipmentDocument } from '../models/equipment_document.entity';
import { Controller, Get, Post, Put, Delete, Param, Body, NotFoundException, Res, UploadedFile, UseInterceptors, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import * as multer from 'multer';
import { File as MulterFile } from 'multer';
import { EquipmentService } from './equipment.service';
import { Equipment } from '../models/equipment.entity';

@Controller('equipments')
export class EquipmentController {
  constructor(
    private readonly equipmentService: EquipmentService,
    @InjectRepository(EquipmentDocument)
    private readonly equipmentDocumentRepository: Repository<EquipmentDocument>,
  ) { }


  /**
   * Endpoint para descargar un documento de equipo
   * (GET /equipments/documents/:docId/download)
   */
  @Get('documents/:docId/download')
  async downloadDocument(@Param('docId') docId: string, @Res() res: Response) {
    const numId = parseInt(docId, 10);
    if (isNaN(numId)) throw new NotFoundException('ID de documento inválido');
    const doc = await this.equipmentDocumentRepository.findOne({ where: { id: numId, deletedAt: null } });
    if (!doc) throw new NotFoundException('Documento no encontrado');
    const path = require('path');
    const fs = require('fs');
    const filePath = path.join(process.cwd(), 'public', doc.filePath);
    if (fs.existsSync(filePath)) {
      res.download(filePath, doc.originalName || doc.name);
    } else {
      throw new NotFoundException('Archivo no encontrado en el servidor');
    }
  }

  /**
   * Endpoint para subir documentación real de un equipo (archivo)
   * (POST /equipments/:id/documents)
   * multipart/form-data: file, name, type, userId, institutionId
   */
  @Post(':id/documents')
  @UseInterceptors(FileInterceptor('file', {
    storage: multer.diskStorage({
      destination: (req, file, cb) => {
        // Guardar siempre en una carpeta temporal primero
        const path = require('path');
        const fs = require('fs');
        const tmpDir = path.join(process.cwd(), 'public', 'tmp');
        if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
        cb(null, tmpDir);
      },
      filename: (req, file, cb) => {
        const unique = Date.now() + '-' + file.originalname.replace(/\s+/g, '_');
        cb(null, unique);
      },
    })
  }))
  async addDocument(
    @Param('id') id: string,
    @UploadedFile() file: MulterFile,
    @Body() body: { name: string; type?: string; userId: number; isPrivate?: number }
  ) {
    const equipmentId = parseInt(id, 10);
    if (isNaN(equipmentId)) throw new NotFoundException('ID de equipo inválido');
    if (!file) throw new BadRequestException('Archivo requerido');

    return this.equipmentService.addDocument(equipmentId, file, body);
  }

  /**
    * Endpoint para obtener documentos asociados a un equipo
    * (GET /equipments/:id/documents)
  */
  @Get(':id/documents')
  async getDocuments(@Param('id') id: string) {
    const numId = parseInt(id, 10);
    if (isNaN(numId)) throw new NotFoundException('ID inválido');
    // Buscar documentos no eliminados y traer usuario responsable (user y userProfile)
    const docs = await this.equipmentDocumentRepository.createQueryBuilder('doc')
      .leftJoinAndSelect('doc.user', 'user')
      .leftJoinAndSelect('user.userProfile', 'userProfile')
      .where('doc.equipmentId = :equipmentId', { equipmentId: numId })
      .andWhere('doc.deletedAt IS NULL')
      .orderBy('doc.createdAt', 'DESC')
      .getMany();
    // Formatear respuesta para incluir nombre de usuario y fecha
    return docs.map(doc => ({
      id: doc.id,
      name: doc.name,
      type: doc.type,
      filePath: doc.filePath,
      createdAt: doc.createdAt,
      userId: doc.userId,
      responsable: doc.user?.userProfile?.fullName || null,
      isPrivate: doc.isPrivate,
    }));
  }

  /**
   * Endpoint para obtener equipo por token de QR
   */
  @Get('by-qr/:token')
  async getEquipoByQrToken(@Param('token') token: string) {
    // Buscar el registro de equipment_qr_code activo por token
    const qrCodeRepo = this.equipmentService['equipmentQrCodeRepository'];
    const eqQr = await qrCodeRepo.findOne({ where: { token, deletedAt: null, enabled: 1, revokedAt: null } });
    if (!eqQr || !eqQr.equipmentId) return null;
    // Buscar el equipo asociado
    const equipo = await this.equipmentService.findOne(eqQr.equipmentId);
    return equipo;
  }

  @Get()
  findAll() {
    return this.equipmentService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const numId = parseInt(id, 10);
    if (isNaN(numId)) throw new NotFoundException('ID inválido');
    const equipo = await this.equipmentService.findOne(numId);
    if (!equipo) throw new NotFoundException('Equipo no encontrado');
    return equipo;
  }

  @Post()
  @UseInterceptors(FileInterceptor('equipmentPhoto', {
    storage: multer.diskStorage({
      destination: (req, file, cb) => {
        // Guardar siempre en una carpeta temporal primero
        const path = require('path');
        const fs = require('fs');
        const tmpDir = path.join(process.cwd(), 'public', 'tmp');
        if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
        cb(null, tmpDir);
      },
      filename: (req, file, cb) => {
        const unique = Date.now() + '-' + file.originalname.replace(/\s+/g, '_');
        cb(null, unique);
      },
    })
  }))
  /**
   * Crea un equipo y almacena la foto en public/equipos/fotos si se adjunta equipmentPhoto
   */
  async create(@Body() createEquipmentDto: Partial<Equipment>, @UploadedFile() equipmentPhoto?: MulterFile): Promise<Equipment> {
    // Pasar el archivo a EquipmentService para manejo centralizado
    return this.equipmentService.create(createEquipmentDto, equipmentPhoto);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateEquipmentDto: any) {
    const numId = parseInt(id, 10);
    if (isNaN(numId)) throw new NotFoundException('ID inválido');
    const updated = await this.equipmentService.update(numId, updateEquipmentDto);
    if (!updated) throw new NotFoundException('Equipo no encontrado');
    return updated;
  }

  @Delete(':id')
  async softDelete(@Param('id') id: string) {
    try {
      const numId = parseInt(id, 10);
      if (isNaN(numId)) throw new NotFoundException('ID inválido');
      const deleted = await this.equipmentService.softDelete(numId);
      if (!deleted) throw new NotFoundException('Equipo no encontrado');
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message || error };
    }
  }

  /**
   * Endpoint para obtener los QR asociados a un equipo
   */
  @Get(':id/qrs')
  async getQrs(@Param('id') id: string) {
    const numId = parseInt(id, 10);
    if (isNaN(numId)) throw new NotFoundException('ID inválido');
    return this.equipmentService.findQrsByEquipmentId(numId);
  }
}
