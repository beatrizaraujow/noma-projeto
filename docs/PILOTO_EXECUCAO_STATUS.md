# Pilot Execution Status

Tracking file for real-user pilot readiness.

## Current Phase

- Date: 2026-03-06
- Scope: Production foundations (P0)
- Rollout status: Not released to external pilot users yet

## Completed Today

- [x] Added `x-request-id` middleware in API bootstrap.
- [x] Added structured request logging interceptor with JSON payload.
- [x] Added health check database probe (`SELECT 1`) with `healthy` or `degraded` status.
- [x] Validated API build after changes.
- [x] Protected integrations endpoints with JWT guard (except incoming external webhooks).
- [x] Added workspace membership checks in integrations routes for query/body workspace IDs.
- [x] Added task/workhook endpoint access assertions to prevent cross-workspace reads.
- [x] Added workflow authorization checks by workspace membership for create/read/update/delete/execute.
- [x] Prevented spoofing of `createdBy` in workflow creation endpoints by enforcing authenticated user ID.
- [x] Secured invites listing/revocation/creation with workspace membership checks.
- [x] Enabled JWT guard across permissions routes and fixed auth identity usage (`userId`).
- [x] Secured attachments list/download/upload with workspace-scoped access validation.
- [x] Scoped automation bulk actions to tasks accessible by authenticated user.
- [x] Added automated cross-workspace denial tests for key authorization paths.
- [x] Implemented onboarding guided flow with 3 steps (welcome -> workspace -> first project).
- [x] Wired onboarding creation calls to authenticated API client (`workspaces` and `projects`).
- [x] Added onboarding progress persistence and resume via `localStorage`.
- [x] Added activation funnel instrumentation in web app (`signup_completed`, `workspace_created`, `project_created`, `onboarding_completed`).
- [x] Added `first_task_created` instrumentation at centralized task creation point (`POST /api/tasks` response interceptor).
- [x] Added dashboard funnel consumer widget to visualize activation conversion from buffered analytics events.
- [x] Added external uptime monitor workflow (`.github/workflows/uptime-monitor.yml`) with 5-minute checks against `/api/health`.
- [x] Added uptime monitor setup guide (`docs/UPTIME_MONITOR_SETUP.md`) with webhook alert wiring.
- [x] Added backend global exception tracking filter with request context and optional webhook forwarding.
- [x] Added frontend runtime error capture (`window.error` and `unhandledrejection`) posting to `/api/monitoring/frontend-error`.
- [x] Added error tracking setup and troubleshooting guide (`docs/ERROR_TRACKING_SETUP.md`).
- [x] Hardened auth sessions with short-lived access token + refresh rotation + logout invalidation endpoints.
- [x] Integrated NextAuth automatic token refresh and backend-aware signout.
- [x] Replaced hardcoded login flow with credentials auth and real backend registration endpoint.
- [x] Added password policy enforcement on API registration (upper, lower, number, min length).
- [x] Added auth session hardening technical guide (`docs/AUTH_SESSION_HARDENING.md`).
- [x] Added activation checklist widget in dashboard with real-time completion tracking for project, first task, and first invite.
- [x] Replaced static dashboard `demo-token` with real session access token.
- [x] Implemented password reset flow (`forgot-password` and `reset-password`) with same password policy used in registration.
- [x] Implemented CSV import API (`/api/imports/csv`) for projects and tasks with row-level validation report.
- [x] Implemented CSV template endpoint (`/api/imports/template`) and import UI at workspace route (`/workspaces/[id]/import`).
- [x] Added CSV import operational guide (`docs/CSV_IMPORT_GUIDE.md`).
- [x] Enabled Google OAuth login/signup for collaborators with backend token exchange (`/api/auth/google`).
- [x] Updated auth screens to use `signIn('google')` with callback preservation for invite flow.
- [x] Added Google auth setup guide (`docs/GOOGLE_AUTH_SETUP.md`).

## In Progress

- [ ] Set production `HEALTHCHECK_URL` and `ALERT_WEBHOOK_URL` in GitHub Actions secrets/variables.
- [ ] Set production `ERROR_WEBHOOK_URL` and release vars (`APP_VERSION`, `NEXT_PUBLIC_APP_VERSION`).
- [ ] Move token revocation store from in-memory to shared storage (Redis) for multi-instance deployments.
- [ ] Add persistent customer entity/model to fully support `customers` CSV import (currently returns explicit row-level rejection).

## Next Steps (Immediate)

- [x] Add/confirm auth guards in every critical controller route.
- [x] Add authorization tests for cross-workspace access denial.
- [ ] Set `HEALTHCHECK_URL` and `ALERT_WEBHOOK_URL` in GitHub Actions and run the workflow once.
- [ ] Set `ERROR_WEBHOOK_URL` in API production environment and validate one test alert.
- [ ] Run a controlled failure drill to validate alert delivery under 5 minutes.

## Go or No-Go Snapshot

- Endpoint authorization isolation: In progress
- Session hardening (PIL-005): Completed
- Critical error observability: Partial (capture and webhook wiring implemented, production env vars pending)
- Health and uptime: Partial (external monitor implemented, production secrets and drill pending)
- Activation onboarding funnel: Partial (instrumentation, funnel widget, and checklist widget implemented)
- CSV import quality gates: Partial (projects/tasks import ready; customers entity pending)
