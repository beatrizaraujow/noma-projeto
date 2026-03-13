import { ForbiddenException } from '@nestjs/common';
import { IntegrationsService } from './integrations.service';

describe('IntegrationsService authorization', () => {
  let service: IntegrationsService;

  const prismaMock: any = {
    task: {
      findFirst: jest.fn(),
    },
    webhookEndpoint: {
      findFirst: jest.fn(),
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();

    service = new IntegrationsService(
      prismaMock,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
    );
  });

  it('denies task access when task is not in accessible workspace', async () => {
    prismaMock.task.findFirst.mockResolvedValue(null);

    await expect(service.assertTaskAccess('task-1', 'user-1')).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('denies webhook endpoint access when endpoint is not in accessible workspace', async () => {
    prismaMock.webhookEndpoint.findFirst.mockResolvedValue(null);

    await expect(service.assertWebhookEndpointAccess('endpoint-1', 'user-1')).rejects.toBeInstanceOf(ForbiddenException);
  });
});
