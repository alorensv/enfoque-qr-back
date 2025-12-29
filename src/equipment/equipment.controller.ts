import { Controller, Get, Post, Body } from '@nestjs/common';
import { EquipmentService } from './equipment.service';

@Controller('equipments')
export class EquipmentController {
  constructor(private readonly equipmentService: EquipmentService) {}

  @Get()
  findAll() {
    return this.equipmentService.findAll();
  }

  @Post()
  create(@Body() createEquipmentDto: any) {
    return this.equipmentService.create(createEquipmentDto);
  }
}
