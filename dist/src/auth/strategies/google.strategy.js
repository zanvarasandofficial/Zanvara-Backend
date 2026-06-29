"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleStrategy = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const passport_1 = require("@nestjs/passport");
const passport_google_oauth20_1 = require("passport-google-oauth20");
const app_urls_1 = require("../../config/app-urls");
let GoogleStrategy = class GoogleStrategy extends (0, passport_1.PassportStrategy)(passport_google_oauth20_1.Strategy, 'google') {
    isConfigured;
    constructor(configService) {
        const clientID = configService.get('GOOGLE_CLIENT_ID') ?? '';
        const clientSecret = configService.get('GOOGLE_CLIENT_SECRET') ?? '';
        const callbackURL = (0, app_urls_1.resolveGoogleCallbackUrl)(configService);
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
    validate(req, _accessToken, _refreshToken, profile, done) {
        const email = profile.emails?.[0]?.value;
        if (!email) {
            done(new Error('Google account has no email address.'), undefined);
            return;
        }
        const payload = {
            email: email.toLowerCase(),
            googleId: profile.id,
            name: profile.displayName ?? null,
        };
        done(null, payload);
    }
};
exports.GoogleStrategy = GoogleStrategy;
exports.GoogleStrategy = GoogleStrategy = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], GoogleStrategy);
//# sourceMappingURL=google.strategy.js.map