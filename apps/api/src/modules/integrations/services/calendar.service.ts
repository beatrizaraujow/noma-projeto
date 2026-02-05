import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { getErrorMessage } from './types';

export interface CalendarConfig {
  provider: 'google' | 'outlook';
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  accessToken?: string;
  calendarId?: string; // Specific calendar to sync
}

export interface CalendarEvent {
  id?: string;
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  location?: string;
  attendees?: string[];
  reminders?: any[];
}

@Injectable()
export class CalendarService {
  private readonly logger = new Logger(CalendarService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Test calendar connection
   */
  async testConnection(config: CalendarConfig, provider: string): Promise<any> {
    this.logger.log(`Testing ${provider} calendar connection`);

    try {
      // TODO: Implement actual OAuth validation
      // For now, return mock response
      
      return {
        success: true,
        message: `${provider} calendar connection test successful`,
        provider,
      };
    } catch (error) {
      this.logger.error(`Calendar connection test failed: ${getErrorMessage(error)}`);
      throw new Error(`Failed to connect to ${provider} calendar: ${getErrorMessage(error)}`);
    }
  }

  /**
   * Sync calendar events
   */
  async syncEvents(config: CalendarConfig, provider: string, workspaceId: string): Promise<any> {
    this.logger.log(`Syncing ${provider} calendar events for workspace ${workspaceId}`);

    try {
      let events: any[];

      if (provider === 'google_calendar') {
        events = await this.fetchGoogleCalendarEvents(config);
      } else if (provider === 'outlook_calendar') {
        events = await this.fetchOutlookCalendarEvents(config);
      } else {
        throw new Error('Unsupported calendar provider');
      }

      // Save events to database
      const savedEvents = [];
      for (const event of events) {
        const saved = await this.saveCalendarEvent(event, workspaceId, provider);
        savedEvents.push(saved);
      }

      return {
        success: true,
        count: savedEvents.length,
        events: savedEvents,
      };
    } catch (error) {
      this.logger.error(`Failed to sync calendar events: ${getErrorMessage(error)}`);
      throw error;
    }
  }

  /**
   * Fetch events from Google Calendar
   */
  private async fetchGoogleCalendarEvents(config: CalendarConfig): Promise<any[]> {
    // TODO: Implement actual Google Calendar API integration
    // This requires the googleapis package
    
    this.logger.log('Fetching Google Calendar events...');
    
    try {
      // Mock implementation
      // In production:
      // 1. Use OAuth2 client with refresh token
      // 2. Call calendar.events.list()
      // 3. Parse and return events
      
      return [
        {
          id: 'google_event_1',
          title: 'Team Meeting',
          description: 'Weekly team sync',
          startDate: new Date(),
          endDate: new Date(Date.now() + 3600000),
          location: 'Conference Room A',
        },
      ];
    } catch (error) {
      this.logger.error(`Failed to fetch Google Calendar events: ${getErrorMessage(error)}`);
      throw error;
    }
  }

  /**
   * Fetch events from Outlook Calendar
   */
  private async fetchOutlookCalendarEvents(config: CalendarConfig): Promise<any[]> {
    // TODO: Implement actual Microsoft Graph API integration
    
    this.logger.log('Fetching Outlook Calendar events...');
    
    try {
      // Mock implementation
      // In production:
      // 1. Use Microsoft Graph Client
      // 2. Call /me/calendar/events
      // 3. Parse and return events
      
      return [
        {
          id: 'outlook_event_1',
          title: 'Project Review',
          description: 'Review project progress',
          startDate: new Date(),
          endDate: new Date(Date.now() + 3600000),
          location: 'Virtual',
        },
      ];
    } catch (error) {
      this.logger.error(`Failed to fetch Outlook Calendar events: ${getErrorMessage(error)}`);
      throw error;
    }
  }

  /**
   * Save calendar event to database
   */
  private async saveCalendarEvent(event: any, workspaceId: string, provider: string): Promise<any> {
    try {
      // Check if event already exists
      const existing = await (this.prisma as any).calendarEvent.findUnique({
        where: {
          provider_externalId: {
            provider,
            externalId: event.id,
          },
        },
      });

      if (existing) {
        // Update existing event
        return (this.prisma as any).calendarEvent.update({
          where: { id: existing.id },
          data: {
            title: event.title,
            description: event.description,
            startDate: event.startDate,
            endDate: event.endDate,
            location: event.location,
            synced: true,
            syncedAt: new Date(),
          },
        });
      } else {
        // Create new event
        return (this.prisma as any).calendarEvent.create({
          data: {
            workspaceId,
            userId: '', // TODO: Get user from context
            title: event.title,
            description: event.description,
            startDate: event.startDate,
            endDate: event.endDate,
            location: event.location,
            provider,
            externalId: event.id,
            synced: true,
            syncedAt: new Date(),
          },
        });
      }
    } catch (error) {
      this.logger.error(`Failed to save calendar event: ${getErrorMessage(error)}`);
      throw error;
    }
  }

  /**
   * Create calendar event from task
   */
  async createEventFromTask(task: any, config: CalendarConfig): Promise<any> {
    const event: CalendarEvent = {
      title: task.title,
      description: task.description,
      startDate: task.dueDate || new Date(),
      endDate: new Date((task.dueDate || new Date()).getTime() + 3600000), // 1 hour duration
      location: 'NOMA',
    };

    if (config.provider === 'google') {
      return this.createGoogleCalendarEvent(config, event);
    } else if (config.provider === 'outlook') {
      return this.createOutlookCalendarEvent(config, event);
    }
  }

  /**
   * Create event in Google Calendar
   */
  private async createGoogleCalendarEvent(config: CalendarConfig, event: CalendarEvent): Promise<any> {
    // TODO: Implement actual Google Calendar event creation
    this.logger.log(`Creating Google Calendar event: ${event.title}`);
    
    return {
      success: true,
      message: 'Event created in Google Calendar',
      eventId: 'google_' + Date.now(),
    };
  }

  /**
   * Create event in Outlook Calendar
   */
  private async createOutlookCalendarEvent(config: CalendarConfig, event: CalendarEvent): Promise<any> {
    // TODO: Implement actual Outlook Calendar event creation
    this.logger.log(`Creating Outlook Calendar event: ${event.title}`);
    
    return {
      success: true,
      message: 'Event created in Outlook Calendar',
      eventId: 'outlook_' + Date.now(),
    };
  }

  /**
   * Get calendar events for workspace
   */
  async getEvents(workspaceId: string, startDate?: Date, endDate?: Date): Promise<any[]> {
    return (this.prisma as any).calendarEvent.findMany({
      where: {
        workspaceId,
        ...(startDate && { startDate: { gte: startDate } }),
        ...(endDate && { endDate: { lte: endDate } }),
      },
      orderBy: { startDate: 'asc' },
    });
  }

  /**
   * Link task to calendar event
   */
  async linkTaskToEvent(taskId: string, eventId: string): Promise<any> {
    return (this.prisma as any).calendarEvent.update({
      where: { id: eventId },
      data: { taskId },
    });
  }

  /**
   * Get OAuth authorization URL
   */
  getAuthUrl(provider: 'google' | 'outlook', clientId: string, redirectUri: string): string {
    if (provider === 'google') {
      const scopes = [
        'https://www.googleapis.com/auth/calendar',
        'https://www.googleapis.com/auth/calendar.events',
      ];
      
      return `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${clientId}&` +
        `redirect_uri=${redirectUri}&` +
        `response_type=code&` +
        `scope=${scopes.join('%20')}&` +
        `access_type=offline`;
    } else if (provider === 'outlook') {
      const scopes = ['Calendars.ReadWrite', 'offline_access'];
      
      return `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?` +
        `client_id=${clientId}&` +
        `redirect_uri=${redirectUri}&` +
        `response_type=code&` +
        `scope=${scopes.join('%20')}`;
    }
    
    throw new Error('Unsupported provider');
  }
}
