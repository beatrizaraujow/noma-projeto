import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

export interface TriggerConfig {
  id?: string;
  workspaceId: string;
  projectId?: string;
  name: string;
  enabled: boolean;
  event: 'task_created' | 'task_updated' | 'task_moved' | 'task_completed' | 'task_deleted';
  conditions: {
    field?: string;
    operator?: 'equals' | 'contains' | 'changed_to' | 'changed_from';
    value?: any;
  };
  actions: {
    type: 'update_field' | 'send_notification' | 'create_task' | 'assign_user' | 'add_comment';
    config: any;
  }[];
  createdBy: string;
}

export interface ProjectTemplate {
  id?: string;
  workspaceId: string;
  name: string;
  description?: string;
  icon?: string;
  category?: string;
  tasks: {
    title: string;
    description?: string;
    status?: string;
    priority?: string;
    assigneeEmail?: string;
    dueInDays?: number;
  }[];
  createdBy: string;
}

export interface RecurringTaskConfig {
  id?: string;
  projectId: string;
  title: string;
  description?: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number;
  dayOfWeek?: number;
  dayOfMonth?: number;
  startDate: Date;
  endDate?: Date;
  enabled: boolean;
  taskTemplate: {
    priority?: string;
    status?: string;
    assigneeId?: string;
  };
  createdBy: string;
}

export interface AutoAssignRule {
  id?: string;
  workspaceId: string;
  projectId?: string;
  name: string;
  enabled: boolean;
  priority: number;
  conditions: {
    taskTitle?: string;
    taskDescription?: string;
    taskPriority?: string;
    taskStatus?: string;
    keywords?: string[];
  };
  assignTo: {
    type: 'specific_user' | 'round_robin' | 'least_busy' | 'random';
    userIds?: string[];
  };
  createdBy: string;
}

@Injectable()
export class AutomationService {
  constructor(private prisma: PrismaService) {}

  // ==================== TRIGGERS ====================

  async createTrigger(data: TriggerConfig) {
    // Store trigger configuration
    // In production, you'd store this in a dedicated Trigger table
    return {
      id: `trigger_${Date.now()}`,
      ...data,
      createdAt: new Date(),
    };
  }

  async getTriggers(workspaceId: string, projectId?: string) {
    // Fetch all triggers for workspace/project
    // Mock data for now
    return [];
  }

  async updateTrigger(triggerId: string, data: Partial<TriggerConfig>) {
    // Update trigger
    return { id: triggerId, ...data, updatedAt: new Date() };
  }

  async deleteTrigger(triggerId: string) {
    // Delete trigger
    return { success: true };
  }

  async executeTrigger(
    trigger: TriggerConfig,
    event: string,
    taskData: any,
  ) {
    // Check if conditions match
    const conditionsMet = this.evaluateTriggerConditions(
      trigger.conditions,
      taskData,
    );

    if (!conditionsMet) return;

    // Execute all actions
    for (const action of trigger.actions) {
      await this.executeTriggerAction(action, taskData);
    }
  }

  private evaluateTriggerConditions(conditions: any, taskData: any): boolean {
    if (!conditions || Object.keys(conditions).length === 0) return true;

    const { field, operator, value } = conditions;

    if (!field) return true;

    const taskValue = taskData[field];

    switch (operator) {
      case 'equals':
        return taskValue === value;
      case 'contains':
        return String(taskValue).includes(value);
      case 'changed_to':
        return taskData.newValue === value;
      case 'changed_from':
        return taskData.oldValue === value;
      default:
        return true;
    }
  }

  private async executeTriggerAction(action: any, taskData: any) {
    switch (action.type) {
      case 'update_field':
        await this.prisma.task.update({
          where: { id: taskData.id },
          data: { [action.config.field]: action.config.value },
        });
        break;

      case 'assign_user':
        await this.prisma.task.update({
          where: { id: taskData.id },
          data: { assigneeId: action.config.userId },
        });
        break;

      case 'add_comment':
        await this.prisma.comment.create({
          data: {
            content: action.config.message,
            taskId: taskData.id,
            authorId: action.config.authorId || taskData.createdBy,
          },
        });
        break;

      case 'create_task':
        await this.prisma.task.create({
          data: {
            title: action.config.title,
            description: action.config.description,
            projectId: taskData.projectId,
          },
        });
        break;

      case 'send_notification':
        // Implement notification logic
        console.log('Sending notification:', action.config);
        break;
    }
  }

  // ==================== PROJECT TEMPLATES ====================

  async createProjectTemplate(data: ProjectTemplate) {
    // Store template
    return {
      id: `template_${Date.now()}`,
      ...data,
      createdAt: new Date(),
    };
  }

