import { ExecutionContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleStrategy } from '../strategies/google.strategy';
declare const GoogleAuthGuard_base: import("@nestjs/passport").Type<import("@nestjs/passport").IAuthGuard>;
export declare class GoogleAuthGuard extends GoogleAuthGuard_base {
    private readonly googleStrategy;
    private readonly configService;
    constructor(googleStrategy: GoogleStrategy, configService: ConfigService);
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | import("rxjs").Observable<boolean>;
    getAuthenticateOptions(context: ExecutionContext): {
        scope: string[];
        state: string;
        callbackURL: string;
    };
}
export {};
