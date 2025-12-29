import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CodigoQr } from '../models/codigo_qr.entity';
import * as QRCode from 'qrcode';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class QrService {
  constructor(
    @InjectRepository(CodigoQr)
    private readonly qrRepository: Repository<CodigoQr>,
  ) {}

  async findAll() {
    return this.qrRepository.find({ where: { deletedAt: null } });
  }

  async findByToken(token: string) {
    return this.qrRepository.findOne({ where: { token, deletedAt: null } });
  }

  async create(data: Partial<CodigoQr>) {
    // 1. Crear el registro QR en la base de datos (sin imagen)
    const qr = this.qrRepository.create(data);
    const savedQr = await this.qrRepository.save(qr);

    // 2. Generar imagen QR (PNG) usando la urlPublica
    const qrDir = path.join(process.cwd(), 'public', 'qr');
    if (!fs.existsSync(qrDir)) {
      fs.mkdirSync(qrDir, { recursive: true });
    }
    const fileName = `qr_${savedQr.token}.png`;
    const filePath = path.join(qrDir, fileName);
    await QRCode.toFile(filePath, savedQr.urlPublica, { width: 400 });

    // 3. Guardar la ruta relativa de la imagen en la base de datos
    savedQr.imagenPath = `/qr/${fileName}`;
    await this.qrRepository.save(savedQr);

    return savedQr;
  }
}
