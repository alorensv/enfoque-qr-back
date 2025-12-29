import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CodigoQr } from '../models/codigo_qr.entity';
import { QrService } from './qr.service';
import { QrController } from './qr.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CodigoQr])],
  providers: [QrService],
  controllers: [QrController],
  exports: [QrService],
})
export class QrModule {}
