import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
export declare class MailService implements OnModuleInit {
    private readonly configService;
    private readonly logger;
    private transporter;
    private fromAddress;
    constructor(configService: ConfigService);
    onModuleInit(): void;
    sendOtpEmail(email: string, code: string): Promise<void>;
    get isConfigured(): boolean;
    private formatMoney;
    sendNewOrderNotification(order: {
        id: string;
        items: Array<{
            name: string;
            quantity: number;
            price?: number;
        }>;
        subtotal: number;
        deliveryTotal: number;
        total: number;
        paymentMethod: string;
        customer: {
            fullName: string;
            email: string;
            phone: string;
            address: string;
            city: string;
            notes?: string;
        };
        createdAt: string;
    }): Promise<void>;
}
