import { Role } from '../common/constants/role.constant';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';
export declare class AdminController {
    getDashboard(user: AuthenticatedUser): {
        message: string;
        admin: {
            id: string;
            email: string;
            role: Role;
        };
        note: string;
    };
}
