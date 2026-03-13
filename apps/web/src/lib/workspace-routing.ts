type WorkspaceLike = {
  id?: string | number;
};

const toWorkspaceId = (value: unknown): string | null => {
  if (typeof value === 'string' && value.trim().length > 0) {
    return value;
  }

  if (typeof value === 'number') {
    return String(value);
  }

  return null;
};

const firstWorkspaceIdFromArray = (items: unknown[]): string | null => {
  if (items.length === 0) {
    return null;
  }

  const first = items[0] as WorkspaceLike;
  return toWorkspaceId(first?.id);
};

export const getSessionWorkspaceId = (session: unknown): string | null => {
  if (!session || typeof session !== 'object') {
    return null;
  }

  const candidate = (session as { workspace?: WorkspaceLike }).workspace?.id;
  return toWorkspaceId(candidate);
};

export const extractWorkspaceId = (payload: unknown): string | null => {
  if (Array.isArray(payload)) {
    return firstWorkspaceIdFromArray(payload);
  }

  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const data = payload as {
    id?: string | number;
    items?: unknown[];
    data?: unknown[];
    workspaces?: unknown[];
  };

  if (Array.isArray(data.items)) {
    return firstWorkspaceIdFromArray(data.items);
  }

  if (Array.isArray(data.data)) {
    return firstWorkspaceIdFromArray(data.data);
  }

  if (Array.isArray(data.workspaces)) {
    return firstWorkspaceIdFromArray(data.workspaces);
  }

  return toWorkspaceId(data.id);
};

export async function resolveWorkspaceIdFromApi(): Promise<string | null> {
  try {
    const response = await fetch('/api/workspaces', {
      method: 'GET',
      cache: 'no-store',
    });

    if (!response.ok) {
      return null;
    }

    const payload = await response.json().catch(() => null);
    return extractWorkspaceId(payload);
  } catch {
    return null;
  }
}
