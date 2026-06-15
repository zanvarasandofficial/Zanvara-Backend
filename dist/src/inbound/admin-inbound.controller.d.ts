import { UpdateInboundStatusDto } from './dto/update-inbound-status.dto';
import { InboundService } from './inbound.service';
export declare class AdminInboundController {
    private readonly inboundService;
    constructor(inboundService: InboundService);
    findAll(type?: string): Promise<{
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
    updateStatus(id: string, dto: UpdateInboundStatusDto): Promise<{
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
