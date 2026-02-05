import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { getErrorMessage } from './types';

interface GitHubConfig {
  token: string; // GitHub Personal Access Token or OAuth token
  webhookSecret?: string; // Secret for webhook verification
  repositories?: string[]; // List of repositories to track (e.g., ['owner/repo'])
}

interface GitHubPRData {
  number: number;
  title: string;
  html_url: string;
  state: string;
  user: { login: string };
  head: { ref: string };
  created_at: string;
  updated_at: string;
  merged_at?: string;
  labels?: Array<{ name: string }>;
  assignees?: Array<{ login: string }>;
}

interface LinkPRToTaskParams {
  workspaceId: string;
  taskId: string;
  repository: string;
  prNumber: number;
}

@Injectable()
export class GitHubService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Fetch pull request details from GitHub API
   */
  async fetchPullRequest(
    token: string,
    repository: string,
    prNumber: number,
  ): Promise<GitHubPRData> {
    try {
      const response = await fetch(
        `https://api.github.com/repos/${repository}/pulls/${prNumber}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/vnd.github.v3+json',
          },
        },
      );

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.statusText}`);
      }

      return (await response.json()) as GitHubPRData;
    } catch (error) {
      throw new Error(`Failed to fetch PR: ${getErrorMessage(error)}`);
    }
  }

  /**
   * Link a GitHub PR to a task
   */
  async linkPRToTask(params: LinkPRToTaskParams, config: GitHubConfig) {
    const { workspaceId, taskId, repository, prNumber } = params;

    try {
      // Fetch PR details from GitHub
      const prData = await this.fetchPullRequest(config.token, repository, prNumber);

      // Save PR to database and link to task
      const pr = await (this.prisma as any).gitHubPullRequest.upsert({
        where: {
          repository_prNumber: {
            repository,
            prNumber,
          },
        },
        update: {
          taskId,
          prTitle: prData.title,
          prState: prData.state,
          prUpdatedAt: new Date(prData.updated_at),
          prMergedAt: prData.merged_at ? new Date(prData.merged_at) : null,
          syncedAt: new Date(),
          metadata: {
            labels: prData.labels,
            assignees: prData.assignees,
          },
        },
        create: {
          workspaceId,
          taskId,
          repository,
          prNumber,
          prTitle: prData.title,
          prUrl: prData.html_url,
          prState: prData.state,
          prAuthor: prData.user.login,
          prBranch: prData.head.ref,
          prCreatedAt: new Date(prData.created_at),
          prUpdatedAt: new Date(prData.updated_at),
          prMergedAt: prData.merged_at ? new Date(prData.merged_at) : null,
          metadata: {
            labels: prData.labels,
            assignees: prData.assignees,
          },
        },
      });

      return {
        success: true,
        pr,
        message: `PR #${prNumber} linked to task`,
      };
    } catch (error) {
      throw new Error(`Failed to link PR: ${getErrorMessage(error)}`);
    }
  }

  /**
   * Get all PRs linked to a task
   */
  async getPRsForTask(taskId: string) {
    try {
      return await (this.prisma as any).gitHubPullRequest.findMany({
        where: { taskId },
        orderBy: { prCreatedAt: 'desc' },
      });
    } catch (error) {
      throw new Error(`Failed to fetch PRs: ${getErrorMessage(error)}`);
    }
  }

  /**
   * Sync all PRs for a repository
   */
  async syncRepository(
    workspaceId: string,
    repository: string,
    config: GitHubConfig,
  ) {
    try {
      const response = await fetch(
        `https://api.github.com/repos/${repository}/pulls?state=all&per_page=100`,
        {
          headers: {
            Authorization: `Bearer ${config.token}`,
            Accept: 'application/vnd.github.v3+json',
          },
        },
      );

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.statusText}`);
      }

      const prs = (await response.json()) as GitHubPRData[];

      // Upsert all PRs
      const results = await Promise.all(
        prs.map((prData) =>
          (this.prisma as any).gitHubPullRequest.upsert({
            where: {
              repository_prNumber: {
                repository,
                prNumber: prData.number,
              },
            },
            update: {
              prTitle: prData.title,
              prState: prData.state,
              prUpdatedAt: new Date(prData.updated_at),
              prMergedAt: prData.merged_at ? new Date(prData.merged_at) : null,
              syncedAt: new Date(),
              metadata: {
                labels: prData.labels,
                assignees: prData.assignees,
              },
            },
            create: {
              workspaceId,
              repository,
              prNumber: prData.number,
              prTitle: prData.title,
              prUrl: prData.html_url,
              prState: prData.state,
              prAuthor: prData.user.login,
              prBranch: prData.head.ref,
              prCreatedAt: new Date(prData.created_at),
              prUpdatedAt: new Date(prData.updated_at),
              prMergedAt: prData.merged_at ? new Date(prData.merged_at) : null,
              metadata: {
                labels: prData.labels,
                assignees: prData.assignees,
              },
            },
          }),
        ),
      );

      return {
        success: true,
        synced: results.length,
        message: `Synced ${results.length} PRs from ${repository}`,
      };
    } catch (error) {
      throw new Error(`Failed to sync repository: ${getErrorMessage(error)}`);
    }
  }

  /**
   * Handle GitHub webhook
   * Supports: pull_request, issues, push, etc.
   */
  async handleWebhook(event: string, payload: any, workspaceId: string) {
    try {
      if (event === 'pull_request') {
        const { action, pull_request, repository } = payload;
        const repo = repository.full_name;

        // Find if PR is already linked to a task
        const existingPR = await (this.prisma as any).gitHubPullRequest.findUnique({
          where: {
            repository_prNumber: {
              repository: repo,
              prNumber: pull_request.number,
            },
          },
        });

        // Update or create PR record
        await (this.prisma as any).gitHubPullRequest.upsert({
          where: {
            repository_prNumber: {
              repository: repo,
              prNumber: pull_request.number,
            },
          },
          update: {
            prTitle: pull_request.title,
            prState: pull_request.state,
            prUpdatedAt: new Date(pull_request.updated_at),
            prMergedAt: pull_request.merged_at
              ? new Date(pull_request.merged_at)
              : null,
            syncedAt: new Date(),
          },
          create: {
            workspaceId,
            taskId: existingPR?.taskId || null,
            repository: repo,
            prNumber: pull_request.number,
            prTitle: pull_request.title,
            prUrl: pull_request.html_url,
            prState: pull_request.state,
            prAuthor: pull_request.user.login,
            prBranch: pull_request.head.ref,
            prCreatedAt: new Date(pull_request.created_at),
            prUpdatedAt: new Date(pull_request.updated_at),
            prMergedAt: pull_request.merged_at
              ? new Date(pull_request.merged_at)
              : null,
          },
        });

        return {
          success: true,
          action,
          pr: pull_request.number,
          message: `Webhook processed: ${action} on PR #${pull_request.number}`,
        };
      }

      if (event === 'issues') {
        // Could create tasks from issues in the future
        return {
          success: true,
          message: 'Issue webhook received (not processed yet)',
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
   * Verify GitHub webhook signature
   */
  verifyWebhookSignature(
    payload: string,
    signature: string,
    secret: string,
  ): boolean {
    try {
      // GitHub uses HMAC-SHA256
      // Note: For production, implement proper HMAC verification
      // For now, this is a placeholder
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get PR statistics for a workspace
   */
  async getPRStats(workspaceId: string) {
    try {
      const prs = await (this.prisma as any).gitHubPullRequest.findMany({
        where: { workspaceId },
      });

      const stats = {
        total: prs.length,
        open: prs.filter((pr: any) => pr.prState === 'open').length,
        merged: prs.filter((pr: any) => pr.prState === 'merged').length,
        closed: prs.filter((pr: any) => pr.prState === 'closed').length,
        linkedToTasks: prs.filter((pr: any) => pr.taskId).length,
      };

      return stats;
    } catch (error) {
      throw new Error(`Failed to get PR stats: ${getErrorMessage(error)}`);
    }
  }
}
