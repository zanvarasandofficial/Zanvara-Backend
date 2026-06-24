import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StorefrontStatsService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats() {
    const [productCount, customerCount] = await Promise.all([
      this.prisma.product.count({ where: { status: 'PUBLISHED' } }),
      this.prisma.user.count({ where: { role: 'USER' } }),
    ]);

    return {
      productCount,
      customerCount,
    };
  }
}
