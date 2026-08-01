import { ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import { resolveGoogleCallbackFromRequest } from '../google-callback-url.util';

@Injectable()
export class GoogleCallbackGuard extends AuthGuard('google') {
  constructor(private readonly configService: ConfigService) {
    super();
  }

  getAuthenticateOptions(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    return {
      callbackURL: resolveGoogleCallbackFromRequest(request, this.configService),
    };
  }
}
