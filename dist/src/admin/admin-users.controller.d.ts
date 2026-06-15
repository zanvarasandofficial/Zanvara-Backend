import { UsersService } from '../users/users.service';
export declare class AdminUsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    listUsers(): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        email: string;
        name: string | null;
        authProvider: string;
        emailVerified: boolean;
        createdAt: Date;
    }[]>;
}
