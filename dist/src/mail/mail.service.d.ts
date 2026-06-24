import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
export declare class MailService implements OnModuleInit {
    private readonly configService;
    private readonly logger;
    private transporter;
    private fromAddress;
    constructor(configService: ConfigService);
    onModuleInit(): void;
    get isConfigured(): boolean;
    sendOtpEmail(email: string, code: string): Promise<void>;
}
