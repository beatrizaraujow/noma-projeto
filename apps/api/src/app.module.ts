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
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]),
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
    WebsocketModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
