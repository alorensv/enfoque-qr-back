import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthGuard } from '@nestjs/passport';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // Endpoint GET protegido con JWT
  @UseGuards(AuthGuard('jwt'))
  @Get('hello')
  getHello(@Query('name') name: string, @Request() req): string {
    return this.appService.getHello(name || req.user?.email);
  }
}
