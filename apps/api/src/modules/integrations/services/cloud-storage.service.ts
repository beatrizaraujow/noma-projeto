import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { getErrorMessage } from './types';

interface CloudStorageConfig {
  provider: 'google_drive' | 'dropbox';
  accessToken: string;
  refreshToken?: string;
}

interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  webViewLink: string;
  thumbnailLink?: string;
  size?: string;
  modifiedTime: string;
}

interface DropboxFile {
  id: string;
  name: string;
  path_display: string;
  size: number;
  client_modified: string;
  '.tag': string;
}

interface AttachFileParams {
  workspaceId: string;
  fileId: string;
  projectId?: string;
  taskId?: string;
  createdBy: string;
}

@Injectable()
export class CloudStorageService {
  constructor(private readonly prisma: PrismaService) {}

  // ==================== GOOGLE DRIVE ====================

  /**
   * Fetch file details from Google Drive
   */
  async fetchGoogleDriveFile(
    fileId: string,
    accessToken: string,
  ): Promise<GoogleDriveFile> {
    try {
      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files/${fileId}?fields=id,name,mimeType,webViewLink,thumbnailLink,size,modifiedTime`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error(`Google Drive API error: ${response.statusText}`);
      }

      return (await response.json()) as GoogleDriveFile;
    } catch (error) {
      throw new Error(`Failed to fetch Google Drive file: ${getErrorMessage(error)}`);
    }
  }

  /**
   * Create share link for Google Drive file
   */
  async createGoogleDriveShareLink(
    fileId: string,
    accessToken: string,
  ): Promise<string> {
    try {
      // Make file accessible to anyone with the link
      await fetch(
        `https://www.googleapis.com/drive/v3/files/${fileId}/permissions`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            role: 'reader',
            type: 'anyone',
          }),
        },
      );

      // Return web view link
      const file = await this.fetchGoogleDriveFile(fileId, accessToken);
      return file.webViewLink;
    } catch (error) {
      throw new Error(`Failed to create share link: ${getErrorMessage(error)}`);
    }
  }

  /**
   * List files from Google Drive folder
   */
  async listGoogleDriveFiles(
    folderId: string,
    accessToken: string,
  ): Promise<GoogleDriveFile[]> {
    try {
      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files?q='${folderId}'+in+parents&fields=files(id,name,mimeType,webViewLink,thumbnailLink,size,modifiedTime)`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error(`Google Drive API error: ${response.statusText}`);
      }

      const data = (await response.json()) as any;
      return data.files || [];
    } catch (error) {
      throw new Error(`Failed to list Google Drive files: ${getErrorMessage(error)}`);
    }
  }

  // ==================== DROPBOX ====================

  /**
   * Fetch file details from Dropbox
   */
  async fetchDropboxFile(
    filePath: string,
    accessToken: string,
  ): Promise<DropboxFile> {
    try {
      const response = await fetch(
        'https://api.dropboxapi.com/2/files/get_metadata',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            path: filePath,
            include_media_info: true,
          }),
        },
      );

      if (!response.ok) {
        throw new Error(`Dropbox API error: ${response.statusText}`);
      }

      return (await response.json()) as DropboxFile;
    } catch (error) {
      throw new Error(`Failed to fetch Dropbox file: ${getErrorMessage(error)}`);
    }
  }

  /**
   * Create share link for Dropbox file
   */
  async createDropboxShareLink(
    filePath: string,
    accessToken: string,
  ): Promise<string> {
    try {
      const response = await fetch(
        'https://api.dropboxapi.com/2/sharing/create_shared_link_with_settings',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            path: filePath,
            settings: {
              requested_visibility: 'public',
            },
          }),
        },
      );

      if (!response.ok) {
        // Link might already exist, try to get existing links
        const listResponse = await fetch(
          'https://api.dropboxapi.com/2/sharing/list_shared_links',
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ path: filePath }),
          },
        );

        if (listResponse.ok) {
          const data = (await listResponse.json()) as any;
          if (data.links && data.links.length > 0) {
            return data.links[0].url;
          }
        }

        throw new Error(`Dropbox API error: ${response.statusText}`);
      }

      const data = (await response.json()) as any;
      return data.url;
    } catch (error) {
      throw new Error(`Failed to create share link: ${getErrorMessage(error)}`);
    }
  }

  /**
   * List files from Dropbox folder
   */
  async listDropboxFiles(
    folderPath: string,
    accessToken: string,
  ): Promise<DropboxFile[]> {
    try {
      const response = await fetch(
        'https://api.dropboxapi.com/2/files/list_folder',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            path: folderPath,
          }),
        },
      );

      if (!response.ok) {
        throw new Error(`Dropbox API error: ${response.statusText}`);
      }

      const data = (await response.json()) as any;
      return data.entries || [];
    } catch (error) {
      throw new Error(`Failed to list Dropbox files: ${getErrorMessage(error)}`);
    }
  }

  // ==================== UNIFIED METHODS ====================

  /**
   * Attach a cloud file to a project or task
   */
  async attachFile(params: AttachFileParams, config: CloudStorageConfig) {
    const { workspaceId, fileId, projectId, taskId, createdBy } = params;

    try {
      let fileData: any;
      let shareLink: string;

      if (config.provider === 'google_drive') {
        fileData = await this.fetchGoogleDriveFile(fileId, config.accessToken);
        shareLink = await this.createGoogleDriveShareLink(fileId, config.accessToken);

        const cloudFile = await (this.prisma as any).cloudFile.upsert({
          where: {
            provider_fileId: {
              provider: 'google_drive',
              fileId,
            },
          },
          update: {
            fileName: fileData.name,
            fileUrl: fileData.webViewLink,
            sharedLink: shareLink,
            syncedAt: new Date(),
          },
          create: {
            workspaceId,
            projectId: projectId || null,
            taskId: taskId || null,
            provider: 'google_drive',
            fileId,
            fileName: fileData.name,
            fileType: fileData.mimeType,
            fileUrl: fileData.webViewLink,
            thumbnailUrl: fileData.thumbnailLink || null,
            fileSize: fileData.size ? parseInt(fileData.size) : null,
            sharedLink: shareLink,
            metadata: {
              modifiedTime: fileData.modifiedTime,
            },
            createdBy,
          },
        });

        return {
          success: true,
          file: cloudFile,
          message: `Google Drive file "${fileData.name}" attached successfully`,
        };
      }

      if (config.provider === 'dropbox') {
        fileData = await this.fetchDropboxFile(fileId, config.accessToken);
        shareLink = await this.createDropboxShareLink(fileId, config.accessToken);

        const cloudFile = await (this.prisma as any).cloudFile.upsert({
          where: {
            provider_fileId: {
              provider: 'dropbox',
              fileId: fileData.id,
            },
          },
          update: {
            fileName: fileData.name,
            sharedLink: shareLink,
            syncedAt: new Date(),
          },
          create: {
            workspaceId,
            projectId: projectId || null,
            taskId: taskId || null,
            provider: 'dropbox',
            fileId: fileData.id,
            fileName: fileData.name,
            fileType: 'application/octet-stream',
            fileUrl: shareLink,
            fileSize: fileData.size,
            sharedLink: shareLink,
            metadata: {
              path: fileData.path_display,
              modified: fileData.client_modified,
            },
            createdBy,
          },
        });

        return {
          success: true,
          file: cloudFile,
          message: `Dropbox file "${fileData.name}" attached successfully`,
        };
      }

      throw new Error(`Unsupported provider: ${config.provider}`);
    } catch (error) {
      throw new Error(`Failed to attach file: ${getErrorMessage(error)}`);
    }
  }

  /**
   * Get cloud files for a project or task
   */
  async getFiles(params: {
    projectId?: string;
    taskId?: string;
    workspaceId: string;
    provider?: string;
  }) {
    try {
      const where: any = { workspaceId: params.workspaceId };

      if (params.projectId) where.projectId = params.projectId;
      if (params.taskId) where.taskId = params.taskId;
      if (params.provider) where.provider = params.provider;

      return await (this.prisma as any).cloudFile.findMany({
        where,
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      throw new Error(`Failed to fetch cloud files: ${getErrorMessage(error)}`);
    }
  }

  /**
   * Sync folder from cloud storage
   */
  async syncFolder(
    workspaceId: string,
    folderId: string,
    config: CloudStorageConfig,
    projectId?: string,
  ) {
    try {
      let files: any[] = [];

      if (config.provider === 'google_drive') {
        files = await this.listGoogleDriveFiles(folderId, config.accessToken);
      } else if (config.provider === 'dropbox') {
        files = await this.listDropboxFiles(folderId, config.accessToken);
      }

      // Note: This is a simplified version
      // In production, you'd want to batch process and handle errors better
      return {
        success: true,
        filesFound: files.length,
        message: `Found ${files.length} files in folder`,
      };
    } catch (error) {
      throw new Error(`Failed to sync folder: ${getErrorMessage(error)}`);
    }
  }

  /**
   * Remove cloud file attachment
   */
  async removeFile(provider: string, fileId: string) {
    try {
      await (this.prisma as any).cloudFile.delete({
        where: {
          provider_fileId: {
            provider,
            fileId,
          },
        },
      });

      return {
        success: true,
        message: 'Cloud file removed successfully',
      };
    } catch (error) {
      throw new Error(`Failed to remove cloud file: ${getErrorMessage(error)}`);
    }
  }

  /**
   * Extract file ID from cloud storage URL
   */
  extractFileIdFromUrl(url: string, provider: 'google_drive' | 'dropbox'): string | null {
    try {
      if (provider === 'google_drive') {
        // Matches: https://drive.google.com/file/d/FILE_ID/view
        const match = url.match(/drive\.google\.com\/file\/d\/([^\/]+)/);
        return match ? match[1] : null;
      }

      if (provider === 'dropbox') {
        // Matches: https://www.dropbox.com/s/FILE_ID/filename.ext
        const match = url.match(/dropbox\.com\/s\/([^\/]+)/);
        return match ? match[1] : null;
      }

      return null;
    } catch (error) {
      return null;
    }
  }
}