  async getProjectTemplates(workspaceId: string) {
    // Mock templates
    return [
      {
        id: 'template_1',
        name: 'Software Development Sprint',
        description: 'Standard 2-week sprint template',
        icon: '🚀',
        category: 'Development',
        tasks: [
          {
            title: 'Sprint Planning',
            description: 'Define sprint goals and tasks',
            status: 'todo',
            priority: 'high',
          },
          {
            title: 'Daily Standups',
            description: 'Team sync meetings',
            status: 'todo',
            priority: 'medium',
          },
          {
            title: 'Sprint Review',
            description: 'Demo completed work',
            status: 'todo',
            priority: 'high',
            dueInDays: 14,
          },
          {
            title: 'Sprint Retrospective',
            description: 'Team reflection and improvements',
            status: 'todo',
            priority: 'medium',
            dueInDays: 14,
          },
        ],
      },
      {
        id: 'template_2',
        name: 'Marketing Campaign',
        description: 'Launch a new marketing campaign',
        icon: '📢',
        category: 'Marketing',
        tasks: [
          {
            title: 'Define Campaign Goals',
            description: 'Set clear objectives and KPIs',
            status: 'todo',
            priority: 'high',
          },
          {
            title: 'Create Content',
            description: 'Design and write campaign materials',
            status: 'todo',
            priority: 'high',
          },
          {
            title: 'Schedule Posts',
            description: 'Plan social media calendar',
            status: 'todo',
            priority: 'medium',
          },
          {
            title: 'Monitor Analytics',
            description: 'Track campaign performance',
            status: 'todo',
            priority: 'medium',
          },
        ],
      },
      {
        id: 'template_3',
        name: 'Product Launch',
        description: 'Complete product launch checklist',
        icon: '🎯',
        category: 'Product',
        tasks: [
          {
            title: 'Product Development',
            description: 'Build and test the product',
            status: 'todo',
            priority: 'high',
          },
          {
            title: 'Marketing Materials',
            description: 'Create launch materials',
            status: 'todo',
            priority: 'high',
          },
          {
            title: 'Beta Testing',
            description: 'Test with select users',
            status: 'todo',
            priority: 'high',
          },
          {
            title: 'Public Launch',
            description: 'Release to all users',
            status: 'todo',
            priority: 'high',
          },
        ],
      },
    ];
  }

  async applyProjectTemplate(
    templateId: string,
    projectId: string,
    userId: string,
  ) {
    const templates = await this.getProjectTemplates('');
    const template = templates.find((t) => t.id === templateId);

    if (!template) {
      throw new Error('Template not found');
    }

    const createdTasks = [];

    for (const taskTemplate of template.tasks) {
      let dueDate = null;
      if (taskTemplate.dueInDays) {
        dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + taskTemplate.dueInDays);
      }

      // Find assignee by email if provided
      let assigneeId = null;
      const taskTemplateAny = taskTemplate as any;
      if (taskTemplateAny.assigneeEmail) {
        const user = await this.prisma.user.findUnique({
          where: { email: taskTemplateAny.assigneeEmail },
        });
        assigneeId = user?.id;
      }

      const task = await this.prisma.task.create({
        data: {
          title: taskTemplate.title,
          description: taskTemplate.description,
          status: taskTemplate.status || 'todo',
          priority: taskTemplate.priority || 'medium',
          projectId,
          assigneeId,
          dueDate,
        },
      });

      createdTasks.push(task);
    }

