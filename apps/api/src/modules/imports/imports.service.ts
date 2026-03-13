import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { WorkspacesService } from '../workspaces/workspaces.service';

type ImportEntity = 'projects' | 'tasks' | 'customers';

type RowError = {
  row: number;
  column?: string;
  value?: string;
  message: string;
};

type ImportResult = {
  entity: ImportEntity;
  workspaceId: string;
  totalRows: number;
  importedRows: number;
  rejectedRows: number;
  errors: RowError[];
};

@Injectable()
export class ImportsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly workspacesService: WorkspacesService,
  ) {}

  async importCsv(params: {
    entity: ImportEntity;
    workspaceId: string;
    userId: string;
    csvContent: string;
  }): Promise<ImportResult> {
    const { entity, workspaceId, userId, csvContent } = params;

    await this.assertWorkspaceAccess(workspaceId, userId);

    const rows = this.parseCsv(csvContent);
    if (rows.length === 0) {
      throw new BadRequestException('CSV is empty');
    }

    switch (entity) {
      case 'projects':
        return this.importProjects(workspaceId, userId, rows);
      case 'tasks':
        return this.importTasks(workspaceId, rows);
      case 'customers':
        return this.importCustomers(workspaceId, rows);
      default:
        throw new BadRequestException('Unsupported entity');
    }
  }

  getTemplate(entity: ImportEntity): string {
    switch (entity) {
      case 'projects':
        return 'name,description,color,icon\nWebsite Revamp,Projeto de redesign,#f97316,rocket\n';
      case 'tasks':
        return 'title,description,project,priority,status,dueDate,assigneeEmail\nCriar wireframes,Tela inicial e dashboard,Website Revamp,HIGH,TODO,2026-03-20,designer@empresa.com\n';
      case 'customers':
        return 'name,email,company,phone\nAna Souza,ana@empresa.com,Empresa X,+55 11 99999-9999\n';
      default:
        throw new BadRequestException('Unsupported entity');
    }
  }

  private async importProjects(workspaceId: string, userId: string, rows: Array<Record<string, string>>): Promise<ImportResult> {
    const result: ImportResult = {
      entity: 'projects',
      workspaceId,
      totalRows: rows.length,
      importedRows: 0,
      rejectedRows: 0,
      errors: [],
    };

    for (let i = 0; i < rows.length; i++) {
      const rowNumber = i + 2;
      const row = rows[i];
      const name = (row.name || '').trim();

      if (!name) {
        result.rejectedRows++;
        result.errors.push({
          row: rowNumber,
          column: 'name',
          value: row.name,
          message: 'Project name is required',
        });
        continue;
      }

      try {
        await this.prisma.project.create({
          data: {
            workspaceId,
            ownerId: userId,
            name,
            description: (row.description || '').trim() || undefined,
            color: (row.color || '').trim() || undefined,
            icon: (row.icon || '').trim() || undefined,
          },
        });

        result.importedRows++;
      } catch (error) {
        result.rejectedRows++;
        result.errors.push({
          row: rowNumber,
          message: `Failed to import project: ${String(error)}`,
        });
      }
    }

    return result;
  }

  private async importTasks(workspaceId: string, rows: Array<Record<string, string>>): Promise<ImportResult> {
    const result: ImportResult = {
      entity: 'tasks',
      workspaceId,
      totalRows: rows.length,
      importedRows: 0,
      rejectedRows: 0,
      errors: [],
    };

    const projects = await this.prisma.project.findMany({
      where: { workspaceId },
      select: { id: true, name: true },
    });

    const projectsByName = new Map(projects.map((project) => [project.name.trim().toLowerCase(), project.id]));
    const projectsById = new Map(projects.map((project) => [project.id, project.id]));

    for (let i = 0; i < rows.length; i++) {
      const rowNumber = i + 2;
      const row = rows[i];

      const title = (row.title || '').trim();
      const projectRef = (row.projectId || row.project || row.projectName || '').trim();
      const description = (row.description || '').trim() || undefined;
      const priority = this.normalizePriority((row.priority || '').trim());
      const status = this.normalizeStatus((row.status || '').trim());

      if (!title) {
        result.rejectedRows++;
        result.errors.push({
          row: rowNumber,
          column: 'title',
          value: row.title,
          message: 'Task title is required',
        });
        continue;
      }

      if (!projectRef) {
        result.rejectedRows++;
        result.errors.push({
          row: rowNumber,
          column: 'project',
          value: row.project,
          message: 'Project reference is required (project or projectId)',
        });
        continue;
      }

      const projectId = projectsById.get(projectRef) || projectsByName.get(projectRef.toLowerCase());
      if (!projectId) {
        result.rejectedRows++;
        result.errors.push({
          row: rowNumber,
          column: 'project',
          value: projectRef,
          message: 'Project not found in this workspace',
        });
        continue;
      }

      const dueDateRaw = (row.dueDate || '').trim();
      let dueDate: Date | undefined;
      if (dueDateRaw) {
        const parsed = new Date(dueDateRaw);
        if (Number.isNaN(parsed.getTime())) {
          result.rejectedRows++;
          result.errors.push({
            row: rowNumber,
            column: 'dueDate',
            value: dueDateRaw,
            message: 'Invalid dueDate. Expected ISO date format',
          });
          continue;
        }
        dueDate = parsed;
      }

      let assigneeId: string | undefined;
      const assigneeEmail = (row.assigneeEmail || '').trim();
      if (assigneeEmail) {
        const user = await this.prisma.user.findUnique({
          where: { email: assigneeEmail },
          select: { id: true },
        });

        if (!user) {
          result.rejectedRows++;
          result.errors.push({
            row: rowNumber,
            column: 'assigneeEmail',
            value: assigneeEmail,
            message: 'Assignee email not found',
          });
          continue;
        }

        const membership = await this.prisma.workspaceMember.findFirst({
          where: {
            workspaceId,
            userId: user.id,
          },
          select: { id: true },
        });

        if (!membership) {
          result.rejectedRows++;
          result.errors.push({
            row: rowNumber,
            column: 'assigneeEmail',
            value: assigneeEmail,
            message: 'Assignee is not a member of this workspace',
          });
          continue;
        }

        assigneeId = user.id;
      }

      const maxPosition = await this.prisma.task.findFirst({
        where: {
          projectId,
          status,
        },
        orderBy: {
          position: 'desc',
        },
        select: { position: true },
      });

      try {
        await this.prisma.task.create({
          data: {
            title,
            description,
            projectId,
            assigneeId,
            priority,
            status,
            dueDate,
            position: (maxPosition?.position || 0) + 1,
          },
        });

        result.importedRows++;
      } catch (error) {
        result.rejectedRows++;
        result.errors.push({
          row: rowNumber,
          message: `Failed to import task: ${String(error)}`,
        });
      }
    }

    return result;
  }

  private async importCustomers(workspaceId: string, rows: Array<Record<string, string>>): Promise<ImportResult> {
    return {
      entity: 'customers',
      workspaceId,
      totalRows: rows.length,
      importedRows: 0,
      rejectedRows: rows.length,
      errors: rows.map((_, index) => ({
        row: index + 2,
        message: 'Customer import is not available because no customer entity exists in current data model',
      })),
    };
  }

  private parseCsv(input: string): Array<Record<string, string>> {
    const lines = input
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    if (lines.length === 0) {
      return [];
    }

    const headers = this.parseCsvLine(lines[0]).map((header) => header.trim());

    return lines.slice(1).map((line) => {
      const columns = this.parseCsvLine(line);
      const row: Record<string, string> = {};

      for (let i = 0; i < headers.length; i++) {
        row[headers[i]] = (columns[i] || '').trim();
      }

      return row;
    });
  }

  private parseCsvLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const next = line[i + 1];

      if (char === '"') {
        if (inQuotes && next === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
        continue;
      }

      if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
        continue;
      }

      current += char;
    }

    result.push(current);
    return result;
  }

  private normalizePriority(raw: string): string {
    const value = raw.toUpperCase();
    if (['LOW', 'MEDIUM', 'HIGH', 'URGENT'].includes(value)) {
      return value;
    }
    return 'MEDIUM';
  }

  private normalizeStatus(raw: string): string {
    const normalized = raw.toUpperCase().replace('-', '_').replace(' ', '_');
    const map: Record<string, string> = {
      TODO: 'TODO',
      IN_PROGRESS: 'IN_PROGRESS',
      INPROGRESS: 'IN_PROGRESS',
      DOING: 'IN_PROGRESS',
      DONE: 'DONE',
      COMPLETED: 'DONE',
      BLOCKED: 'BLOCKED',
    };

    return map[normalized] || 'TODO';
  }

  private async assertWorkspaceAccess(workspaceId: string, userId: string): Promise<void> {
    const role = await this.workspacesService.getMemberRole(workspaceId, userId);
    if (!role) {
      throw new ForbiddenException('Access denied for this workspace');
    }
  }
}
