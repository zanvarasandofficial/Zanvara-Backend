import { ConfigService } from '@nestjs/config';

function parseUrlList(value: string | undefined): string[] {
  return (value ?? '')
    .split(',')
    .map((item) => item.trim().replace(/\/$/, ''))
    .filter(Boolean);
}

export function resolveGoogleCallbackUrl(configService: ConfigService): string {
  const explicit = configService.get<string>('GOOGLE_CALLBACK_URL')?.trim();

  if (explicit && !explicit.includes('localhost')) {
    return explicit;
  }

  const vercelUrl = configService.get<string>('VERCEL_URL')?.trim();
  if (vercelUrl) {
    return `https://${vercelUrl}/api/auth/google/callback`;
  }

  if (explicit) {
    return explicit;
  }

  const port = configService.get<string>('PORT') ?? '4000';
  return `http://localhost:${port}/api/auth/google/callback`;
}

export function resolveFrontendUrl(configService: ConfigService): string {
  const origins = parseUrlList(
    configService.get<string>('FRONTEND_URL') ?? 'http://localhost:3000',
  );

  const liveOrigin = origins.find(
    (origin) =>
      origin.startsWith('https://') && !origin.includes('localhost'),
  );

  if (liveOrigin) {
    return liveOrigin;
  }

  return origins[0] ?? 'http://localhost:3000';
}
