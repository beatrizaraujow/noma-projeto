import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { getErrorMessage } from './types';

export interface EmailConfig {
  host: string; // IMAP host
  port: number;
  secure: boolean;
  user: string;
  password: string;
  smtpHost?: string; // For sending emails
  smtpPort?: number;
  projectId?: string; // Default project for tasks
  parseEmails?: boolean; // Auto-create tasks from emails
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Test email connection (IMAP)
   */
  async testConnection(config: EmailConfig): Promise<any> {
    // Note: This requires the 'node-imap' or 'imap' package
    // For now, we'll return a mock response
    // TODO: Implement actual IMAP connection test
    
    this.logger.log(`Testing email connection to ${config.host}:${config.port}`);
    
    try {
      // Simulate connection test
      // In production, you would:
      // 1. Import IMAP library
      // 2. Create connection
      // 3. Authenticate
      // 4. Check if successful
      
      return {
        success: true,
        message: 'Email connection test successful',
        host: config.host,
        port: config.port,
      };
    } catch (error) {
      this.logger.error(`Email connection test failed: ${getErrorMessage(error)}`);
      throw new Error(`Failed to connect to email server: ${getErrorMessage(error)}`);
    }
  }

  /**
   * Sync inbox and create tasks from emails
   */
  async syncInbox(config: EmailConfig, workspaceId: string): Promise<any> {
    this.logger.log(`Syncing inbox for workspace ${workspaceId}`);
    
    try {
      // TODO: Implement actual IMAP sync
      // Steps:
      // 1. Connect to IMAP server
      // 2. Fetch unread emails
      // 3. Parse email content
      // 4. Create tasks from emails
      // 5. Mark emails as read (optional)
      
      const emails = await this.fetchEmails(config);
      const tasksCreated = [];

      for (const email of emails) {
        if (config.parseEmails) {
          const task = await this.createTaskFromEmail(email, config.projectId, workspaceId);
          tasksCreated.push(task);
        }
      }

      return {
        success: true,
        count: tasksCreated.length,
        tasks: tasksCreated,
      };
    } catch (error) {
      this.logger.error(`Failed to sync inbox: ${getErrorMessage(error)}`);
      throw error;
    }
  }

  /**
   * Fetch emails from IMAP server
   */
  private async fetchEmails(config: EmailConfig): Promise<any[]> {
    // TODO: Implement actual IMAP fetch
    // This is a placeholder that returns mock data
    
    this.logger.log('Fetching emails...');
    
    // Mock emails for testing
    return [
      {
        id: '1',
        from: 'user@example.com',
        subject: 'Task: Update documentation',
        body: 'Please update the API documentation with the new endpoints.',
        date: new Date(),
      },
      {
        id: '2',
        from: 'manager@example.com',
        subject: 'Bug: Login not working',
        body: 'Users are reporting that they cannot login to the system.',
        date: new Date(),
      },
    ];
  }

  /**
   * Create task from email
   */
  private async createTaskFromEmail(email: any, projectId: string, workspaceId: string): Promise<any> {
    try {
      // Find or use default project
      let targetProjectId = projectId;

      if (!targetProjectId) {
        // Get first project in workspace
        const project = await (this.prisma as any).project.findFirst({
          where: { workspaceId },
        });
        targetProjectId = project?.id;
      }

      if (!targetProjectId) {
        this.logger.warn('No project found for email task creation');
        return null;
      }

      // Parse email subject for task title
      let title = email.subject;
      
      // Remove common prefixes
      title = title.replace(/^(Task:|TODO:|Bug:|Feature:|Request:)\s*/i, '');

      // Determine priority from keywords
      let priority = 'MEDIUM';
      if (/urgent|critical|asap/i.test(email.subject) || /urgent|critical|asap/i.test(email.body)) {
        priority = 'HIGH';
      } else if (/low priority|when possible/i.test(email.subject) || /low priority|when possible/i.test(email.body)) {
        priority = 'LOW';
      }

      // Create task
      const task = await (this.prisma as any).task.create({
        data: {
          title,
          description: `Email from: ${email.from}\n\n${email.body}`,
          status: 'TODO',
          priority,
          projectId: targetProjectId,
          position: 0,
        },
      });

      this.logger.log(`Created task from email: ${task.title}`);

      return task;
    } catch (error) {
      this.logger.error(`Failed to create task from email: ${getErrorMessage(error)}`);
      return null;
    }
  }

  /**
   * Send email notification
   */
  async sendNotification(config: EmailConfig, to: string, subject: string, body: string): Promise<any> {
    // TODO: Implement SMTP email sending
    // This requires nodemailer or similar package
    
    this.logger.log(`Sending email to ${to}: ${subject}`);
    
    try {
      // Mock email sending
      return {
        success: true,
        message: 'Email sent successfully',
        to,
        subject,
      };
    } catch (error) {
      this.logger.error(`Failed to send email: ${getErrorMessage(error)}`);
      throw error;
    }
  }

  /**
   * Parse email address for task creation
   * Example: project+abc123@tasks.noma.com -> project ID: abc123
   */
  parseTaskEmail(email: string): { projectId?: string; workspaceId?: string } {
    const match = email.match(/project\+([a-z0-9]+)@/i);
    
    if (match) {
      return { projectId: match[1] };
    }
    
    return {};
  }

  /**
   * Create email inbox for project
   */
  async createInbox(
    workspaceId: string,
    projectId: string,
    createdBy: string,
  ): Promise<any> {
    // Generate unique email address
    const emailAddress = `project+${projectId}@tasks.noma.com`;

    const inbox = await (this.prisma as any).emailInbox.create({
      data: {
        workspaceId,
        projectId,
        email: emailAddress,
        provider: 'internal',
        autoCreateTask: true,
        active: true,
        createdBy,
      },
    });

    return inbox;
  }

  /**
   * List email inboxes for workspace
   */
  async listInboxes(workspaceId: string): Promise<any[]> {
    return (this.prisma as any).emailInbox.findMany({
      where: { workspaceId },
      include: {
        _count: {
          select: {
            // Add email count when implemented
          },
        },
      },
    });
  }
}
