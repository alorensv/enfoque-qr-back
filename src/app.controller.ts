import { Controller, Get, Query } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // Endpoint GET que recibe un parámetro 'name'
  @Get('hello')
  getHello(@Query('name') name: string): string {
    return this.appService.getHello(name);
  }
}
