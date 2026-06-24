import { UsersService } from '../users/users.service';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
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
    updateRole(id: string, dto: UpdateUserRoleDto): import(".prisma/client").Prisma.Prisma__UserClient<{
        id: string;
        email: string;
        name: string | null;
        role: string;
        authProvider: string;
        emailVerified: boolean;
        createdAt: Date;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
}
