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
export declare class UsersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(data: CreateUserInput): import(".prisma/client").Prisma.Prisma__UserClient<{
        id: string;
        email: string;
        passwordHash: string | null;
        name: string | null;
        role: string;
        googleId: string | null;
        authProvider: string;
        emailVerified: boolean;
        createdAt: Date;
        updatedAt: Date;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    update(id: string, data: Partial<CreateUserInput>): import(".prisma/client").Prisma.Prisma__UserClient<{
        id: string;
        email: string;
        passwordHash: string | null;
        name: string | null;
        role: string;
        googleId: string | null;
        authProvider: string;
        emailVerified: boolean;
        createdAt: Date;
        updatedAt: Date;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    findByEmail(email: string): import(".prisma/client").Prisma.Prisma__UserClient<{
        id: string;
        email: string;
        passwordHash: string | null;
        name: string | null;
        role: string;
        googleId: string | null;
        authProvider: string;
        emailVerified: boolean;
        createdAt: Date;
        updatedAt: Date;
    } | null, null, import("@prisma/client/runtime/library").DefaultArgs>;
    findByGoogleId(googleId: string): import(".prisma/client").Prisma.Prisma__UserClient<{
        id: string;
        email: string;
        passwordHash: string | null;
        name: string | null;
        role: string;
        googleId: string | null;
        authProvider: string;
        emailVerified: boolean;
        createdAt: Date;
        updatedAt: Date;
    } | null, null, import("@prisma/client/runtime/library").DefaultArgs>;
    findById(id: string): import(".prisma/client").Prisma.Prisma__UserClient<{
        id: string;
        email: string;
        passwordHash: string | null;
        name: string | null;
        role: string;
        googleId: string | null;
        authProvider: string;
        emailVerified: boolean;
        createdAt: Date;
        updatedAt: Date;
    } | null, null, import("@prisma/client/runtime/library").DefaultArgs>;
    listStorefrontUsers(): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        email: string;
        name: string | null;
        authProvider: string;
        emailVerified: boolean;
        createdAt: Date;
    }[]>;
    toPublicUser(user: User): {
        id: string;
        email: string;
        name: string | null;
        role: Role;
        authProvider: string;
        emailVerified: boolean;
        createdAt: Date;
    };
}
export {};
