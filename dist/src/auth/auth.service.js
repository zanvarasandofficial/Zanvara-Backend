"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = __importStar(require("bcrypt"));
const role_constant_1 = require("../common/constants/role.constant");
const mail_service_1 = require("../mail/mail.service");
const prisma_service_1 = require("../prisma/prisma.service");
const users_service_1 = require("../users/users.service");
const OTP_EXPIRY_MINUTES = 10;
const OTP_RESEND_SECONDS = 60;
let AuthService = class AuthService {
    usersService;
    jwtService;
    prisma;
    mailService;
    configService;
    constructor(usersService, jwtService, prisma, mailService, configService) {
        this.usersService = usersService;
        this.jwtService = jwtService;
        this.prisma = prisma;
        this.mailService = mailService;
        this.configService = configService;
    }
    async register(dto) {
        const existingUser = await this.usersService.findByEmail(dto.email);
        if (existingUser) {
            throw new common_1.ConflictException('Email is already registered');
        }
        const passwordHash = await bcrypt.hash(dto.password, 12);
        const user = await this.usersService.create({
            email: dto.email.toLowerCase(),
            name: dto.name,
            passwordHash,
            role: role_constant_1.Role.USER,
            authProvider: 'EMAIL',
            emailVerified: true,
        });
        return this.buildAuthResponse(user);
    }
    async login(dto) {
        const user = await this.usersService.findByEmail(dto.email);
        if (!user || !user.passwordHash) {
            throw new common_1.UnauthorizedException('Invalid email or password');
        }
        const isValidPassword = await bcrypt.compare(dto.password, user.passwordHash);
        if (!isValidPassword) {
            throw new common_1.UnauthorizedException('Invalid email or password');
        }
        return this.buildAuthResponse(user);
    }
    async requestEmailOtp(dto) {
        const email = dto.email.toLowerCase();
        if (dto.forSignup) {
            const existingUser = await this.usersService.findByEmail(email);
            if (existingUser) {
                throw new common_1.ConflictException('Email is already registered. Please login instead.');
            }
        }
        const latestOtp = await this.prisma.emailOtp.findFirst({
            where: { email },
            orderBy: { createdAt: 'desc' },
        });
        if (latestOtp) {
            const secondsSinceLastSend = (Date.now() - latestOtp.createdAt.getTime()) / 1000;
            if (secondsSinceLastSend < OTP_RESEND_SECONDS) {
                throw new common_1.BadRequestException(`Please wait ${Math.ceil(OTP_RESEND_SECONDS - secondsSinceLastSend)} seconds before requesting another code.`);
            }
        }
        const code = this.generateOtpCode();
        const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
        await this.prisma.emailOtp.create({
            data: {
                email,
                code,
                expiresAt,
            },
        });
        await this.mailService.sendOtpEmail(email, code);
        return {
            ok: true,
            message: 'Verification code sent to your email.',
        };
    }
    async verifyEmailOtp(dto) {
        const email = dto.email.toLowerCase();
        const otp = await this.prisma.emailOtp.findFirst({
            where: {
                email,
                expiresAt: { gt: new Date() },
            },
            orderBy: { createdAt: 'desc' },
        });
        if (!otp || otp.code !== dto.code) {
            throw new common_1.UnauthorizedException('Invalid or expired verification code.');
        }
        await this.prisma.emailOtp.deleteMany({ where: { email } });
        let user = await this.usersService.findByEmail(email);
        if (!user) {
            const passwordHash = dto.password
                ? await bcrypt.hash(dto.password, 12)
                : undefined;
            user = await this.usersService.create({
                email,
                name: dto.name ?? null,
                passwordHash,
                role: role_constant_1.Role.USER,
                authProvider: 'EMAIL',
                emailVerified: true,
            });
        }
        else if (dto.password) {
            if (user.passwordHash) {
                throw new common_1.ConflictException('Email is already registered. Please login instead.');
            }
            user = await this.usersService.update(user.id, {
                name: dto.name ?? user.name,
                passwordHash: await bcrypt.hash(dto.password, 12),
                authProvider: 'EMAIL',
                emailVerified: true,
            });
        }
        else if (dto.name && !user.name) {
            user = await this.usersService.update(user.id, { name: dto.name });
        }
        else if (!user.emailVerified) {
            user = await this.usersService.update(user.id, { emailVerified: true });
        }
        return this.buildAuthResponse(user);
    }
    async loginWithGoogle(profile) {
        let user = (await this.usersService.findByGoogleId(profile.googleId)) ??
            (await this.usersService.findByEmail(profile.email));
        if (user) {
            if (!user.googleId) {
                user = await this.usersService.update(user.id, {
                    googleId: profile.googleId,
                    authProvider: 'GOOGLE',
                    emailVerified: true,
                    name: user.name ?? profile.name,
                });
            }
        }
        else {
            user = await this.usersService.create({
                email: profile.email,
                name: profile.name,
                googleId: profile.googleId,
                role: role_constant_1.Role.USER,
                authProvider: 'GOOGLE',
                emailVerified: true,
            });
        }
        return this.buildAuthResponse(user);
    }
    buildFrontendCallbackUrl(accessToken, redirectPath) {
        const frontendUrl = this.configService.get('FRONTEND_URL', 'http://localhost:3000');
        const params = new URLSearchParams({
            token: accessToken,
            redirect: redirectPath,
        });
        return `${frontendUrl}/auth/callback?${params.toString()}`;
    }
    decodeRedirectState(state) {
        if (!state) {
            return '/checkout';
        }
        try {
            return Buffer.from(state, 'base64url').toString('utf8') || '/checkout';
        }
        catch {
            return '/checkout';
        }
    }
    async getProfile(userId) {
        const user = await this.usersService.findById(userId);
        if (!user) {
            throw new common_1.UnauthorizedException('User not found');
        }
        return this.usersService.toPublicUser(user);
    }
    async updateProfile(userId, dto) {
        const user = await this.usersService.findById(userId);
        if (!user) {
            throw new common_1.UnauthorizedException('User not found');
        }
        if (user.role === role_constant_1.Role.ADMIN) {
            throw new common_1.UnauthorizedException('Use admin login to manage admin profile.');
        }
        const updatedUser = await this.usersService.update(userId, {
            name: dto.name.trim(),
        });
        return this.usersService.toPublicUser(updatedUser);
    }
    generateOtpCode() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }
    buildAuthResponse(user) {
        const role = user.role;
        return {
            accessToken: this.jwtService.sign({
                sub: user.id,
                email: user.email,
                role,
            }),
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role,
                authProvider: user.authProvider ?? 'EMAIL',
                emailVerified: user.emailVerified ?? false,
            },
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        jwt_1.JwtService,
        prisma_service_1.PrismaService,
        mail_service_1.MailService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map