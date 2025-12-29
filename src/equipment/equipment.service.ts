import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Equipment } from '../models/equipment.entity';

@Injectable()
export class EquipmentService {
  constructor(
    @InjectRepository(Equipment)
    private readonly equipmentRepository: Repository<Equipment>,
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

  async create(createEquipmentDto: any) {
    const equipo = this.equipmentRepository.create(createEquipmentDto);
    return this.equipmentRepository.save(equipo);
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
}
