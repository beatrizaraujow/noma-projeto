import { Module, Global, DynamicModule } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Global()
@Module({})
export class DatabaseModule {
  static forRoot(): DynamicModule {
    const configService = new ConfigService();
    const mongodbUri = configService.get<string>('MONGODB_URI');
    
    // Só importa o MongoDB se a URI estiver configurada
    const imports = [];
    const exports: any[] = [PrismaService];
    
    if (mongodbUri) {
      imports.push(
        MongooseModule.forRootAsync({
          imports: [ConfigModule],
          useFactory: async (configService: ConfigService) => ({
            uri: configService.get<string>('MONGODB_URI'),
            connectionFactory: (connection) => {
              console.log('✅ MongoDB connected successfully');
              return connection;
            },
          }),
          inject: [ConfigService],
        })
      );
      exports.push(MongooseModule);
    } else {
      console.warn('⚠️  MongoDB URI not configured - MongoDB features disabled');
    }

    return {
      module: DatabaseModule,
      imports,
      providers: [PrismaService],
      exports,
    };
  }
}
