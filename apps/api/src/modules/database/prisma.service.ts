import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor(private configService: ConfigService) {
    super();
  }

  async onModuleInit() {
    try {
      await this.$connect();
      console.log('✅ Connected to database');
    } catch (error) {
      console.warn('⚠️  Database not available - Database features disabled');
      console.warn('   Check DATABASE_URL in apps/api/.env');
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
