type ErrorWebhookPayload = {
  source: 'backend' | 'frontend';
  message: string;
  route?: string;
  method?: string;
  statusCode?: number;
  requestId?: string | null;
  userId?: string | null;
  workspaceId?: string | null;
  release?: string | null;
  timestamp: string;
  stack?: string | null;
};

function escapeForJson(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

export async function sendErrorWebhook(payload: ErrorWebhookPayload): Promise<void> {
  const webhookUrl = process.env.ERROR_WEBHOOK_URL;
  if (!webhookUrl) {
    return;
  }

  const statusCode = payload.statusCode ?? 'n/a';
  const route = payload.route ?? 'n/a';
  const userId = payload.userId ?? 'anonymous';
  const workspaceId = payload.workspaceId ?? 'n/a';
  const requestId = payload.requestId ?? 'n/a';
  const release = payload.release ?? 'n/a';

  const text =
    `[NOMA][${payload.source}] Error detected` +
    `\nmessage: ${payload.message}` +
    `\nstatus: ${statusCode}` +
    `\nroute: ${route}` +
    `\nuserId: ${userId}` +
    `\nworkspaceId: ${workspaceId}` +
    `\nrequestId: ${requestId}` +
    `\nrelease: ${release}` +
    `\ntimestamp: ${payload.timestamp}`;

  const key = webhookUrl.includes('discord.com/api/webhooks') ? 'content' : 'text';
  const body = `{\"${key}\":\"${escapeForJson(text)}\"}`;

  await fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body,
  });
}
