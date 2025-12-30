import { Controller, Get, Post, Put, Delete, Param, Body, NotFoundException } from '@nestjs/common';
import { EquipmentService } from './equipment.service';
import { Equipment } from '../models/equipment.entity';

@Controller('equipments')
export class EquipmentController {
  constructor(private readonly equipmentService: EquipmentService) {}

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
