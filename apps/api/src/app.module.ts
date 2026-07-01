import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { WebsocketModule } from './modules/websocket/websocket.module';
import { DatabaseModule } from './modules/database/database.module';
import { WorkspacesModule } from './modules/workspaces/workspaces.module';
import { InvitesModule } from './modules/invites/invites.module';
import { CommentsModule } from './modules/comments/comments.module';
import { ActivitiesModule } from './modules/activities/activities.module';
import { AttachmentsModule } from './modules/attachments/attachments.module';
import { SearchModule } from './modules/search/search.module';
import { SavedFiltersModule } from './modules/saved-filters/saved-filters.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { AIModule } from './modules/ai/ai.module';
import { AutomationModule } from './modules/automation/automation.module';
import { WorkflowModule } from './modules/workflow/workflow.module';
import { IntegrationsModule } from './modules/integrations/integrations.module';
import { RoutinesModule } from './modules/routines/routines.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    // GraphQL desabilitado temporariamente até implementar resolvers
    // GraphQLModule.forRoot<ApolloDriverConfig>({
    //   driver: ApolloDriver,
    //   autoSchemaFile: 'schema.gql',
    //   sortSchema: true,
    //   playground: true,
    //   context: ({ req, res }) => ({ req, res }),
    // }),
    ThrottlerModule.forRoot({
      throttlers: [{ ttl: 60000, limit: 10 }],
      // Atrás do proxy do Railway, req.ip cai num IP de borda que ROTACIONA,
      // fazendo o rate limiting nunca atingir o limite por cliente. Aqui keamos
      // pelo IP publico mais a DIREITA do X-Forwarded-For: e o IP que a borda do
      // Railway anexa (cliente real). Hops internos (privados) ficam a direita e
      // sao ignorados; um XFF forjado pelo cliente fica a ESQUERDA e tambem e
      // ignorado -> resistente a spoofing.
      getTracker: (req) => {
        const raw = req?.headers?.['x-forwarded-for'];
        const chain = (Array.isArray(raw) ? raw.join(',') : raw || '')
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
        const isPrivate = (ip) =>
          /^::1$|^fe80:|^f[cd][0-9a-f]{2}:|^127\.|^10\.|^192\.168\.|^169\.254\.|^172\.(1[6-9]|2\d|3[01])\./i.test(
            ip,
          );
        for (let i = chain.length - 1; i >= 0; i--) {
          if (!isPrivate(chain[i])) return chain[i];
        }
        return req?.ip;
      },
    }),
    DatabaseModule.forRoot(),
    AuthModule,
    UsersModule,
    WorkspacesModule,
    InvitesModule,
    ProjectsModule,
    TasksModule,
    CommentsModule,
    ActivitiesModule,
    AttachmentsModule,
    SearchModule,
    SavedFiltersModule,
    AnalyticsModule,
    AIModule,
    AutomationModule,
    WorkflowModule,
    IntegrationsModule,
    RoutinesModule,
    WebsocketModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
