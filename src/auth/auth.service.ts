import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Role } from '../common/constants/role.constant';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { RequestOtpDto, VerifyOtpDto } from './dto/otp.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { GoogleProfilePayload } from './strategies/google.strategy';
import { AuthenticatedUser } from './types/authenticated-user.type';
import { resolveFrontendUrl } from '../config/app-urls';

const OTP_EXPIRY_MINUTES = 10;
const OTP_RESEND_SECONDS = 60;

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const existingUser = await this.usersService.findByEmail(dto.email);

    if (existingUser) {
      throw new ConflictException('Email is already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = await this.usersService.create({
      email: dto.email.toLowerCase(),
      name: dto.name,
      passwordHash,
      role: Role.USER,
      authProvider: 'EMAIL',
      emailVerified: true,
    });

    return this.buildAuthResponse(user);
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isValidPassword = await bcrypt.compare(dto.password, user.passwordHash);

    if (!isValidPassword) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return this.buildAuthResponse(user);
  }

  async requestEmailOtp(dto: RequestOtpDto) {
    const email = dto.email.toLowerCase();

    if (dto.forSignup) {
      const existingUser = await this.usersService.findByEmail(email);

      if (existingUser) {
        throw new ConflictException('Email is already registered. Please login instead.');
      }
    }

    const latestOtp = await this.prisma.emailOtp.findFirst({
      where: { email },
      orderBy: { createdAt: 'desc' },
    });

    if (latestOtp) {
      const secondsSinceLastSend =
        (Date.now() - latestOtp.createdAt.getTime()) / 1000;

      if (secondsSinceLastSend < OTP_RESEND_SECONDS) {
        throw new BadRequestException(
          `Please wait ${Math.ceil(OTP_RESEND_SECONDS - secondsSinceLastSend)} seconds before requesting another code.`,
        );
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

  async verifyEmailOtp(dto: VerifyOtpDto) {
    const email = dto.email.toLowerCase();
    const otp = await this.prisma.emailOtp.findFirst({
      where: {
        email,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!otp || otp.code !== dto.code) {
      throw new UnauthorizedException('Invalid or expired verification code.');
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
        role: Role.USER,
        authProvider: 'EMAIL',
        emailVerified: true,
      });
    } else if (dto.password) {
      if (user.passwordHash) {
        throw new ConflictException('Email is already registered. Please login instead.');
      }

      user = await this.usersService.update(user.id, {
        name: dto.name ?? user.name,
        passwordHash: await bcrypt.hash(dto.password, 12),
        authProvider: 'EMAIL',
        emailVerified: true,
      });
    } else if (dto.name && !user.name) {
      user = await this.usersService.update(user.id, { name: dto.name });
    } else if (!user.emailVerified) {
      user = await this.usersService.update(user.id, { emailVerified: true });
    }

    return this.buildAuthResponse(user);
  }

  async loginWithGoogle(profile: GoogleProfilePayload) {
    let user =
      (await this.usersService.findByGoogleId(profile.googleId)) ??
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
    } else {
      user = await this.usersService.create({
        email: profile.email,
        name: profile.name,
        googleId: profile.googleId,
        role: Role.USER,
        authProvider: 'GOOGLE',
        emailVerified: true,
      });
    }

    return this.buildAuthResponse(user);
  }

  buildFrontendCallbackUrl(accessToken: string, redirectPath: string) {
    const frontendUrl = resolveFrontendUrl(this.configService);
    const params = new URLSearchParams({
      token: accessToken,
      redirect: redirectPath,
    });

    return `${frontendUrl}/auth/callback?${params.toString()}`;
  }

  decodeRedirectState(state?: string) {
    if (!state) {
      return '/checkout';
    }

    try {
      return Buffer.from(state, 'base64url').toString('utf8') || '/checkout';
    } catch {
      return '/checkout';
    }
  }

  async getProfile(userId: string) {
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return this.usersService.toPublicUser(user);
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (user.role === Role.ADMIN) {
      throw new UnauthorizedException('Use admin login to manage admin profile.');
    }

    const updatedUser = await this.usersService.update(userId, {
      name: dto.name.trim(),
    });

    return this.usersService.toPublicUser(updatedUser);
  }

  private generateOtpCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private buildAuthResponse(user: {
    id: string;
    email: string;
    name: string | null;
    role: string;
    authProvider?: string;
    emailVerified?: boolean;
  }) {
    const role = user.role as Role;

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
}
