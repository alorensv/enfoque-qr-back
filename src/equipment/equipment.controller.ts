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
    if (!doc || !doc.filePath) throw new NotFoundException('Documento no encontrado');
    // Asume que filePath es una ruta absoluta o relativa al directorio public
    const path = require('path');
    const fs = require('fs');
    // Si filePath es relativo, ajústalo a la carpeta public
    let fileAbsPath = doc.filePath;
    if (!path.isAbsolute(fileAbsPath)) {
      fileAbsPath = path.join(process.cwd(), 'public', fileAbsPath.replace(/^\/+/, ''));
    }
    if (!fs.existsSync(fileAbsPath)) throw new NotFoundException('Archivo no encontrado en servidor');
    res.download(fileAbsPath, doc.name);
  }

  /**
   * Endpoint para subir documentación real de un equipo (archivo)
   * (POST /equipments/:id/documents)
   * multipart/form-data: file, name, type, userId, institutionId
   */
  @Post(':id/documents')
  @UseInterceptors(FileInterceptor('file', {
    storage: multer.diskStorage({
      destination: async (req, file, cb) => {
        try {
          const institutionId = req.body.institutionId;
          if (!institutionId) return cb(new Error('institutionId requerido'), '');
          const path = require('path');
          const fs = require('fs');
          const dest = path.join(process.cwd(), 'public', 'documentos', String(institutionId));
          if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
          cb(null, dest);
        } catch (e) {
          cb(e, '');
        }
      },
      filename: (req, file, cb) => {
        // Guardar con timestamp y nombre original
        const unique = Date.now() + '-' + file.originalname.replace(/\s+/g, '_');
        cb(null, unique);
      },
    })
  }))
  async addDocument(
    @Param('id') id: string,
    @UploadedFile() file: MulterFile,
    @Body() body: { name: string; type?: string; userId: number; institutionId: number }
  ) {
    const numId = parseInt(id, 10);
    if (isNaN(numId)) throw new NotFoundException('ID inválido');
    if (!file) throw new BadRequestException('Archivo requerido');
    if (!body.institutionId) throw new BadRequestException('institutionId requerido');
    // Guardar ruta relativa para filePath
    const relPath = `/documentos/${body.institutionId}/${file.filename}`;
    const doc = this.equipmentDocumentRepository.create({
      equipmentId: numId,
      name: body.name || file.originalname,
      type: body.type || file.mimetype,
      filePath: relPath,
      userId: body.userId,
      createdAt: new Date(),
      updatedAt: null,
      deletedAt: null,
    });
    const saved = await this.equipmentDocumentRepository.save(doc);
    return saved;
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
  create(@Body() createEquipmentDto: Partial<Equipment>): Promise<Equipment> {
    return this.equipmentService.create(createEquipmentDto);
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
