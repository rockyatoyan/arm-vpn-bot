import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.set('trust proxy', true);

  const config = app.get(ConfigService);
  const logger = new Logger('Startup');

  const port = config.getOrThrow<number>('PORT');

  await app.listen(port, () => {
    logger.log(`🚀 Server is running on http://localhost:${port}`);
  });
}
bootstrap();
