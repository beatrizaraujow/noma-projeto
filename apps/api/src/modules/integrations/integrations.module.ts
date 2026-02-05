import { Module } from '@nestjs/common';
import { IntegrationsController } from './integrations.controller';
import { IntegrationsService } from './integrations.service';
import { SlackService } from './services/slack.service';
import { DiscordService } from './services/discord.service';
import { EmailService } from './services/email.service';
import { CalendarService } from './services/calendar.service';
import { GitHubService } from './services/github.service';
import { FigmaService } from './services/figma.service';
import { CloudStorageService } from './services/cloud-storage.service';
import { WebhookService } from './services/webhook.service';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [IntegrationsController],
  providers: [
    IntegrationsService,
    SlackService,
    DiscordService,
    EmailService,
    CalendarService,
    GitHubService,
    FigmaService,
    CloudStorageService,
    WebhookService,
  ],
  exports: [
    IntegrationsService,
    SlackService,
    DiscordService,
    EmailService,
    CalendarService,
    GitHubService,
    FigmaService,
    CloudStorageService,
    WebhookService,
  ],
})
export class IntegrationsModule {}
