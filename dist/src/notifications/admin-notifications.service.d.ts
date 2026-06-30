import { PrismaService } from '../prisma/prisma.service';
export declare class AdminNotificationsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private mapNotification;
    findAllAdmin(limit?: number): Promise<{
        id: string;
        type: string;
        title: string;
        body: string;
        href: string | null;
        entityId: string | null;
        status: string;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    updateStatus(id: string, status: 'NEW' | 'READ'): Promise<{
        id: string;
        type: string;
        title: string;
        body: string;
        href: string | null;
        entityId: string | null;
        status: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    createOrderNotification(order: {
        id: string;
        total: number;
        customer: {
            fullName: string;
            email: string;
        };
    }): Promise<{
        id: string;
        type: string;
        title: string;
        body: string;
        href: string | null;
        entityId: string | null;
        status: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    createLoginNotification(user: {
        id: string;
        email: string;
        name: string | null;
        role: string;
    }, event: 'signup' | 'login', provider: string): Promise<{
        id: string;
        type: string;
        title: string;
        body: string;
        href: string | null;
        entityId: string | null;
        status: string;
        createdAt: Date;
        updatedAt: Date;
    } | null>;
}