    return {
      template: template.name,
      tasksCreated: createdTasks.length,
      tasks: createdTasks,
    };
  }

  // ==================== RECURRING TASKS ====================

  async createRecurringTask(data: RecurringTaskConfig) {
    // Store recurring task configuration
    return {
      id: `recurring_${Date.now()}`,
      ...data,
      createdAt: new Date(),
    };
  }

  async getRecurringTasks(projectId: string) {
    // Fetch recurring tasks
    return [];
  }

  async updateRecurringTask(
    recurringTaskId: string,
    data: Partial<RecurringTaskConfig>,
  ) {
    return { id: recurringTaskId, ...data, updatedAt: new Date() };
  }

  async deleteRecurringTask(recurringTaskId: string) {
    return { success: true };
  }

  async processRecurringTasks() {
    // This runs daily to check if recurring tasks need to be created
    console.log('Processing recurring tasks...');
    
    // In production: fetch all enabled recurring tasks and create instances
    // based on their schedule
    // Note: Install @nestjs/schedule and add @Cron decorator for automatic execution
  }

  private async createRecurringTaskInstance(config: RecurringTaskConfig) {
    const task = await this.prisma.task.create({
      data: {
        title: config.title,
        description: config.description,
        priority: config.taskTemplate.priority || 'medium',
        status: config.taskTemplate.status || 'todo',
        projectId: config.projectId,
        assigneeId: config.taskTemplate.assigneeId,
      },
    });

    return task;
  }

  // ==================== BULK ACTIONS ====================

  async executeBulkAction(
    action: string,
    taskIds: string[],
    data: any,
    userId: string,
  ) {
    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[],
    };

    switch (action) {
      case 'update_status':
        try {
          await this.prisma.task.updateMany({
            where: { id: { in: taskIds } },
            data: { status: data.status },
          });
          results.success = taskIds.length;
        } catch (error: any) {
          results.failed = taskIds.length;
          results.errors.push(error?.message || 'Error updating status');
        }
        break;

      case 'update_priority':
        try {
          await this.prisma.task.updateMany({
            where: { id: { in: taskIds } },
            data: { priority: data.priority },
          });
          results.success = taskIds.length;
        } catch (error: any) {
          results.failed = taskIds.length;
          results.errors.push(error?.message || 'Error updating priority');
        }
        break;

      case 'assign':
        try {
          await this.prisma.task.updateMany({
            where: { id: { in: taskIds } },
            data: { assigneeId: data.assigneeId },
          });
          results.success = taskIds.length;
        } catch (error: any) {
          results.failed = taskIds.length;
          results.errors.push(error?.message || 'Error assigning tasks');
        }
        break;

      case 'delete':
        try {
          await this.prisma.task.deleteMany({
            where: { id: { in: taskIds } },
          });
          results.success = taskIds.length;
        } catch (error: any) {
          results.failed = taskIds.length;
          results.errors.push(error?.message || 'Error deleting tasks');
        }
        break;

      case 'add_tag':
        // Add tag to multiple tasks
        for (const taskId of taskIds) {
          try {
            // Implement tag logic
            results.success++;
          } catch (error: any) {
            results.failed++;
            results.errors.push(`Task ${taskId}: ${error?.message || 'Error'}`);
          }
        }
        break;

      case 'move_project':
        try {
          await this.prisma.task.updateMany({
            where: { id: { in: taskIds } },
            data: { projectId: data.projectId },
          });
          results.success = taskIds.length;
        } catch (error: any) {
          results.failed = taskIds.length;
          results.errors.push(error?.message || 'Error moving tasks');
        }
        break;

      default:
        throw new Error(`Unknown bulk action: ${action}`);
    }

    return results;
  }

  // ==================== AUTO-ASSIGN RULES ====================

  async createAutoAssignRule(data: AutoAssignRule) {
    return {
      id: `rule_${Date.now()}`,
      ...data,
      createdAt: new Date(),
    };
  }

  async getAutoAssignRules(workspaceId: string, projectId?: string) {
    return [];
  }

  async updateAutoAssignRule(ruleId: string, data: Partial<AutoAssignRule>) {
    return { id: ruleId, ...data, updatedAt: new Date() };
  }

  async deleteAutoAssignRule(ruleId: string) {
    return { success: true };
  }

  async applyAutoAssignRules(taskId: string, task: any) {
    // Fetch applicable rules
    const rules: AutoAssignRule[] = []; // Would fetch from database

    // Sort by priority
    rules.sort((a, b) => b.priority - a.priority);

    for (const rule of rules) {
      if (!rule.enabled) continue;

      const matches = this.evaluateAutoAssignConditions(rule.conditions, task);

      if (matches) {
        const assigneeId = await this.selectAssignee(rule.assignTo);

        if (assigneeId) {
          await this.prisma.task.update({
            where: { id: taskId },
            data: { assigneeId },
          });

          return { assigned: true, assigneeId, ruleId: rule.id };
        }
      }
    }

    return { assigned: false };
  }

  private evaluateAutoAssignConditions(conditions: any, task: any): boolean {
    if (!conditions) return true;

    // Check each condition
    if (conditions.taskTitle && !task.title.includes(conditions.taskTitle)) {
      return false;
    }

    if (
      conditions.taskDescription &&
      !task.description?.includes(conditions.taskDescription)
    ) {
      return false;
    }

    if (conditions.taskPriority && task.priority !== conditions.taskPriority) {
      return false;
    }

    if (conditions.taskStatus && task.status !== conditions.taskStatus) {
      return false;
    }

    if (conditions.keywords) {
      const text = `${task.title} ${task.description}`.toLowerCase();
      const hasKeyword = conditions.keywords.some((keyword: string) =>
        text.includes(keyword.toLowerCase()),
      );
      if (!hasKeyword) return false;
    }

    return true;
  }

  private async selectAssignee(assignTo: any): Promise<string | null> {
    switch (assignTo.type) {
      case 'specific_user':
        return assignTo.userIds?.[0] || null;

      case 'round_robin':
        // Implement round-robin logic
        return assignTo.userIds?.[0] || null;

      case 'least_busy':
        // Find user with least tasks
        if (!assignTo.userIds) return null;

        const users = await this.prisma.user.findMany({
          where: { id: { in: assignTo.userIds } },
          include: {
            tasks: {
              where: { status: { not: 'done' } },
            },
          },
        });

        const leastBusy = users.sort(
          (a, b) => a.tasks.length - b.tasks.length,
        )[0];

        return leastBusy?.id || null;

      case 'random':
        if (!assignTo.userIds || assignTo.userIds.length === 0) return null;
        const randomIndex = Math.floor(
          Math.random() * assignTo.userIds.length,
        );
        return assignTo.userIds[randomIndex];

      default:
        return null;
    }
  }
}
