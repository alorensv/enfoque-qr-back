import { Controller, Get, Post, Put, Param, Body, UploadedFiles, UseInterceptors, ParseIntPipe, Delete, Res } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { maintenanceMulterStorage } from './maintenance.storage';
import { File as MulterFile } from 'multer';
import { Multer } from 'multer';
import { MaintenancesService } from './maintenances.service';

@Controller('maintenances')
export class MaintenancesController {
    
  constructor(private readonly maintenancesService: MaintenancesService) {}

    // GET /maintenances/:id/logs
  @Get('/:id/logs')
  async getLogs(@Param('id', ParseIntPipe) id: number) {
    return this.maintenancesService.getLogsByMaintenance(id);
  }

  // GET /maintenances/documents/:docId/download
  @Get('/documents/:docId/download')
  async downloadDocument(@Param('docId', ParseIntPipe) docId: number, @Res() res) {
    const path = require('path');
    const fs = require('fs');
    const document = await this.maintenancesService.getDocumentById(docId);
    if (!document) return res.status(404).send('Documento no encontrado');
    const filePath = path.join(process.cwd(), 'public', document.filePath);
    if (!fs.existsSync(filePath)) return res.status(404).send('Archivo no encontrado');
    return res.download(filePath, document.name);
  }


  // GET /maintenances/:id/photos
  @Get('/:id/photos')
  async getPhotos(@Param('id', ParseIntPipe) id: number) {
    return this.maintenancesService.listPhotos(id);
  }

  // GET /maintenances/:id/documents
  @Get('/:id/documents')
  async getDocuments(@Param('id', ParseIntPipe) id: number) {
    return this.maintenancesService.listDocuments(id);
  }

  // GET /equipment/:id/maintenances
  @Get('/equipment/:equipmentId')
  async getByEquipment(@Param('equipmentId', ParseIntPipe) equipmentId: number) {
    return this.maintenancesService.getByEquipment(equipmentId);
  }

  // POST /equipment/:id/maintenances
  @Post('/equipment/:equipmentId')
  async createForEquipment(
    @Param('equipmentId', ParseIntPipe) equipmentId: number,
    @Body() data: any
  ) {
    return this.maintenancesService.createForEquipment(equipmentId, data);
  }

  // GET /maintenances/:id
  @Get('/:id')
  async getById(@Param('id', ParseIntPipe) id: number) {
    return this.maintenancesService.getById(id);
  }

  // PUT /maintenances/:id
  @Put('/:id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() data: any) {
    return this.maintenancesService.update(id, data);
  }

  // POST /maintenances/:id/photos
  @Post('/:id/photos')
  @UseInterceptors(FilesInterceptor('photos', 10, {
    storage: maintenanceMulterStorage('fotos'),
  }))
  async uploadPhotos(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFiles() files: MulterFile[]
  ) {
    return this.maintenancesService.uploadPhotos(id, files);
  }

  // POST /maintenances/:id/documents
  @Post('/:id/documents')
  @UseInterceptors(FilesInterceptor('documents', 10, {
    storage: maintenanceMulterStorage('documentos'),
  }))
  async uploadDocuments(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFiles() files: MulterFile[]
  ) {
    return this.maintenancesService.uploadDocuments(id, files);
  }

  // POST /maintenances/:id/complete
  @Post('/:id/complete')
  async complete(@Param('id', ParseIntPipe) id: number) {
    return this.maintenancesService.complete(id);
  }

  // DELETE /maintenances/:id
  @Delete('/:id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.maintenancesService.delete(id);
  }
}
