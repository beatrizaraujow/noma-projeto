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
      console.log('✅ Connected to PostgreSQL database');
    } catch (error) {
      console.warn('⚠️  PostgreSQL not available - Database features disabled');
      console.warn('   Install Docker and run: pnpm docker:up');
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
