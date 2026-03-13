# CSV Import Guide (PIL-008)

A basic CSV import flow is available for pilot onboarding data.

## API Endpoints

- `POST /api/imports/csv?entity=<projects|tasks|customers>&workspaceId=<id>`
  - Auth required (Bearer token)
  - Content type: `multipart/form-data`
  - File field: `file`

- `GET /api/imports/template?entity=<projects|tasks|customers>`
  - Auth required
  - Returns sample CSV template string in JSON response.

## Supported Entities

- `projects`: implemented and persisted
- `tasks`: implemented and persisted
- `customers`: currently not persisted (no customer entity in Prisma schema). Endpoint returns row-level rejection report.

## Templates

### projects

`name,description,color,icon`

### tasks

`title,description,project,priority,status,dueDate,assigneeEmail`

Notes:
- `project` accepts project name from same workspace.
- `dueDate` expects ISO-compatible date.
- `assigneeEmail` must belong to a workspace member.

### customers

`name,email,company,phone`

Currently used only for validation/reporting and roadmap alignment.

## UI

- Route: `apps/web/src/app/workspaces/[id]/import/page.tsx`
- Access from sidebar: `Importar CSV`
- Features:
  - entity selection
  - template download
  - CSV upload
  - result summary (`total/imported/rejected`)
  - row-level rejection table

## Response Format

```json
{
  "entity": "tasks",
  "workspaceId": "...",
  "totalRows": 10,
  "importedRows": 8,
  "rejectedRows": 2,
  "errors": [
    {
      "row": 4,
      "column": "project",
      "value": "Unknown Project",
      "message": "Project not found in this workspace"
    }
  ]
}
```
