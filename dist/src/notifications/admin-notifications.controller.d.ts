import { NotificationsService } from './notifications.service';
export declare class AdminNotificationsController {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
    findAll(): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        createdAt: Date;
        type: string;
        title: string;
        message: string;
        linkPath: string | null;
        referenceId: string | null;
        read: boolean;
    }[]>;
    unreadCount(): Promise<{
        count: number;
    }>;
    markAllRead(): import(".prisma/client").Prisma.PrismaPromise<import(".prisma/client").Prisma.BatchPayload>;
    markRead(id: string): import(".prisma/client").Prisma.Prisma__AdminNotificationClient<{
        id: string;
        createdAt: Date;
        type: string;
        title: string;
        message: string;
        linkPath: string | null;
        referenceId: string | null;
        read: boolean;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
}
