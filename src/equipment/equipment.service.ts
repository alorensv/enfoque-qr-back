import { Injectable, Inject, forwardRef, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Equipment } from '../models/equipment.entity';
import { QrService } from '../qr/qr.service';
import { CodigoQrEstado } from '../models/codigo_qr.entity';
import { EquipmentQrCode } from '../models/equipment_qr_code.entity';

@Injectable()
export class EquipmentService {
  
  constructor(
    @InjectRepository(Equipment)
    private readonly equipmentRepository: Repository<Equipment>,
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

  async create(createEquipmentDto: Partial<Equipment>): Promise<Equipment> {
    if (Array.isArray(createEquipmentDto)) {
      throw new BadRequestException('Se esperaba un solo equipo');
    }

    const equipo = this.equipmentRepository.create(createEquipmentDto);
    const savedEquipo = await this.equipmentRepository.save(equipo);

    const token = Array.from({ length: 40 }, () =>
      Math.random().toString(36).charAt(2),
    ).join('');

    /**
     * 3. Construir URL pública
     */
    const baseUrl =
      process.env.QR_PUBLIC_BASE_URL ?? 'https://app.dominio.cl/qr';

    const urlPublica = `${baseUrl}/${token}`;

    const qr = await this.qrService.create({
      token,
      urlPublica,
      imagenPath: null,
      estado: CodigoQrEstado.GENERADO,
      deletedAt: null,
    });

    const equipmentQrCode = this.equipmentQrCodeRepository.create({
      token,
      equipmentId: savedEquipo.id,
      enabled: 1,
      assignedAt: new Date(),
      createdAt: new Date(),
      updatedAt: null,
      revokedAt: null,
      deletedAt: null,
    });

    await this.equipmentQrCodeRepository.save(equipmentQrCode);
    return savedEquipo;
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
