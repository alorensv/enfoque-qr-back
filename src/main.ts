import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { join } from 'path';
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
  });

  // Servir archivos estáticos desde la carpeta 'public'
  // La ruta es relativa al directorio raíz del proyecto en el contenedor (/app)
  app.useStaticAssets(join(process.cwd(), 'public'), {
    prefix: '/public/',
  });

  await app.listen(3001);
}
bootstrap();
