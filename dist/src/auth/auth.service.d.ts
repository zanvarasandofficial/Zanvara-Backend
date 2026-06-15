import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Role } from '../common/constants/role.constant';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { RequestOtpDto, VerifyOtpDto } from './dto/otp.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { GoogleProfilePayload } from './strategies/google.strategy';
export declare class AuthService {
    private readonly usersService;
    private readonly jwtService;
    private readonly prisma;
    private readonly mailService;
    private readonly configService;
    constructor(usersService: UsersService, jwtService: JwtService, prisma: PrismaService, mailService: MailService, configService: ConfigService);
    register(dto: RegisterDto): Promise<{
        accessToken: string;
        user: {
            id: string;
            email: string;
            name: string | null;
            role: Role;
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
            role: Role;
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
            role: Role;
            authProvider: string;
            emailVerified: boolean;
        };
    }>;
    loginWithGoogle(profile: GoogleProfilePayload): Promise<{
        accessToken: string;
        user: {
            id: string;
            email: string;
            name: string | null;
            role: Role;
            authProvider: string;
            emailVerified: boolean;
        };
    }>;
    buildFrontendCallbackUrl(accessToken: string, redirectPath: string): string;
    decodeRedirectState(state?: string): string;
    getProfile(userId: string): Promise<{
        id: string;
        email: string;
        name: string | null;
        role: Role;
        authProvider: string;
        emailVerified: boolean;
        createdAt: Date;
    }>;
    updateProfile(userId: string, dto: UpdateProfileDto): Promise<{
        id: string;
        email: string;
        name: string | null;
        role: Role;
        authProvider: string;
        emailVerified: boolean;
        createdAt: Date;
    }>;
    private generateOtpCode;
    private buildAuthResponse;
}
