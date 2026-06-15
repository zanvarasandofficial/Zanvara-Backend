import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
type CreateNotificationInput = {
    type: 'ORDER' | 'CONTACT';
    title: string;
    message: string;
    linkPath?: string;
    referenceId?: string;
    emailSubject: string;
    emailText: string;
    emailHtml: string;
};
export declare class NotificationsService {
    private readonly prisma;
    private readonly mailService;
    constructor(prisma: PrismaService, mailService: MailService);
    notifyAdmin(input: CreateNotificationInput): Promise<{
        id: string;
        createdAt: Date;
        type: string;
        title: string;
        message: string;
        linkPath: string | null;
        referenceId: string | null;
        read: boolean;
    }>;
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
    unreadCount(): import(".prisma/client").Prisma.PrismaPromise<number>;
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
    markAllRead(): import(".prisma/client").Prisma.PrismaPromise<import(".prisma/client").Prisma.BatchPayload>;
}
export {};
