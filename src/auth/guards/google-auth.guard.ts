import {
  BadRequestException,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';
import { resolveGoogleCallbackFromRequest } from '../google-callback-url.util';
import { GoogleStrategy } from '../strategies/google.strategy';

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  constructor(
    private readonly googleStrategy: GoogleStrategy,
    private readonly configService: ConfigService,
  ) {
    super();
  }

  canActivate(context: ExecutionContext) {
    if (!this.googleStrategy.configured) {
      throw new BadRequestException(
        'Google sign in is not configured yet. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to backend .env.',
      );
    }

    return super.canActivate(context);
  }

  getAuthenticateOptions(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>();
    const redirect =
      typeof request.query?.redirect === 'string'
        ? request.query.redirect
        : '/checkout';

    return {
      scope: ['email', 'profile'],
      state: Buffer.from(redirect, 'utf8').toString('base64url'),
      callbackURL: resolveGoogleCallbackFromRequest(request, this.configService),
    };
  }
}
