import { ConfigService } from '@nestjs/config';

function parseUrlList(value: string | undefined): string[] {
  return (value ?? '')
    .split(',')
    .map((item) => item.trim().replace(/\/$/, ''))
    .filter(Boolean);
}

function toAbsoluteBase(url: string): string {
  const trimmed = url.trim().replace(/\/$/, '').replace(/\/api$/, '');

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }

  return `https://${trimmed}`;
}

function buildGoogleCallbackUrl(base: string): string {
  return `${toAbsoluteBase(base)}/api/auth/google/callback`;
}

function isPreviewVercelHost(hostname: string): boolean {
  // e.g. zanvara-backend-q61waoe97-zanvara-s-projects.vercel.app
  return /-[a-z0-9]+-[^.]+\.vercel\.app$/i.test(hostname);
}

export function resolveGoogleCallbackUrl(configService: ConfigService): string {
  const explicit = configService.get<string>('GOOGLE_CALLBACK_URL')?.trim();

  if (explicit && !explicit.includes('localhost')) {
    return explicit;
  }

  const stableBackend =
    configService.get<string>('BACKEND_URL')?.trim() ||
    configService.get<string>('VERCEL_PROJECT_PRODUCTION_URL')?.trim();

  if (stableBackend) {
    return buildGoogleCallbackUrl(stableBackend);
  }

  const vercelUrl = configService.get<string>('VERCEL_URL')?.trim();
  if (vercelUrl && !isPreviewVercelHost(vercelUrl)) {
    return buildGoogleCallbackUrl(vercelUrl);
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
