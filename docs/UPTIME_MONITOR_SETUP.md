# Uptime Monitor Setup (PIL-003)

This setup creates an external uptime monitor using GitHub Actions and alerts an internal channel via webhook.

## What Was Added

- Workflow: `.github/workflows/uptime-monitor.yml`
- Schedule: every 5 minutes (`*/5 * * * *`)
- Health endpoint check: expects HTTP `200` and JSON `"status": "healthy"`
- Alert support: Slack or Discord incoming webhook

## Required Repository Configuration

Set these in GitHub repository settings.

1. Repository variable
- Name: `HEALTHCHECK_URL`
- Example value: `https://api.seu-dominio.com/api/health`

2. Repository secret
- Name: `ALERT_WEBHOOK_URL`
- Value: incoming webhook URL (Slack or Discord)

## Steps

1. Open GitHub repository settings.
2. Go to `Settings > Secrets and variables > Actions`.
3. Add variable `HEALTHCHECK_URL`.
4. Add secret `ALERT_WEBHOOK_URL`.
5. Go to `Actions > Uptime Monitor` and run `Run workflow` once.
6. Confirm successful run and verify alert behavior by temporarily setting an invalid URL.

## Operational Notes

- On failure, the workflow fails and sends a webhook alert (if configured).
- If `ALERT_WEBHOOK_URL` is missing, the workflow logs a warning but cannot notify externally.
- Keep `HEALTHCHECK_URL` publicly reachable from GitHub-hosted runners.

## Acceptance Mapping (PIL-003)

- External uptime monitor configured: yes (GitHub Actions schedule).
- Alert channel configured: yes, after setting `ALERT_WEBHOOK_URL`.
- Alert in <= 5 minutes: supported by 5-minute schedule.
