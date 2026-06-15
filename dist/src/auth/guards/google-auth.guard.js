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
exports.GoogleAuthGuard = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const google_strategy_1 = require("../strategies/google.strategy");
let GoogleAuthGuard = class GoogleAuthGuard extends (0, passport_1.AuthGuard)('google') {
    googleStrategy;
    constructor(googleStrategy) {
        super();
        this.googleStrategy = googleStrategy;
    }
    canActivate(context) {
        if (!this.googleStrategy.configured) {
            throw new common_1.BadRequestException('Google sign in is not configured yet. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to backend .env.');
        }
        return super.canActivate(context);
    }
    getAuthenticateOptions(context) {
        const request = context.switchToHttp().getRequest();
        const redirect = request.query?.redirect ?? '/checkout';
        return {
            scope: ['email', 'profile'],
            state: Buffer.from(redirect, 'utf8').toString('base64url'),
        };
    }
};
exports.GoogleAuthGuard = GoogleAuthGuard;
exports.GoogleAuthGuard = GoogleAuthGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [google_strategy_1.GoogleStrategy])
], GoogleAuthGuard);
//# sourceMappingURL=google-auth.guard.js.map