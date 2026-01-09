import { Controller, Get, Post, Param, Body, NotFoundException, Res } from '@nestjs/common';
import { Response } from 'express';
import * as path from 'path';
import * as fs from 'fs';
import { QrService } from './qr.service';

@Controller('qr')
export class QrController {
  constructor(private readonly qrService: QrService) {}

  @Get()
  findAll() {
    return this.qrService.findAll();
  }

  @Get(':token')
  async findByToken(@Param('token') token: string) {
    const qr = await this.qrService.findByToken(token);
    if (!qr) throw new NotFoundException('QR no encontrado');
    return qr;
  }

  @Get(':token/image')
  async downloadImage(@Param('token') token: string, @Res() res: Response) {
    const qr = await this.qrService.findByToken(token);
    if (!qr || !qr.imagenPath) throw new NotFoundException('Imagen QR no encontrada');
    const filePath = path.join(process.cwd(), 'public', qr.imagenPath);
    if (!fs.existsSync(filePath)) throw new NotFoundException('Archivo de imagen no existe');
    res.sendFile(filePath);
  }

  @Post()
  create(@Body() body: { equipmentId: number, data: any }) {
    return this.qrService.create(body.data, body.equipmentId);
  }
}
