import { ExecutionContext } from '@nestjs/common';
import { GoogleStrategy } from '../strategies/google.strategy';
declare const GoogleAuthGuard_base: import("@nestjs/passport").Type<import("@nestjs/passport").IAuthGuard>;
export declare class GoogleAuthGuard extends GoogleAuthGuard_base {
    private readonly googleStrategy;
    constructor(googleStrategy: GoogleStrategy);
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | import("rxjs").Observable<boolean>;
    getAuthenticateOptions(context: ExecutionContext): {
        scope: string[];
        state: string;
    };
}
export {};
