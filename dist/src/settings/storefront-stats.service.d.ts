import { PrismaService } from '../prisma/prisma.service';
export declare class StorefrontStatsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getStats(): Promise<{
        productCount: number;
        customerCount: number;
    }>;
}
