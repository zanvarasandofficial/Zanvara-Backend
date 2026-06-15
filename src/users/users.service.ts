import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { Role } from '../common/constants/role.constant';
import { PrismaService } from '../prisma/prisma.service';

type CreateUserInput = {
  email: string;
  passwordHash?: string | null;
  name?: string | null;
  role?: Role;
  googleId?: string | null;
  authProvider?: string;
  emailVerified?: boolean;
};

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateUserInput) {
    return this.prisma.user.create({ data });
  }

  update(id: string, data: Partial<CreateUserInput>) {
    return this.prisma.user.update({ where: { id }, data });
  }

  findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
  }

  findByGoogleId(googleId: string) {
    return this.prisma.user.findUnique({ where: { googleId } });
  }

  findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  listStorefrontUsers() {
    return this.prisma.user.findMany({
      where: { role: Role.USER },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        name: true,
        authProvider: true,
        emailVerified: true,
        createdAt: true,
      },
    });
  }

  toPublicUser(user: User) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as Role,
      authProvider: user.authProvider,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
    };
  }
}
