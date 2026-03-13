import { AnalyticsService } from './analytics.service';

describe('AnalyticsService signup metrics', () => {
  let service: AnalyticsService;

  const prismaMock: any = {
    workspace: {
      findFirst: jest.fn(),
    },
    auditLog: {
      findMany: jest.fn(),
    },
    project: {
      findMany: jest.fn(),
    },
    task: {
      findMany: jest.fn(),
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AnalyticsService(prismaMock);
  });

  it('denies signup metrics access when user is not a workspace member', async () => {
    prismaMock.workspace.findFirst.mockResolvedValue(null);

    await expect(service.getSignupMetrics('workspace-1', 'user-1', 30)).rejects.toThrow(
      'Access denied to workspace'
    );
  });

  it('aggregates signup metrics by method, source, day, and activation funnel', async () => {
    prismaMock.workspace.findFirst.mockResolvedValue({ id: 'workspace-1' });
    prismaMock.auditLog.findMany.mockResolvedValue([
      {
        userId: 'user-1',
        createdAt: new Date('2026-03-10T10:00:00.000Z'),
        metadata: {
          workspaceId: 'workspace-1',
          method: 'email',
          utmSource: 'ads',
        },
      },
      {
        userId: 'user-2',
        createdAt: new Date('2026-03-10T12:00:00.000Z'),
        metadata: {
          workspaceId: 'workspace-1',
          method: 'google',
          source: 'organic',
        },
      },
      {
        userId: 'user-3',
        createdAt: new Date('2026-03-11T09:00:00.000Z'),
        metadata: {
          workspaceId: 'workspace-1',
          method: 'email',
          inviteToken: 'invite-1',
        },
      },
      {
        userId: 'user-4',
        createdAt: new Date('2026-03-11T13:00:00.000Z'),
        metadata: {
          workspaceId: 'workspace-1',
          method: 'github',
        },
      },
      {
        userId: 'user-5',
        createdAt: new Date('2026-03-11T15:00:00.000Z'),
        metadata: {
          workspaceId: 'workspace-2',
          method: 'email',
          utmSource: 'ads',
        },
      },
    ]);
    prismaMock.project.findMany.mockResolvedValue([
      { ownerId: 'user-1' },
      { ownerId: 'user-3' },
    ]);
    prismaMock.task.findMany.mockResolvedValue([
      { assigneeId: 'user-1' },
      { assigneeId: 'user-2' },
      { assigneeId: null },
    ]);

    const result = await service.getSignupMetrics('workspace-1', 'member-1', 30);

    expect(result.periodDays).toBe(30);
    expect(result.totalSignups).toBe(4);
    expect(result.byMethod).toEqual({
      email: 2,
      google: 1,
      unknown: 1,
    });
    expect(result.bySource).toEqual(
      expect.arrayContaining([
        { source: 'ads', count: 1 },
        { source: 'organic', count: 1 },
        { source: 'invite', count: 1 },
        { source: 'unknown', count: 1 },
      ])
    );
    expect(result.bySource).toHaveLength(4);
    expect(result.daily).toEqual([
      { date: '2026-03-10', count: 2 },
      { date: '2026-03-11', count: 2 },
    ]);
    expect(result.activationFunnel).toEqual({
      signedUp: 4,
      createdProject: 2,
      firstTaskEngaged: 2,
      activationRate: 50,
    });
  });

  it('clamps days to 365 and keeps activation at zero when there are no signups', async () => {
    prismaMock.workspace.findFirst.mockResolvedValue({ id: 'workspace-1' });
    prismaMock.auditLog.findMany.mockResolvedValue([]);

    const result = await service.getSignupMetrics('workspace-1', 'member-1', 999);

    expect(result.periodDays).toBe(365);
    expect(result.totalSignups).toBe(0);
    expect(result.bySource).toEqual([]);
    expect(result.daily).toEqual([]);
    expect(result.activationFunnel).toEqual({
      signedUp: 0,
      createdProject: 0,
      firstTaskEngaged: 0,
      activationRate: 0,
    });
    expect(prismaMock.project.findMany).not.toHaveBeenCalled();
    expect(prismaMock.task.findMany).not.toHaveBeenCalled();
  });
});
