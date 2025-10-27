import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { setDefaultLanguage } from './common';
import { LoggingInterceptor } from './common/interceptors';
import * as express from 'express'
import path from 'node:path';
async function bootstrap() {
  const port = process.env.PORT ?? 3000;
  const app = await NestFactory.create(AppModule);
  app.use('/uploads',express.static(path.resolve('./uploads')))
  app.use(setDefaultLanguage)
  app.useGlobalInterceptors(new LoggingInterceptor())
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted:true
    })
  ) 
    app.enableCors({
    origin: 'http://localhost:4200', 
    credentials: true,               
  });
  await app.listen(port, () => {
    console.log(`Server is running on port ::: ${port} 🚀`);
  });
}
bootstrap();
