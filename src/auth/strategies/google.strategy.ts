import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy, VerifyCallback } from 'passport-google-oauth20';

export type GoogleProfilePayload = {
  email: string;
  googleId: string;
  name: string | null;
};

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  private readonly isConfigured: boolean;

  constructor(configService: ConfigService) {
    const clientID = configService.get<string>('GOOGLE_CLIENT_ID') ?? '';
    const clientSecret = configService.get<string>('GOOGLE_CLIENT_SECRET') ?? '';
    const callbackURL =
      configService.get<string>('GOOGLE_CALLBACK_URL') ??
      'http://localhost:4000/api/auth/google/callback';

    super({
      clientID: clientID || 'google-not-configured',
      clientSecret: clientSecret || 'google-not-configured',
      callbackURL,
      scope: ['email', 'profile'],
      passReqToCallback: true,
    });

    this.isConfigured = Boolean(clientID && clientSecret);
  }

  get configured() {
    return this.isConfigured;
  }

  validate(
    req: { query?: { state?: string } },
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ) {
    const email = profile.emails?.[0]?.value;

    if (!email) {
      done(new Error('Google account has no email address.'), undefined);
      return;
    }

    const payload: GoogleProfilePayload = {
      email: email.toLowerCase(),
      googleId: profile.id,
      name: profile.displayName ?? null,
    };

    done(null, payload);
  }
}
