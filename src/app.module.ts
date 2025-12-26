import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { Usuario } from './usuario.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || 'db',
      port: parseInt(process.env.DB_PORT, 10) || 3306,
      username: process.env.DB_USER || 'enfoque',
      password: process.env.DB_PASS || 'enfoquepass',
      database: process.env.DB_NAME || 'enfoqueqr',
      entities: [Usuario],
      synchronize: false,
      logging: true,
    }),
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
