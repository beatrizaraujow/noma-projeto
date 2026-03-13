import { randomUUID } from 'crypto';
import { Request, Response, NextFunction } from 'express';

const REQUEST_ID_HEADER = 'x-request-id';

type RequestWithContext = Request & {
  requestId?: string;
};

function getIncomingRequestId(value: string | string[] | undefined): string {
  if (Array.isArray(value) && value[0]) {
    return value[0];
  }

  if (typeof value === 'string' && value.trim().length > 0) {
    return value.trim();
  }

  return randomUUID();
}

export function requestIdMiddleware(req: Request, res: Response, next: NextFunction): void {
  const requestId = getIncomingRequestId(req.headers[REQUEST_ID_HEADER]);

  (req as RequestWithContext).requestId = requestId;
  res.setHeader(REQUEST_ID_HEADER, requestId);

  next();
}
