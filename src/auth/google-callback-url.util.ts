import type { Request } from 'express';
import type { ConfigService } from '@nestjs/config';
import { resolveGoogleCallbackUrl } from '../config/app-urls';

export function resolveGoogleCallbackFromRequest(
  req: Request,
  configService: ConfigService,
): string {
  const override = configService.get<string>('OAUTH_CALLBACK_ORIGIN')?.trim();
  if (override) {
    return `${override.replace(/\/$/, '').replace(/\/api$/, '')}/api/auth/google/callback`;
  }

  const host = req.get('host')?.trim();
  if (host && /^(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/i.test(host)) {
    const protocol = req.protocol === 'https' ? 'https' : 'http';
    return `${protocol}://${host}/api/auth/google/callback`;
  }

  return resolveGoogleCallbackUrl(configService);
}
