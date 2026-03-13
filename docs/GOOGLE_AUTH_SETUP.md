# Google Auth Setup (Collaborators)

This setup enables collaborator login/signup using Google OAuth while keeping API authorization based on backend-issued JWT tokens.

## What Was Implemented

- NextAuth Google provider enabled in:
  - `apps/web/src/app/api/auth/[...nextauth]/route.ts`
- Backend endpoint to exchange Google `id_token` for app tokens:
  - `POST /api/auth/google`
  - `apps/api/src/modules/auth/auth.controller.ts`
  - `apps/api/src/modules/auth/auth.service.ts`
- OAuth user upsert by email (create/update name/avatar):
  - `apps/api/src/modules/users/users.service.ts`
- Login and signup pages now call `signIn('google')`:
  - `apps/web/src/app/(auth)/login/page.tsx`
  - `apps/web/src/app/(auth)/signup/page.tsx`

## Required Environment Variables

### Web (`apps/web`)

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- Alternative names also supported: `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL` (e.g. `http://localhost:3000`)
- `NEXT_PUBLIC_API_URL` (e.g. `http://localhost:3001`)

### API (`apps/api`)

- `GOOGLE_CLIENT_ID`
- Alternative name also supported: `AUTH_GOOGLE_ID`
- `JWT_SECRET`
- `JWT_REFRESH_SECRET` (recommended)
- `JWT_ACCESS_EXPIRATION` (recommended `15m`)
- `JWT_REFRESH_EXPIRATION` (recommended `7d`)

## Google Console Configuration

1. Create OAuth 2.0 Client ID (Web application).
2. Authorized redirect URI must include:
   - `http://localhost:3000/api/auth/callback/google`
   - your production callback URL equivalent.
3. Ensure OAuth consent screen is configured and published for intended users.

## Collaborator Invite Flow

- Invite page redirects unauthenticated users to:
  - `/login?callbackUrl=/invite?token=...`
- Login page now preserves `callbackUrl` for both credentials and Google.
- After Google sign-in, collaborator returns to invite accept page and can join workspace.

## Security Notes

- Backend validates Google `id_token` via Google tokeninfo endpoint.
- Backend checks token audience (`aud`) against `GOOGLE_CLIENT_ID` when configured.
- Only verified Google emails are accepted.
