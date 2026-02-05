export class CreateIntegrationDto {
  workspaceId: string;
  type: 
    | 'slack' 
    | 'discord' 
    | 'email' 
    | 'google_calendar' 
    | 'outlook_calendar'
    | 'github'
    | 'figma'
    | 'google_drive'
    | 'dropbox'
    | 'zapier'
    | 'make'
    | 'custom_webhook';
  name: string;
  description?: string;
  active?: boolean;
  config: any; // Type-specific configuration
}

export class UpdateIntegrationDto {
  name?: string;
  description?: string;
  active?: boolean;
  config?: any;
}

export class TestIntegrationDto {
  message?: string;
  channel?: string;
}

// GitHub DTOs
export class LinkPRDto {
  integrationId: string;
  taskId: string;
  repository: string;
  prNumber: number;
}

export class SyncRepositoryDto {
  integrationId: string;
  repository: string;
}

// Figma DTOs
export class AttachFigmaFileDto {
  integrationId: string;
  fileKey: string;
  projectId?: string;
  taskId?: string;
}

export class SyncFigmaFileDto {
  integrationId: string;
  fileKey: string;
}

// Cloud Storage DTOs
export class AttachCloudFileDto {
  integrationId: string;
  fileId: string;
  projectId?: string;
  taskId?: string;
}

// Webhook DTOs
export class CreateWebhookDto {
  workspaceId: string;
  name: string;
  provider: 'zapier' | 'make' | 'custom';
  events: string[];
  description?: string;
}

export class UpdateWebhookDto {
  name?: string;
  description?: string;
  active?: boolean;
  events?: string[];
}

export class TriggerWebhookDto {
  workspaceId: string;
  event: string;
  payload: any;
}
