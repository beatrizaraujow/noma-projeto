# Error Tracking Setup (PIL-001)

This project now includes baseline error capture for backend and frontend, with optional forwarding to an internal webhook.

## Implemented Components

- Backend global exception tracking filter:
  - `apps/api/src/common/filters/global-exception-tracking.filter.ts`
- Backend webhook sender helper:
  - `apps/api/src/common/monitoring/error-webhook.ts`
- Frontend error capture endpoint:
  - `POST /api/monitoring/frontend-error`
  - `apps/api/src/modules/monitoring/monitoring.controller.ts`
- Frontend browser listeners:
  - `apps/web/src/components/common/ErrorTrackingInitializer.tsx`

## Environment Variables

### API

- `ERROR_WEBHOOK_URL` (optional)
  - Slack or Discord incoming webhook URL.
  - If unset, errors are still logged in API logs as structured JSON.

- `APP_VERSION` (optional)
  - Release identifier for backend events.

### Web

- `NEXT_PUBLIC_APP_VERSION` (optional)
  - Release identifier included in frontend error reports.

- `NEXT_PUBLIC_API_URL` (required in production)
  - Must point to the public API base URL.

## Captured Context

### Backend exceptions

- `requestId`
- `method`
- `route`
- `statusCode`
- `userId`
- `workspaceId`
- `release`
- `timestamp`
- `stack`

### Frontend runtime errors

- `message`
- `stack` (when available)
- `route`
- `userId`
- `workspaceId`
- `release`
- `href` (current URL)
- `timestamp`
- `userAgent` and `ip` on API side

## Validation Checklist

1. Start web and api in development.
2. Trigger a backend error and check API logs for JSON payload from `GlobalExceptionTrackingFilter`.
3. Trigger a frontend error in browser console:
   - `setTimeout(() => { throw new Error('frontend test error'); }, 0)`
4. Confirm API receives `POST /api/monitoring/frontend-error` and logs structured payload.
5. If `ERROR_WEBHOOK_URL` is configured, confirm alert delivery in the channel.

## Troubleshooting

- No webhook alerts:
  - Verify `ERROR_WEBHOOK_URL` is configured in API environment.
  - Confirm webhook URL accepts JSON body.

- Frontend reports not arriving:
  - Verify `NEXT_PUBLIC_API_URL` points to the reachable API URL.
  - Check browser network tab for `POST /api/monitoring/frontend-error`.
