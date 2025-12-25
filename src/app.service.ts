import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(name?: string): string {
    return `Hola${name ? ', ' + name : ''}! Bienvenido a Enfoque QR.`;
  }
}
