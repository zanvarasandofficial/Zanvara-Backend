import type { Role } from '../../common/constants/role.constant';
export type AuthenticatedUser = {
    id: string;
    email: string;
    role: Role;
};
