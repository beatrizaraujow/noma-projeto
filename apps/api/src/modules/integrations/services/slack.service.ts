import { Injectable, Logger } from '@nestjs/common';
import { getErrorMessage } from './types';

export interface SlackConfig {
  webhookUrl?: string; // For incoming webhooks
  token?: string; // For Bot token (more features)
  channel?: string; // Default channel
}

export interface SlackMessage {
  text: string;
  channel?: string;
  username?: string;
  icon_emoji?: string;
  attachments?: any[];
  blocks?: any[];
}

@Injectable()
export class SlackService {
  private readonly logger = new Logger(SlackService.name);

  /**
   * Send a message to Slack using webhook URL
   */
  async sendMessage(config: SlackConfig, text: string, channel?: string): Promise<any> {
    const message: SlackMessage = {
      text,
      channel: channel || config.channel,
      username: 'NOMA Bot',
      icon_emoji: ':robot_face:',
    };

    if (config.webhookUrl) {
      return this.sendViaWebhook(config.webhookUrl, message);
    } else if (config.token) {
      return this.sendViaAPI(config.token, message);
    } else {
      throw new Error('No webhook URL or token provided for Slack integration');
    }
  }

  /**
   * Send a rich message with formatting
   */
  async sendRichMessage(
    config: SlackConfig,
    title: string,
    text: string,
    options: {
      color?: string;
      fields?: { title: string; value: string; short?: boolean }[];
      footer?: string;
      channel?: string;
    } = {},
  ): Promise<any> {
    const message: SlackMessage = {
      text: title,
      channel: options.channel || config.channel,
      username: 'NOMA Bot',
      icon_emoji: ':bell:',
      attachments: [
        {
          color: options.color || '#36a64f',
          text: text,
          fields: options.fields || [],
          footer: options.footer || 'NOMA',
          ts: Math.floor(Date.now() / 1000),
        },
      ],
    };

    if (config.webhookUrl) {
      return this.sendViaWebhook(config.webhookUrl, message);
    } else if (config.token) {
      return this.sendViaAPI(config.token, message);
    }
  }

  /**
   * Send notification for task events
   */
  async sendTaskNotification(
    config: SlackConfig,
    task: any,
    event: 'created' | 'updated' | 'completed' | 'assigned',
  ): Promise<any> {
    const eventMessages = {
      created: '🆕 Nova tarefa criada',
      updated: '✏️ Tarefa atualizada',
      completed: '✅ Tarefa concluída',
      assigned: '👤 Tarefa atribuída',
    };

    const colors = {
      created: '#36a64f',
      updated: '#ffa500',
      completed: '#0066cc',
      assigned: '#9c27b0',
    };

    return this.sendRichMessage(config, eventMessages[event], task.title, {
      color: colors[event],
      fields: [
        { title: 'Projeto', value: task.project?.name || 'N/A', short: true },
        { title: 'Status', value: task.status, short: true },
        { title: 'Prioridade', value: task.priority, short: true },
        { title: 'Responsável', value: task.assignee?.name || 'Não atribuído', short: true },
      ],
      footer: `NOMA - ${new Date().toLocaleDateString('pt-BR')}`,
    });
  }

  /**
   * Send via incoming webhook
   */
  private async sendViaWebhook(webhookUrl: string, message: SlackMessage): Promise<any> {
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });

      if (!response.ok) {
        const error = await response.text();
        this.logger.error(`Slack webhook error: ${error}`);
        throw new Error(`Slack webhook failed: ${error}`);
      }

      return { success: true, message: 'Sent via webhook' };
    } catch (error) {
      this.logger.error(`Failed to send Slack message: ${getErrorMessage(error)}`);
      throw error;
    }
  }

  /**
   * Send via Slack Web API (requires bot token)
   */
  private async sendViaAPI(token: string, message: SlackMessage): Promise<any> {
    try {
      const response = await fetch('https://slack.com/api/chat.postMessage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(message),
      });

      const data = await response.json() as any;

      if (!data.ok) {
        this.logger.error(`Slack API error: ${data.error}`);
        throw new Error(`Slack API failed: ${data.error}`);
      }

      return data;
    } catch (error) {
      this.logger.error(`Failed to send Slack message via API: ${getErrorMessage(error)}`);
      throw error;
    }
  }

  /**
   * Validate Slack webhook URL
   */
  validateWebhookUrl(url: string): boolean {
    return url.startsWith('https://hooks.slack.com/services/');
  }
}
