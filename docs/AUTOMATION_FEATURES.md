# Automation Features - Complete Guide

## Overview
Comprehensive automation system to streamline workflows, reduce manual work, and increase team productivity through intelligent triggers, templates, and rules.

## Features Implemented

### ✅ 1. Automation Triggers
Automatically execute actions when specific events occur in your workspace.

**Component**: `TriggerManager.tsx`

**Events Supported**:
- `task_created` - When a new task is created
- `task_updated` - When a task is modified
- `task_moved` - When a task status/position changes
- `task_completed` - When a task is marked as done
- `task_deleted` - When a task is removed

**Conditions**:
- Field-based matching (status, priority, title, etc.)
- Operators: equals, contains, changed_to, changed_from
- Supports any task field

**Actions Available**:
- `update_field` - Change any task field
- `assign_user` - Automatically assign task to user
- `add_comment` - Post automated comment
- `create_task` - Create follow-up task
- `send_notification` - Send notification to user/team

**API Endpoint**: `POST /automation/triggers`
```json
{
  "workspaceId": "workspace-id",
  "projectId": "project-id",
  "name": "Auto-prioritize urgent tasks",
  "enabled": true,
  "event": "task_moved",
  "conditions": {
    "field": "status",
    "operator": "changed_to",
    "value": "in_progress"
  },
  "actions": [
    {
      "type": "update_field",
      "config": {
        "field": "priority",
        "value": "high"
      }
    },
    {
      "type": "add_comment",
      "config": {
        "message": "Task automatically prioritized"
      }
    }
  ]
}
```

**Example Use Cases**:
- When task status changes to "done" → create follow-up task
- When task title contains "bug" → assign to QA team
- When task priority is "high" → send notification to manager
- When task is overdue → update priority to "urgent"

---

### ✅ 2. Project Templates
Pre-configured project structures with tasks, allowing quick project setup.

**Component**: `ProjectTemplates.tsx`

**Built-in Templates**:
1. **Software Development Sprint** 🚀
   - Sprint Planning
   - Daily Standups
   - Sprint Review
   - Sprint Retrospective

2. **Marketing Campaign** 📢
   - Define Campaign Goals
   - Create Content
   - Schedule Posts
   - Monitor Analytics

3. **Product Launch** 🎯
   - Product Development
   - Marketing Materials
   - Beta Testing
   - Public Launch

**API Endpoints**:
```bash
# Get all templates
GET /automation/templates?workspaceId=xxx

# Apply template to project
POST /automation/templates/{templateId}/apply
{
  "projectId": "project-id"
}
```

**Response**:
```json
{
  "template": "Software Development Sprint",
  "tasksCreated": 4,
  "tasks": [
    {
      "id": "task-1",
      "title": "Sprint Planning",
      "status": "todo",
      "priority": "high"
    }
  ]
}
```

**Features**:
- Task templates with predefined titles, descriptions
- Auto-assign based on email
- Set due dates relative to start (e.g., +14 days)
- Pre-configured priorities and statuses
- Categorized templates (Development, Marketing, Product, etc.)

---

### ✅ 3. Recurring Tasks
Automatically create tasks on a schedule (daily, weekly, monthly, yearly).

**Component**: `RecurringTasks.tsx`

**Frequency Options**:
- **Daily**: Every 1+ days
- **Weekly**: Every 1+ weeks (with day of week selection)
- **Monthly**: Every 1+ months (with day of month selection)
- **Yearly**: Every 1+ years

**API Endpoint**: `POST /automation/recurring-tasks`
```json
{
  "projectId": "project-id",
  "title": "Weekly team standup",
  "description": "Review progress and blockers",
  "frequency": "weekly",
  "interval": 1,
  "dayOfWeek": 1,
  "startDate": "2026-02-03T00:00:00.000Z",
  "enabled": true,
  "taskTemplate": {
    "priority": "medium",
    "status": "todo",
    "assigneeId": "user-id"
  }
}
```

**Features**:
- Configurable start and end dates
- Task template with priority, status, assignee
- Enable/disable without deleting
- Interval support (e.g., every 2 weeks, every 3 months)
- Runs via cron job (daily at midnight)

**Example Use Cases**:
- Weekly team standups
- Monthly reports
- Quarterly reviews
- Daily reminders
- Bi-weekly sprints

---

### ✅ 4. Bulk Actions
Perform actions on multiple tasks simultaneously.

**Component**: `BulkActions.tsx`

**Actions Supported**:
- **Update Status** - Change status for multiple tasks
- **Update Priority** - Bulk update priority
- **Assign** - Assign multiple tasks to user
- **Move Project** - Transfer tasks to another project
- **Delete** - Remove multiple tasks (with confirmation)
- **Add Tag** - Tag multiple tasks at once

**API Endpoint**: `POST /automation/bulk-actions`
```json
{
  "action": "update_status",
  "taskIds": ["task-1", "task-2", "task-3"],
  "data": {
    "status": "in_progress"
  }
}
```

