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

  findAll() {
    return this.equipmentRepository.find({ where: { deletedAt: null } });
  }

  async create(createEquipmentDto: any) {
    const equipo = this.equipmentRepository.create(createEquipmentDto);
    return this.equipmentRepository.save(equipo);
  }
}
