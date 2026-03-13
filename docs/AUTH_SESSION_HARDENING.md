# Auth Session Hardening (PIL-005)

This document describes the session security hardening implemented for pilot readiness.

## Implemented

- Short-lived access token
  - Env: `JWT_ACCESS_EXPIRATION`
  - Default: `15m`

- Long-lived refresh token
  - Env: `JWT_REFRESH_EXPIRATION`
  - Default: `7d`
  - Optional dedicated secret: `JWT_REFRESH_SECRET` (falls back to `JWT_SECRET`)

- Refresh token rotation
  - Endpoint: `POST /api/auth/refresh`
  - Input: `{ "refresh_token": "..." }`
  - Behavior: old refresh token is revoked, new access+refresh tokens are issued.

- Logout invalidation
  - Endpoint: `POST /api/auth/logout`
  - Guarded by JWT access token.
  - Revokes current access token JTI and optional provided refresh token.

- Token revocation checks on guarded routes
  - JWT strategy rejects revoked tokens.
  - JWT strategy enforces token type `access`.

- Password policy for registration
  - Minimum 8 characters
  - At least 1 uppercase, 1 lowercase, and 1 number

- Frontend session behavior
  - NextAuth stores access and refresh token metadata.
  - Automatic refresh before access token expiry.
  - Signout triggers backend logout endpoint.

## Files Changed

- `apps/api/src/modules/auth/auth.service.ts`
- `apps/api/src/modules/auth/auth.controller.ts`
- `apps/api/src/modules/auth/auth.module.ts`
- `apps/api/src/modules/auth/strategies/jwt.strategy.ts`
- `apps/api/src/modules/auth/token-revocation.service.ts`
- `apps/web/src/app/api/auth/[...nextauth]/route.ts`
- `apps/web/src/app/(auth)/login/page.tsx`
- `apps/web/src/app/(auth)/signup/page.tsx`
- `apps/web/src/components/layout/Sidebar.tsx`
- `apps/web/src/types/next-auth.d.ts`

## Operational Note

Token revocation storage is currently in-memory for pilot speed. For multi-instance production, migrate revocation state to shared storage (Redis) to guarantee cross-instance invalidation.
