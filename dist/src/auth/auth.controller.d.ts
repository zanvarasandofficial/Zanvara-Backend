import type { Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { RequestOtpDto, VerifyOtpDto } from './dto/otp.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import type { GoogleProfilePayload } from './strategies/google.strategy';
import type { AuthenticatedUser } from './types/authenticated-user.type';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(dto: RegisterDto): Promise<{
        accessToken: string;
        user: {
            id: string;
            email: string;
            name: string | null;
            role: import("../common/constants/role.constant").Role;
            authProvider: string;
            emailVerified: boolean;
        };
    }>;
    login(dto: LoginDto): Promise<{
        accessToken: string;
        user: {
            id: string;
            email: string;
            name: string | null;
            role: import("../common/constants/role.constant").Role;
            authProvider: string;
            emailVerified: boolean;
        };
    }>;
    requestEmailOtp(dto: RequestOtpDto): Promise<{
        ok: boolean;
        message: string;
        devMode: boolean;
    }>;
    verifyEmailOtp(dto: VerifyOtpDto): Promise<{
        accessToken: string;
        user: {
            id: string;
            email: string;
            name: string | null;
            role: import("../common/constants/role.constant").Role;
            authProvider: string;
            emailVerified: boolean;
        };
    }>;
    googleAuth(): void;
    googleCallback(req: {
        user: GoogleProfilePayload;
        query?: {
            state?: string;
        };
    }, res: Response): Promise<void>;
    me(user: AuthenticatedUser): Promise<{
        id: string;
        email: string;
        name: string | null;
        role: import("../common/constants/role.constant").Role;
        authProvider: string;
        emailVerified: boolean;
        createdAt: Date;
    }>;
    updateProfile(user: AuthenticatedUser, dto: UpdateProfileDto): Promise<{
        id: string;
        email: string;
        name: string | null;
        role: import("../common/constants/role.constant").Role;
        authProvider: string;
        emailVerified: boolean;
        createdAt: Date;
    }>;
}
