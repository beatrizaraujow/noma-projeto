import { Injectable } from '@nestjs/common';
import { PrismaService } from './modules/database/prisma.service';

@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaService) {}

  async getHealthCheck(): Promise<{
    message: string;
    timestamp: string;
    status: string;
    database: 'up' | 'down';
  }> {
    const base = {
      message: 'NexORA API is running',
      timestamp: new Date().toISOString(),
    };

    try {
      await this.prisma.$queryRaw`SELECT 1`;

      return {
        ...base,
        status: 'healthy',
        database: 'up',
      };
    } catch {
      return {
        ...base,
        status: 'degraded',
        database: 'down',
      };
    }
  }
}
