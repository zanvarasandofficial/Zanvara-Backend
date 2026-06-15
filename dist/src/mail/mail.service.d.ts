import { ConfigService } from '@nestjs/config';
export declare class MailService {
    private readonly configService;
    private readonly logger;
    private transporter;
    private readonly fromAddress;
    constructor(configService: ConfigService);
    get isConfigured(): boolean;
    sendOtpEmail(email: string, code: string): Promise<void>;
}
