import { CreateContactDto } from './dto/create-contact.dto';
import { CreateNewsletterDto } from './dto/create-newsletter.dto';
import { InboundService } from './inbound.service';
export declare class InboundController {
    private readonly inboundService;
    constructor(inboundService: InboundService);
    createContact(dto: CreateContactDto): Promise<{
        message: string;
        submission: {
            id: string;
            type: string;
            firstName: string | null;
            lastName: string | null;
            email: string;
            phone: string | null;
            message: string | null;
            status: string;
            createdAt: Date;
            updatedAt: Date;
        };
    }>;
    subscribeNewsletter(dto: CreateNewsletterDto): Promise<{
        message: string;
        alreadySubscribed: boolean;
        submission: {
            id: string;
            type: string;
            firstName: string | null;
            lastName: string | null;
            email: string;
            phone: string | null;
            message: string | null;
            status: string;
            createdAt: Date;
            updatedAt: Date;
        };
    }>;
}
