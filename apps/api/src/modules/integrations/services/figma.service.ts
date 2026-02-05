import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { getErrorMessage } from './types';

interface FigmaConfig {
  accessToken: string; // Figma Personal Access Token
  webhookSecret?: string; // Secret for webhook verification
}

interface FigmaFileData {
  name: string;
  thumbnailUrl?: string;
  version?: string;
  lastModified?: string;
}

interface AttachFigmaParams {
  workspaceId: string;
  fileKey: string;
  projectId?: string;
  taskId?: string;
  createdBy: string;
}

@Injectable()
export class FigmaService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Fetch Figma file details from Figma API
   */
  async fetchFileDetails(
    fileKey: string,
    accessToken: string,
  ): Promise<FigmaFileData> {
    try {
      const response = await fetch(`https://api.figma.com/v1/files/${fileKey}`, {
        headers: {
          'X-Figma-Token': accessToken,
        },
      });

      if (!response.ok) {
        throw new Error(`Figma API error: ${response.statusText}`);
      }

      const data = (await response.json()) as any;

      return {
        name: data.name,
        thumbnailUrl: data.thumbnailUrl,
        version: data.version,
        lastModified: data.lastModified,
      };
    } catch (error) {
      throw new Error(`Failed to fetch Figma file: ${getErrorMessage(error)}`);
    }
  }

  /**
   * Get file thumbnail
   */
  async getFileThumbnail(
    fileKey: string,
    accessToken: string,
  ): Promise<string | null> {
    try {
      const response = await fetch(
        `https://api.figma.com/v1/images/${fileKey}?format=png&scale=2`,
        {
          headers: {
            'X-Figma-Token': accessToken,
          },
        },
      );

      if (!response.ok) {
        return null;
      }

      const data = (await response.json()) as any;
      return data.images?.[Object.keys(data.images)[0]] || null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Attach a Figma file to a project or task
   */
  async attachFile(params: AttachFigmaParams, config: FigmaConfig) {
    const { workspaceId, fileKey, projectId, taskId, createdBy } = params;

    try {
      // Fetch file details from Figma
      const fileData = await this.fetchFileDetails(fileKey, config.accessToken);
      const thumbnail = await this.getFileThumbnail(fileKey, config.accessToken);

      // Generate embed URL
      const embedUrl = `https://www.figma.com/embed?embed_host=noma&url=https://www.figma.com/file/${fileKey}`;
      const fileUrl = `https://www.figma.com/file/${fileKey}`;

      // Save to database
      const figmaFile = await (this.prisma as any).figmaFile.upsert({
        where: { fileKey },
        update: {
          fileName: fileData.name,
          version: fileData.version,
          thumbnail: thumbnail || undefined,
          lastSynced: new Date(),
          metadata: {
            lastModified: fileData.lastModified,
          },
        },
        create: {
          workspaceId,
          projectId: projectId || null,
          taskId: taskId || null,
          fileKey,
          fileName: fileData.name,
          fileUrl,
          embedUrl,
          thumbnail: thumbnail || null,
          version: fileData.version,
          metadata: {
            lastModified: fileData.lastModified,
          },
          createdBy,
        },
      });

      return {
        success: true,
        file: figmaFile,
        message: `Figma file "${fileData.name}" attached successfully`,
      };
    } catch (error) {
      throw new Error(`Failed to attach Figma file: ${getErrorMessage(error)}`);
    }
  }

  /**
   * Get Figma files for a project or task
   */
  async getFiles(params: { projectId?: string; taskId?: string; workspaceId: string }) {
    try {
      const where: any = { workspaceId: params.workspaceId };
      
      if (params.projectId) where.projectId = params.projectId;
      if (params.taskId) where.taskId = params.taskId;

      return await (this.prisma as any).figmaFile.findMany({
        where,
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      throw new Error(`Failed to fetch Figma files: ${getErrorMessage(error)}`);
    }
  }

  /**
   * Sync Figma file (update metadata)
   */
  async syncFile(fileKey: string, config: FigmaConfig) {
    try {
      const fileData = await this.fetchFileDetails(fileKey, config.accessToken);
      const thumbnail = await this.getFileThumbnail(fileKey, config.accessToken);

      const updated = await (this.prisma as any).figmaFile.update({
        where: { fileKey },
        data: {
          fileName: fileData.name,
          version: fileData.version,
          thumbnail: thumbnail || undefined,
          lastSynced: new Date(),
          metadata: {
            lastModified: fileData.lastModified,
          },
        },
      });

      return {
        success: true,
        file: updated,
        message: 'Figma file synced successfully',
      };
    } catch (error) {
      throw new Error(`Failed to sync Figma file: ${getErrorMessage(error)}`);
    }
  }

  /**
   * Remove Figma file attachment
   */
  async removeFile(fileKey: string) {
    try {
      await (this.prisma as any).figmaFile.delete({
        where: { fileKey },
      });

      return {
        success: true,
        message: 'Figma file removed successfully',
      };
    } catch (error) {
      throw new Error(`Failed to remove Figma file: ${getErrorMessage(error)}`);
    }
  }

  /**
   * Handle Figma webhook (file updates, comments, etc.)
   */
  async handleWebhook(event: string, payload: any, workspaceId: string) {
    try {
      if (event === 'FILE_UPDATE') {
        const { file_key, file_name, timestamp } = payload;

        // Update file record if it exists
        const existingFile = await (this.prisma as any).figmaFile.findUnique({
          where: { fileKey: file_key },
        });

        if (existingFile) {
          await (this.prisma as any).figmaFile.update({
            where: { fileKey: file_key },
            data: {
              fileName: file_name || existingFile.fileName,
              lastSynced: new Date(timestamp),
            },
          });

          return {
            success: true,
            message: `File ${file_key} updated`,
          };
        }
      }

      if (event === 'FILE_COMMENT') {
        // Could create task comments from Figma comments in the future
        return {
          success: true,
          message: 'Comment webhook received (not processed yet)',
        };
      }

      return {
        success: true,
        message: `Webhook event '${event}' received`,
      };
    } catch (error) {
      throw new Error(`Failed to handle webhook: ${getErrorMessage(error)}`);
    }
  }

  /**
   * Generate Figma embed HTML
   */
  generateEmbedHTML(fileKey: string, options?: { width?: string; height?: string }): string {
    const width = options?.width || '100%';
    const height = options?.height || '450px';
    const embedUrl = `https://www.figma.com/embed?embed_host=noma&url=https://www.figma.com/file/${fileKey}`;

    return `
      <iframe
        style="border: 1px solid rgba(0, 0, 0, 0.1);"
        width="${width}"
        height="${height}"
        src="${embedUrl}"
        allowfullscreen
      ></iframe>
    `;
  }

  /**
   * Extract file key from Figma URL
   */
  extractFileKeyFromUrl(url: string): string | null {
    try {
      // Matches patterns like:
      // https://www.figma.com/file/abc123/File-Name
      // https://www.figma.com/design/abc123/File-Name
      const match = url.match(/figma\.com\/(file|design)\/([a-zA-Z0-9]+)/);
      return match ? match[2] : null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Verify Figma webhook signature
   */
  verifyWebhookSignature(
    payload: string,
    signature: string,
    secret: string,
  ): boolean {
    try {
      // Figma uses HMAC-SHA256
      // Note: For production, implement proper HMAC verification
      // For now, this is a placeholder
      return true;
    } catch (error) {
      return false;
    }
  }
}
