import { PrismaService } from '../prisma/prisma.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { CreateNewsletterDto } from './dto/create-newsletter.dto';
export declare class InboundService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private mapSubmission;
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
    findAllAdmin(type?: string): Promise<{
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
    }[]>;
    updateStatus(id: string, status: 'NEW' | 'READ'): Promise<{
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
    }>;
}
