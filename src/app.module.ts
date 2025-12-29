import * as dotenv from 'dotenv';
dotenv.config();
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { User } from './models/user.entity';
import { Equipment } from './models/equipment.entity';
import { EquipmentController } from './equipment/equipment.controller';
import { EquipmentService } from './equipment/equipment.service';
import { Institution } from './models/institution.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || 'db',
      port: parseInt(process.env.DB_PORT, 10) || 3306,
      username: process.env.DB_USER || 'enfoque',
      password: process.env.DB_PASS || 'enfoquepass',
      database: process.env.DB_NAME || 'enfoqueqr',
      entities: [User, Equipment, Institution],
      synchronize: false,
      logging: true,
    }),
    TypeOrmModule.forFeature([Equipment, Institution]),
    AuthModule,
  ],
  controllers: [AppController, EquipmentController],
  providers: [AppService, EquipmentService],
})
export class AppModule {}
