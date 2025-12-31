
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../models/user.entity';
import { UserInstitution } from '../models/user_institution.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(UserInstitution)
    private readonly userInstitutionRepo: Repository<UserInstitution>,
  ) {}


  async validateUser(email: string, password: string) {
    const user = await this.userRepo.findOne({ where: { email, status: 1 } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    // Buscar la relación user_institution activa
    const userInstitution = await this.userInstitutionRepo.findOne({
      where: { userId: user.id, deletedAt: null },
    });
    if (!userInstitution || !userInstitution.institutionId) {
      throw new UnauthorizedException('El usuario no pertenece a ninguna institución');
    }
    return {
      id: user.id,
      email: user.email,
      institutionId: userInstitution.institutionId,
      role: userInstitution.role,
    };
  }

  async login(email: string, password: string) {
    const user = await this.validateUser(email, password);
    const payload = {
      sub: user.id,
      email: user.email,
      institutionId: user.institutionId,
      role: user.role,
    };
    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }
}
