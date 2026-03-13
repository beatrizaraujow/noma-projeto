export type SignupOrigin = {
  source?: string;
  utmSource?: string;
  campaign?: string;
  inviteToken?: string;
};

export const GOOGLE_SIGNUP_ORIGIN_COOKIE = 'noma_google_signup_origin';

const SOURCE_MAX_LENGTH = 64;
const FIELD_MAX_LENGTH = 160;

function sanitizeString(value: unknown, maxLength: number = FIELD_MAX_LENGTH): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }

  return trimmed.slice(0, maxLength);
}

export function normalizeSignupOrigin(value: unknown, fallbackSource?: string): SignupOrigin {
  const raw = typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};

  const source =
    sanitizeString(raw.source, SOURCE_MAX_LENGTH) ||
    sanitizeString(fallbackSource, SOURCE_MAX_LENGTH);
  const utmSource = sanitizeString(raw.utmSource);
  const campaign = sanitizeString(raw.campaign);
  const inviteToken = sanitizeString(raw.inviteToken);

  return {
    source,
    utmSource,
    campaign,
    inviteToken,
  };
}

export function hasSignupOrigin(origin: SignupOrigin | undefined): boolean {
  if (!origin) {
    return false;
  }

  return Boolean(origin.source || origin.utmSource || origin.campaign || origin.inviteToken);
}

export function buildSignupOriginFromSearchParams(
  searchParams: URLSearchParams,
  fallbackSource: string,
): SignupOrigin {
  return normalizeSignupOrigin({
    source: searchParams.get('source') || fallbackSource,
    utmSource: searchParams.get('utm_source') || undefined,
    campaign: searchParams.get('utm_campaign') || searchParams.get('campaign') || undefined,
    inviteToken: searchParams.get('invite') || searchParams.get('invite_token') || undefined,
  }, fallbackSource);
}

export function serializeSignupOriginCookie(origin: SignupOrigin): string {
  return encodeURIComponent(JSON.stringify(origin));
}

export function parseSignupOriginCookie(rawValue: string | undefined): SignupOrigin | undefined {
  if (!rawValue) {
    return undefined;
  }

  try {
    const decoded = decodeURIComponent(rawValue);
    const parsed = JSON.parse(decoded);
    const normalized = normalizeSignupOrigin(parsed);
    return hasSignupOrigin(normalized) ? normalized : undefined;
  } catch {
    return undefined;
  }
}

export async function persistGoogleSignupOrigin(origin: SignupOrigin): Promise<void> {
  if (typeof window === 'undefined' || !hasSignupOrigin(origin)) {
    return;
  }

  try {
    await fetch('/api/auth/google-origin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ origin }),
      keepalive: true,
    });
  } catch {
    // Never block auth flow because origin telemetry failed.
  }
}
