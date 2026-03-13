import { ForbiddenException } from '@nestjs/common';
import { WorkflowService } from './workflow.service';

describe('WorkflowService authorization', () => {
  let service: WorkflowService;

  const prismaMock: any = {
    workspaceMember: {
      findFirst: jest.fn(),
    },
    workflow: {
      findMany: jest.fn(),
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    service = new WorkflowService(prismaMock);
  });

  it('denies listWorkflows when user is not workspace member', async () => {
    prismaMock.workspaceMember.findFirst.mockResolvedValue(null);

    await expect(service.listWorkflows('workspace-1', 'user-1')).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('allows listWorkflows when user is workspace member', async () => {
    prismaMock.workspaceMember.findFirst.mockResolvedValue({ userId: 'user-1' });
    prismaMock.workflow.findMany.mockResolvedValue([]);

    await expect(service.listWorkflows('workspace-1', 'user-1')).resolves.toEqual([]);
  });
});
