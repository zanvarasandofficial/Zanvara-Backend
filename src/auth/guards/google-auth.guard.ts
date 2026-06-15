import {
  BadRequestException,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GoogleStrategy } from '../strategies/google.strategy';

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  constructor(private readonly googleStrategy: GoogleStrategy) {
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
    const request = context.switchToHttp().getRequest<{ query?: { redirect?: string } }>();
    const redirect = request.query?.redirect ?? '/checkout';

    return {
      scope: ['email', 'profile'],
      state: Buffer.from(redirect, 'utf8').toString('base64url'),
    };
  }
}
