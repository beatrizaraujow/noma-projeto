import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { AttachmentsService } from './attachments.service';

describe('AttachmentsService authorization', () => {
  let service: AttachmentsService;

  const prismaMock: any = {
    task: {
      findFirst: jest.fn(),
    },
    comment: {
      findUnique: jest.fn(),
    },
    attachment: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AttachmentsService(prismaMock);
  });

  it('denies listing attachments by task for inaccessible workspace', async () => {
    prismaMock.task.findFirst.mockResolvedValue(null);

    await expect(service.findByTask('task-1', 'user-1')).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('denies listing attachments by comment for inaccessible workspace', async () => {
    prismaMock.comment.findUnique.mockResolvedValue({ taskId: 'task-1' });
    prismaMock.task.findFirst.mockResolvedValue(null);

    await expect(service.findByComment('comment-1', 'user-1')).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('denies download path for inaccessible workspace', async () => {
    prismaMock.attachment.findFirst.mockResolvedValue({
      taskId: 'task-1',
      comment: null,
    });
    prismaMock.task.findFirst.mockResolvedValue(null);

    await expect(service.getAuthorizedFilePath('x.png', 'user-1')).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('throws not found when comment does not exist', async () => {
    prismaMock.comment.findUnique.mockResolvedValue(null);

    await expect(service.findByComment('missing-comment', 'user-1')).rejects.toBeInstanceOf(NotFoundException);
  });
});
