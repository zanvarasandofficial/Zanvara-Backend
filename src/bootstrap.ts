import { INestApplication, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import { AppModule } from './app.module';

let cachedServer: express.Express | undefined;

function parseOriginList(value: string | undefined): string[] {
  return (value ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function isAllowedCorsOrigin(origin: string): boolean {
  const allowedOrigins = [
    ...parseOriginList(process.env.FRONTEND_URL ?? 'http://localhost:3000'),
    ...parseOriginList(process.env.ALLOWED_ORIGINS),
  ];

  if (allowedOrigins.includes(origin)) {
    return true;
  }

  try {
    const hostname = new URL(origin).hostname.toLowerCase();

    if (hostname.endsWith('.vercel.app')) {
      return true;
    }

    if (hostname === 'zanvara.com' || hostname.endsWith('.zanvara.com')) {
      return true;
    }
  } catch {
    return false;
  }

  return false;
}

export async function configureNestApp(app: INestApplication) {
  app.setGlobalPrefix('api');

  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      if (!origin || isAllowedCorsOrigin(origin)) {
        callback(null, true);
        return;
      }

      callback(null, false);
    },
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
}

export async function createApp(): Promise<express.Express> {
  if (cachedServer) {
    return cachedServer;
  }

  const expressApp = express();
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressApp),
  );

  await configureNestApp(app);
  await app.init();
  cachedServer = expressApp;

  return cachedServer;
}

export async function createLocalServer() {
  const app = await NestFactory.create(AppModule);
  await configureNestApp(app);
  return app;
}
