import { ExecutionContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
declare const GoogleCallbackGuard_base: import("@nestjs/passport").Type<import("@nestjs/passport").IAuthGuard>;
export declare class GoogleCallbackGuard extends GoogleCallbackGuard_base {
    private readonly configService;
    constructor(configService: ConfigService);
    getAuthenticateOptions(context: ExecutionContext): {
        callbackURL: string;
    };
}
export {};