**Response**:
```json
{
  "success": 3,
  "failed": 0,
  "errors": []
}
```

**Features**:
- Select multiple tasks via checkbox
- Preview affected tasks before execution
- Success/failure reporting per task
- Rollback on partial failure (optional)
- Confirmation for destructive actions (delete)

**Example Workflows**:
- Select all "todo" tasks → move to "in_progress"
- Select completed tasks → assign to reviewer
- Select old tasks → move to archive project
- Select urgent tasks → update priority to "high"

---

### ✅ 5. Auto-Assign Rules
Automatically assign tasks to team members based on conditions.

**Component**: `AutoAssignRules.tsx`

**Assignment Strategies**:
- **Specific User** - Always assign to specific user(s)
- **Round Robin** - Distribute equally among team
- **Least Busy** - Assign to user with fewest active tasks
- **Random** - Random assignment from pool

**Condition Types**:
- Task title contains text
- Task description contains text
- Task priority matches
- Task status matches
- Keywords present in task

**API Endpoint**: `POST /automation/auto-assign-rules`
```json
{
  "workspaceId": "workspace-id",
  "name": "Assign bugs to QA team",
  "enabled": true,
  "priority": 10,
  "conditions": {
    "taskTitle": "bug",
    "taskPriority": "high",
    "keywords": ["critical", "production"]
  },
  "assignTo": {
    "type": "least_busy",
    "userIds": ["qa-user-1", "qa-user-2", "qa-user-3"]
  }
}
```

**Rule Priority**:
- Rules are evaluated in order of priority (1-10, higher = first)
- First matching rule assigns the task
- Subsequent rules are skipped

**Features**:
- Multiple conditions (AND logic)
- Keyword matching in title + description
- Priority-based evaluation
- Enable/disable without deleting
- Applies to new tasks automatically

**Example Rules**:
- Tasks with "bug" → assign to QA team (round robin)
- Tasks with "urgent" + "high priority" → assign to lead developer
- Tasks with "frontend" → assign to frontend team (least busy)
- Tasks with "design" → assign to designer

---

## Backend Architecture

### Module Structure
```
apps/api/src/modules/automation/
├── automation.module.ts
├── automation.controller.ts
└── automation.service.ts
```

### Key Services
- `AutomationService` - Core automation logic
- `executeTrigger()` - Process trigger events
- `applyProjectTemplate()` - Create tasks from template
- `processRecurringTasks()` - Cron job for recurring tasks
- `executeBulkAction()` - Batch task operations
- `applyAutoAssignRules()` - Auto-assignment logic

### Dependencies
```json
{
  "@nestjs/schedule": "^4.0.0" // For cron jobs
}
```

---

## Frontend Components

### 1. TriggerManager
```tsx
import TriggerManager from '@/components/TriggerManager';

<TriggerManager
  workspaceId={workspace.id}
  projectId={project.id}
  token={userToken}
/>
```

### 2. ProjectTemplates
```tsx
import ProjectTemplates from '@/components/ProjectTemplates';

<ProjectTemplates
  workspaceId={workspace.id}
  token={userToken}
  onApplyTemplate={(templateId, projectId) => {
    console.log('Template applied!');
  }}
/>
```

### 3. RecurringTasks
```tsx
import RecurringTasks from '@/components/RecurringTasks';

<RecurringTasks
  projectId={project.id}
  token={userToken}
/>
```

### 4. BulkActions
```tsx
import BulkActions from '@/components/BulkActions';

<BulkActions
  selectedTaskIds={selectedTasks}
  token={userToken}
  onActionComplete={() => {
    // Refresh task list
    reloadTasks();
  }}
/>
```

### 5. AutoAssignRules
```tsx
import AutoAssignRules from '@/components/AutoAssignRules';

<AutoAssignRules
  workspaceId={workspace.id}
  projectId={project.id}
  token={userToken}
/>
```

---

## API Reference

### Triggers
- `POST /automation/triggers` - Create trigger
- `GET /automation/triggers?workspaceId=xxx` - List triggers
- `PUT /automation/triggers/:id` - Update trigger
- `DELETE /automation/triggers/:id` - Delete trigger

### Templates
- `POST /automation/templates` - Create template
- `GET /automation/templates?workspaceId=xxx` - List templates
- `POST /automation/templates/:id/apply` - Apply template

### Recurring Tasks
- `POST /automation/recurring-tasks` - Create recurring task
- `GET /automation/recurring-tasks?projectId=xxx` - List recurring tasks
- `PUT /automation/recurring-tasks/:id` - Update recurring task
- `DELETE /automation/recurring-tasks/:id` - Delete recurring task

### Bulk Actions
- `POST /automation/bulk-actions` - Execute bulk action

### Auto-Assign Rules
- `POST /automation/auto-assign-rules` - Create rule
- `GET /automation/auto-assign-rules?workspaceId=xxx` - List rules
- `PUT /automation/auto-assign-rules/:id` - Update rule
- `DELETE /automation/auto-assign-rules/:id` - Delete rule
- `POST /automation/auto-assign-rules/apply/:taskId` - Apply rules to task

