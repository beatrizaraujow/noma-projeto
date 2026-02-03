import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class WorkflowService {
  constructor(private prisma: PrismaService) {}

  // ==================== WORKFLOW MANAGEMENT ====================

  async createWorkflow(data: {
    workspaceId: string;
    name: string;
    description?: string;
    icon?: string;
    color?: string;
    trigger: any;
    steps: any[];
    createdBy: string;
  }) {
    const workflow = await this.prisma.workflow.create({
      data: {
        workspaceId: data.workspaceId,
        name: data.name,
        description: data.description,
        icon: data.icon,
        color: data.color,
        trigger: data.trigger,
        createdBy: data.createdBy,
      },
    });

    // Create steps
    for (let i = 0; i < data.steps.length; i++) {
      const step = data.steps[i];
      await this.prisma.workflowStep.create({
        data: {
          workflowId: workflow.id,
          name: step.name,
          type: step.type,
          config: step.config,
          position: i,
          parentId: step.parentId,
          nextStepId: step.nextStepId,
        },
      });
    }

    return this.getWorkflow(workflow.id);
  }

  async getWorkflow(workflowId: string) {
    return this.prisma.workflow.findUnique({
      where: { id: workflowId },
      include: {
        steps: {
          orderBy: { position: 'asc' },
        },
      },
    });
  }

  async listWorkflows(workspaceId: string) {
    return this.prisma.workflow.findMany({
      where: { workspaceId },
      include: {
        steps: {
          orderBy: { position: 'asc' },
        },
        _count: {
          select: { executions: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async updateWorkflow(
    workflowId: string,
    data: {
      name?: string;
      description?: string;
      icon?: string;
      color?: string;
      trigger?: any;
      active?: boolean;
      steps?: any[];
    },
  ) {
    // Update workflow
    const workflow = await this.prisma.workflow.update({
      where: { id: workflowId },
      data: {
        name: data.name,
        description: data.description,
        icon: data.icon,
        color: data.color,
        trigger: data.trigger,
        active: data.active,
        version: { increment: 1 },
      },
    });

    // Update steps if provided
    if (data.steps) {
      // Delete existing steps
      await this.prisma.workflowStep.deleteMany({
        where: { workflowId },
      });

      // Create new steps
      for (let i = 0; i < data.steps.length; i++) {
        const step = data.steps[i];
        await this.prisma.workflowStep.create({
          data: {
            workflowId,
            name: step.name,
            type: step.type,
            config: step.config,
            position: i,
            parentId: step.parentId,
            nextStepId: step.nextStepId,
          },
        });
      }
    }

    return this.getWorkflow(workflowId);
  }

  async deleteWorkflow(workflowId: string) {
    return this.prisma.workflow.delete({
      where: { id: workflowId },
    });
  }

  // ==================== WORKFLOW EXECUTION ====================

  async executeWorkflow(workflowId: string, input?: any, triggeredBy?: string) {
    const workflow = await this.getWorkflow(workflowId);
    if (!workflow || !workflow.active) {
      throw new Error('Workflow not found or inactive');
    }

    // Create execution record
    const execution = await this.prisma.workflowExecution.create({
      data: {
        workflowId,
        status: 'running',
        input,
        triggeredBy,
        logs: [],
      },
    });

    try {
      const context = {
        input,
        variables: {},
        logs: [],
      };

      // Execute steps sequentially
      for (const step of workflow.steps) {
        if (step.parentId === null) {
          // Only execute top-level steps
          await this.executeStep(step, context, workflow.steps);
        }
      }

      // Update execution as completed
      await this.prisma.workflowExecution.update({
        where: { id: execution.id },
        data: {
          status: 'completed',
          completedAt: new Date(),
          output: context.variables,
          logs: context.logs,
        },
      });

      return { success: true, executionId: execution.id, output: context.variables };
    } catch (error: any) {
      const errorMessage = error?.message || 'Unknown error';
      
      // Update execution as failed
      await this.prisma.workflowExecution.update({
        where: { id: execution.id },
        data: {
          status: 'failed',
          completedAt: new Date(),
          error: errorMessage,
          logs: [],
        },
      });

      throw error;
    }
  }

  private async executeStep(step: any, context: any, allSteps: any[]) {
    context.logs.push({
      timestamp: new Date(),
      step: step.name,
      type: step.type,
      status: 'started',
    });

    try {
      switch (step.type) {
        case 'action':
          await this.executeAction(step.config, context);
          break;

        case 'condition':
          await this.executeCondition(step, context, allSteps);
          break;

        case 'loop':
          await this.executeLoop(step, context, allSteps);
          break;

        case 'delay':
          await this.executeDelay(step.config);
          break;

        case 'webhook':
          await this.executeWebhook(step.config, context);
          break;

        case 'notification':
          await this.executeNotification(step.config, context);
          break;

        default:
          throw new Error(`Unknown step type: ${step.type}`);
      }

      context.logs.push({
        timestamp: new Date(),
        step: step.name,
        type: step.type,
        status: 'completed',
      });

      // Execute next step if specified
      if (step.nextStepId) {
        const nextStep = allSteps.find((s) => s.id === step.nextStepId);
        if (nextStep) {
          await this.executeStep(nextStep, context, allSteps);
        }
      }
    } catch (error: any) {
      context.logs.push({
        timestamp: new Date(),
        step: step.name,
        type: step.type,
        status: 'failed',
        error: error?.message || 'Unknown error',
      });
      throw error;
    }
  }

  private async executeAction(config: any, context: any) {
    const { actionType, ...params } = config;

    switch (actionType) {
      case 'create_task':
        const task = await this.prisma.task.create({
          data: {
            title: this.interpolate(params.title, context),
            description: this.interpolate(params.description, context),
            projectId: params.projectId,
            assigneeId: params.assigneeId,
            status: params.status || 'TODO',
            priority: params.priority || 'MEDIUM',
          },
        });
        context.variables.createdTask = task;
        break;

      case 'update_task':
        await this.prisma.task.update({
          where: { id: params.taskId },
          data: {
            title: params.title ? this.interpolate(params.title, context) : undefined,
            description: params.description ? this.interpolate(params.description, context) : undefined,
            status: params.status,
            priority: params.priority,
            assigneeId: params.assigneeId,
          },
        });
        break;

      case 'delete_task':
        await this.prisma.task.delete({
          where: { id: params.taskId },
        });
        break;

      case 'set_variable':
        context.variables[params.name] = this.interpolate(params.value, context);
        break;

      default:
        throw new Error(`Unknown action type: ${actionType}`);
    }
  }

  private async executeCondition(step: any, context: any, allSteps: any[]) {
    const { operator, left, right } = step.config;
    const leftValue = this.interpolate(left, context);
    const rightValue = this.interpolate(right, context);

    let result = false;

    switch (operator) {
      case 'equals':
        result = leftValue === rightValue;
        break;
      case 'not_equals':
        result = leftValue !== rightValue;
        break;
      case 'greater_than':
        result = leftValue > rightValue;
        break;
      case 'less_than':
        result = leftValue < rightValue;
        break;
      case 'contains':
        result = String(leftValue).includes(String(rightValue));
        break;
      case 'not_contains':
        result = !String(leftValue).includes(String(rightValue));
        break;
      default:
        throw new Error(`Unknown operator: ${operator}`);
    }

    context.variables[`condition_${step.id}`] = result;

    // Execute child steps based on condition result
    const childSteps = allSteps.filter((s) => s.parentId === step.id);
    const branch = result ? 'true' : 'false';
    const branchSteps = childSteps.filter((s) => s.config.branch === branch);

    for (const childStep of branchSteps) {
      await this.executeStep(childStep, context, allSteps);
    }
  }

  private async executeLoop(step: any, context: any, allSteps: any[]) {
    const { items, variableName } = step.config;
    const itemsArray = this.interpolate(items, context);

    if (!Array.isArray(itemsArray)) {
      throw new Error('Loop items must be an array');
    }

    // Execute child steps for each item
    const childSteps = allSteps.filter((s) => s.parentId === step.id);

    for (const item of itemsArray) {
      context.variables[variableName] = item;
      for (const childStep of childSteps) {
        await this.executeStep(childStep, context, allSteps);
      }
    }
  }

  private async executeDelay(config: any) {
    const { duration } = config; // duration in milliseconds
    await new Promise((resolve) => setTimeout(resolve, duration));
  }

  private async executeWebhook(config: any, context: any) {
    const { url, method, headers, body } = config;

    const response = await fetch(url, {
      method: method || 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: body ? JSON.stringify(this.interpolate(body, context)) : undefined,
    });

    const data = await response.json();
    context.variables.webhookResponse = data;
  }

  private async executeNotification(config: any, context: any) {
    const { title, message, userId } = config;

    // Create notification (assuming you have a notification system)
    await this.prisma.activity.create({
      data: {
        type: 'notification',
        description: this.interpolate(message, context),
        userId,
        metadata: {
          title: this.interpolate(title, context),
        },
      },
    });
  }

  private interpolate(value: any, context: any): any {
    if (typeof value !== 'string') {
      return value;
    }

    // Replace {{variable}} with context values
    return value.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
      const keys = path.trim().split('.');
      let result = context;

      for (const key of keys) {
        result = result?.[key];
        if (result === undefined) {
          return match; // Keep original if not found
        }
      }

      return result;
    });
  }

  // ==================== WEBHOOK TRIGGERS ====================

  async createWebhookTrigger(data: {
    workspaceId: string;
    workflowId: string;
    name: string;
    createdBy: string;
  }) {
    const url = `webhook_${crypto.randomBytes(16).toString('hex')}`;
    const secret = crypto.randomBytes(32).toString('hex');

    return this.prisma.webhookTrigger.create({
      data: {
        workspaceId: data.workspaceId,
        workflowId: data.workflowId,
        name: data.name,
        url,
        secret,
        createdBy: data.createdBy,
      },
    });
  }

  async listWebhookTriggers(workspaceId: string) {
    return this.prisma.webhookTrigger.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async deleteWebhookTrigger(triggerId: string) {
    return this.prisma.webhookTrigger.delete({
      where: { id: triggerId },
    });
  }

  async executeWebhookTrigger(webhookUrl: string, payload: any, signature?: string) {
    const webhook = await this.prisma.webhookTrigger.findUnique({
      where: { url: webhookUrl },
    });

    if (!webhook || !webhook.active) {
      throw new Error('Webhook not found or inactive');
    }

    // Verify signature if provided
    if (signature) {
      const expectedSignature = crypto
        .createHmac('sha256', webhook.secret)
        .update(JSON.stringify(payload))
        .digest('hex');

      if (signature !== expectedSignature) {
        throw new Error('Invalid webhook signature');
      }
    }

    // Update webhook stats
    await this.prisma.webhookTrigger.update({
      where: { id: webhook.id },
      data: {
        lastTriggered: new Date(),
        triggerCount: { increment: 1 },
      },
    });

    // Execute workflow
    return this.executeWorkflow(webhook.workflowId, payload, 'webhook');
  }

  // ==================== SCHEDULED AUTOMATIONS ====================

  // Note: Install @nestjs/schedule package and add ScheduleModule.forRoot() to app.module.ts
  // Uncomment when ready to use
  /*
  @Cron(CronExpression.EVERY_MINUTE)
  async processScheduledWorkflows() {
    const workflows = await this.prisma.workflow.findMany({
      where: {
        active: true,
        trigger: {
          path: ['type'],
          equals: 'scheduled',
        },
      },
    });

    for (const workflow of workflows) {
      const triggerConfig = workflow.trigger as any;
      const schedule = triggerConfig.schedule; // cron expression

      // Check if workflow should run based on schedule
      // This is a simplified version - in production, use a proper cron parser
      const shouldRun = this.shouldRunScheduledWorkflow(schedule);

      if (shouldRun) {
        try {
          await this.executeWorkflow(workflow.id, null, 'scheduled');
        } catch (error: any) {
          console.error(`Error executing scheduled workflow ${workflow.id}:`, error?.message || error);
        }
      }
    }
  }

  private shouldRunScheduledWorkflow(schedule: string): boolean {
    // Implement cron schedule checking logic
    // For now, return false to avoid auto-execution
    return false;
  }
  */

  // ==================== WORKFLOW EXECUTIONS ====================

  async getWorkflowExecution(executionId: string) {
    return this.prisma.workflowExecution.findUnique({
      where: { id: executionId },
      include: {
        workflow: true,
      },
    });
  }

  async listWorkflowExecutions(workflowId: string, limit = 50) {
    return this.prisma.workflowExecution.findMany({
      where: { workflowId },
      orderBy: { startedAt: 'desc' },
      take: limit,
    });
  }

  async cancelWorkflowExecution(executionId: string) {
    return this.prisma.workflowExecution.update({
      where: { id: executionId },
      data: {
        status: 'cancelled',
        completedAt: new Date(),
      },
    });
  }
}
