import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from '../usuario.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.usuarioRepo.findOne({ where: { email, estado: 1 } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Credenciales inválidas');
    }
    return { id: user.id, email: user.email };
  }

  async login(email: string, password: string) {
    const user = await this.validateUser(email, password);
    const payload = { sub: user.id, email: user.email };
    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }
}