---

## Integration Examples

### Add to Project Settings Page
```tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TriggerManager from '@/components/TriggerManager';
import RecurringTasks from '@/components/RecurringTasks';
import AutoAssignRules from '@/components/AutoAssignRules';

export default function ProjectSettings({ project }) {
  return (
    <Tabs defaultValue="general">
      <TabsList>
        <TabsTrigger value="general">General</TabsTrigger>
        <TabsTrigger value="automation">Automation</TabsTrigger>
      </TabsList>

      <TabsContent value="automation" className="space-y-6">
        <TriggerManager
          workspaceId={project.workspaceId}
          projectId={project.id}
          token={token}
        />

        <RecurringTasks
          projectId={project.id}
          token={token}
        />

        <AutoAssignRules
          workspaceId={project.workspaceId}
          projectId={project.id}
          token={token}
        />
      </TabsContent>
    </Tabs>
  );
}
```

### Add Bulk Actions to Task List
```tsx
import { useState } from 'react';
import BulkActions from '@/components/BulkActions';

export default function TaskList({ tasks }) {
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);

  const handleSelectTask = (taskId: string, selected: boolean) => {
    if (selected) {
      setSelectedTaskIds([...selectedTaskIds, taskId]);
    } else {
      setSelectedTaskIds(selectedTaskIds.filter(id => id !== taskId));
    }
  };

  return (
    <div>
      {selectedTaskIds.length > 0 && (
        <BulkActions
          selectedTaskIds={selectedTaskIds}
          token={token}
          onActionComplete={() => {
            setSelectedTaskIds([]);
            reloadTasks();
          }}
        />
      )}

      {tasks.map(task => (
        <TaskRow
          key={task.id}
          task={task}
          onSelect={(selected) => handleSelectTask(task.id, selected)}
        />
      ))}
    </div>
  );
}
```

### Add Templates to New Project Modal
```tsx
import ProjectTemplates from '@/components/ProjectTemplates';

export default function NewProjectModal() {
  const [showTemplates, setShowTemplates] = useState(false);

  return (
    <Modal>
      <Button onClick={() => setShowTemplates(true)}>
        Start from Template
      </Button>

      {showTemplates && (
        <ProjectTemplates
          workspaceId={workspace.id}
          token={token}
          onApplyTemplate={(templateId, projectId) => {
            // Navigate to new project
            router.push(`/projects/${projectId}`);
          }}
        />
      )}
    </Modal>
  );
}
```

---

## Best Practices

### Triggers
- Keep triggers simple and focused
- Test triggers in development first
- Use descriptive names
- Avoid circular trigger loops
- Monitor trigger execution logs

### Templates
- Create templates for common workflows
- Keep task counts reasonable (< 50 tasks)
- Use clear, actionable task titles
- Set realistic due date offsets
- Include descriptions with context

### Recurring Tasks
- Set appropriate start dates
- Use end dates to prevent infinite recurrence
- Test frequency before enabling
- Assign default owners
- Monitor for duplicate tasks

### Bulk Actions
- Always preview selection before executing
- Use confirmation for destructive actions
- Start with small batches for testing
- Keep action logs for audit trail

### Auto-Assign Rules
- Order rules by priority carefully
- Test rule matching logic
- Avoid overlapping rules
- Balance workload distribution
- Update rules as team changes

---

## Troubleshooting

### Triggers Not Firing
- Check trigger is enabled
- Verify event name matches
- Test condition logic
- Check action configuration
- Review service logs

### Templates Not Applying
- Verify project ID exists
- Check user permissions
- Ensure assignee emails are valid
- Verify workspace access

### Recurring Tasks Not Created
- Check cron job is running
- Verify task is enabled
- Check start date is in past
- Review end date if set
- Check project still exists

### Bulk Actions Failing
- Verify task IDs are valid
- Check user permissions on tasks
- Ensure required fields are provided
- Review error messages in response

### Auto-Assign Not Working
- Check rule is enabled
- Verify rule priority
- Test condition matching
- Ensure user IDs are valid
- Check user pool is not empty

---

## Future Enhancements

### Planned Features
- [ ] Trigger chains (trigger → trigger)
- [ ] Custom template sharing marketplace
- [ ] More recurring patterns (business days, specific dates)
- [ ] Bulk action undo
- [ ] ML-powered auto-assign (learn from history)
- [ ] Workflow automation builder (visual)
- [ ] Time-based triggers (schedule actions)
- [ ] External integrations (Slack, email, webhooks)

---

## Conclusion

The Automation system provides comprehensive tools to:
- **Eliminate repetitive tasks** via triggers
- **Standardize workflows** with templates
- **Never miss recurring work** with scheduled tasks
- **Save time** with bulk operations
- **Balance workload** with smart auto-assignment

These features work together to create a powerful, flexible automation framework that grows with your team's needs.

## Support

- [GitHub Issues](https://github.com/your-repo/issues)
- [Documentation](./README.md)
- [API Reference](./API.md)
