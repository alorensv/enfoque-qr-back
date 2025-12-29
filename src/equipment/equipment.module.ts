import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EquipmentService } from './equipment.service';
import { Equipment } from '../models/equipment.entity';
import { EquipmentQrCode } from '../models/equipment_qr_code.entity';
import { QrModule } from '../qr/qr.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Equipment, EquipmentQrCode]),
    forwardRef(() => QrModule),
  ],
  providers: [EquipmentService],
  exports: [EquipmentService],
})
export class EquipmentModule {}
