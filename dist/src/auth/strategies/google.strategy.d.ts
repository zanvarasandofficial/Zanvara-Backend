import { ConfigService } from '@nestjs/config';
import { Profile, Strategy, VerifyCallback } from 'passport-google-oauth20';
export type GoogleProfilePayload = {
    email: string;
    googleId: string;
    name: string | null;
};
declare const GoogleStrategy_base: new (...args: [options: import("passport-google-oauth20").StrategyOptionsWithRequest] | [options: import("passport-google-oauth20").StrategyOptions] | [options: import("passport-google-oauth20").StrategyOptions] | [options: import("passport-google-oauth20").StrategyOptionsWithRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class GoogleStrategy extends GoogleStrategy_base {
    private readonly isConfigured;
    constructor(configService: ConfigService);
    get configured(): boolean;
    validate(req: {
        query?: {
            state?: string;
        };
    }, _accessToken: string, _refreshToken: string, profile: Profile, done: VerifyCallback): void;
}
export {};
