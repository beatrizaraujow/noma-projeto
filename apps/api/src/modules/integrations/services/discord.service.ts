import { Injectable, Logger } from '@nestjs/common';
import { getErrorMessage } from './types';

export interface DiscordConfig {
  webhookUrl: string;
  username?: string;
  avatarUrl?: string;
}

export interface DiscordMessage {
  content?: string;
  username?: string;
  avatar_url?: string;
  embeds?: DiscordEmbed[];
}

export interface DiscordEmbed {
  title?: string;
  description?: string;
  color?: number;
  fields?: { name: string; value: string; inline?: boolean }[];
  footer?: { text: string; icon_url?: string };
  timestamp?: string;
  thumbnail?: { url: string };
}

@Injectable()
export class DiscordService {
  private readonly logger = new Logger(DiscordService.name);

  /**
   * Send a simple message to Discord
   */
  async sendMessage(config: DiscordConfig, content: string, channel?: string): Promise<any> {
    const message: DiscordMessage = {
      content,
      username: config.username || 'NOMA Bot',
      avatar_url: config.avatarUrl,
    };

    return this.sendWebhook(config.webhookUrl, message);
  }

  /**
   * Send a rich embedded message
   */
  async sendEmbed(
    config: DiscordConfig,
    title: string,
    description: string,
    options: {
      color?: number;
      fields?: { name: string; value: string; inline?: boolean }[];
      footer?: string;
      thumbnail?: string;
    } = {},
  ): Promise<any> {
    const embed: DiscordEmbed = {
      title,
      description,
      color: options.color || 0x36a64f, // Green
      fields: options.fields || [],
      footer: options.footer ? { text: options.footer } : undefined,
      thumbnail: options.thumbnail ? { url: options.thumbnail } : undefined,
      timestamp: new Date().toISOString(),
    };

    const message: DiscordMessage = {
      username: config.username || 'NOMA Bot',
      avatar_url: config.avatarUrl,
      embeds: [embed],
    };

    return this.sendWebhook(config.webhookUrl, message);
  }

  /**
   * Send notification for task events
   */
  async sendTaskNotification(
    config: DiscordConfig,
    task: any,
    event: 'created' | 'updated' | 'completed' | 'assigned',
  ): Promise<any> {
    const eventConfig = {
      created: {
        title: '🆕 Nova tarefa criada',
        color: 0x36a64f, // Green
      },
      updated: {
        title: '✏️ Tarefa atualizada',
        color: 0xffa500, // Orange
      },
      completed: {
        title: '✅ Tarefa concluída',
        color: 0x0066cc, // Blue
      },
      assigned: {
        title: '👤 Tarefa atribuída',
        color: 0x9c27b0, // Purple
      },
    };

    const config_event = eventConfig[event];

    return this.sendEmbed(config, config_event.title, task.title, {
      color: config_event.color,
      fields: [
        { name: 'Projeto', value: task.project?.name || 'N/A', inline: true },
        { name: 'Status', value: task.status, inline: true },
        { name: 'Prioridade', value: task.priority, inline: true },
        { name: 'Responsável', value: task.assignee?.name || 'Não atribuído', inline: true },
      ],
      footer: `NOMA - ${new Date().toLocaleDateString('pt-BR')}`,
    });
  }

  /**
   * Send notification for comment events
   */
  async sendCommentNotification(config: DiscordConfig, comment: any, task: any): Promise<any> {
    return this.sendEmbed(config, '💬 Novo comentário', comment.content, {
      color: 0x2196f3, // Blue
      fields: [
        { name: 'Tarefa', value: task.title, inline: false },
        { name: 'Autor', value: comment.author?.name || 'Desconhecido', inline: true },
        { name: 'Projeto', value: task.project?.name || 'N/A', inline: true },
      ],
      footer: 'NOMA',
    });
  }

  /**
   * Send notification for project events
   */
  async sendProjectNotification(
    config: DiscordConfig,
    project: any,
    event: 'created' | 'updated' | 'member_added',
  ): Promise<any> {
    const eventConfig = {
      created: {
        title: '🚀 Novo projeto criado',
        color: 0x4caf50,
      },
      updated: {
        title: '📝 Projeto atualizado',
        color: 0xff9800,
      },
      member_added: {
        title: '👥 Membro adicionado ao projeto',
        color: 0x9c27b0,
      },
    };

    const config_event = eventConfig[event];

    return this.sendEmbed(config, config_event.title, project.name, {
      color: config_event.color,
      fields: [
        { name: 'Descrição', value: project.description || 'Sem descrição', inline: false },
        { name: 'Workspace', value: project.workspace?.name || 'N/A', inline: true },
      ],
      footer: 'NOMA',
    });
  }

  /**
   * Send via Discord webhook
   */
  private async sendWebhook(webhookUrl: string, message: DiscordMessage): Promise<any> {
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
        this.logger.error(`Discord webhook error: ${error}`);
        throw new Error(`Discord webhook failed: ${error}`);
      }

      // Discord returns 204 No Content on success
      return { success: true, message: 'Sent via webhook' };
    } catch (error) {
      this.logger.error(`Failed to send Discord message: ${getErrorMessage(error)}`);
      throw error;
    }
  }

  /**
   * Validate Discord webhook URL
   */
  validateWebhookUrl(url: string): boolean {
    return url.startsWith('https://discord.com/api/webhooks/') || 
           url.startsWith('https://discordapp.com/api/webhooks/');
  }
}
