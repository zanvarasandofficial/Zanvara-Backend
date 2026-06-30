import { AdminNotificationsService } from './admin-notifications.service';
import { UpdateNotificationStatusDto } from './dto/update-notification-status.dto';
export declare class AdminNotificationsController {
    private readonly notificationsService;
    constructor(notificationsService: AdminNotificationsService);
    findAll(limit?: string): Promise<{
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
    updateStatus(id: string, dto: UpdateNotificationStatusDto): Promise<{
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
}
