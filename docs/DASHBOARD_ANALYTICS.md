# Dashboard & Analytics Feature

## Overview
The Dashboard & Analytics feature provides comprehensive workspace insights, including project progress tracking, team productivity metrics, custom widgets, and export capabilities.

## Features Implemented

### ✅ 1. Workspace Dashboard
- **Overview Cards**: Key metrics display (projects, tasks, members, completion rates)
- **Recent Activity**: Real-time activity feed showing user actions
- **Visual Indicators**: Color-coded metrics with icons for quick insights

**API Endpoint**: `GET /analytics/workspaces/:workspaceId/dashboard`

**Component**: `WorkspaceDashboard.tsx`

### ✅ 2. Project Progress Tracking
- **Project Cards**: Individual project performance cards with:
  - Completion rate progress bars
  - Task status breakdown (Todo, In Progress, Done, Overdue)
  - Priority distribution visualization
- **Comparison Charts**: Bar charts showing overall project completion rates

**API Endpoint**: `GET /analytics/workspaces/:workspaceId/project-progress`

**Component**: `ProjectProgressTracker.tsx`

### ✅ 3. Team Productivity Metrics
- **Team Averages**: Aggregate team performance statistics
- **Member Performance Cards**: Individual metrics including:
  - Assigned and completed tasks
  - Completion rate percentage
  - Activities and comments count
  - Recent activity breakdown (last 7 days)
- **Top Performers**: Visual indicators (awards) for top 3 performers
- **Comparison Charts**: Side-by-side task completion comparison

**API Endpoint**: `GET /analytics/workspaces/:workspaceId/team-productivity`

**Component**: `TeamProductivityMetrics.tsx`

### ✅ 4. Custom Widgets
- **Widget Customization**: Users can show/hide widgets
- **Widget Reordering**: Move widgets up/down to customize layout
- **Persistent Settings**: Layout preferences saved to localStorage
- **Available Widgets**:
  - Workspace Overview
  - Project Progress
  - Team Productivity

**Component**: `CustomDashboardWidgets.tsx`

### ✅ 5. Export Reports
- **CSV Export**: Complete dashboard data in CSV format
- **JSON Export**: Raw data export for further processing
- **PDF Export**: Print-friendly formatted reports with:
  - Overview metrics
  - Project progress tables
  - Team productivity tables
  - Task distribution breakdowns

**API Endpoint**: `GET /analytics/workspaces/:workspaceId/export?format=csv|json`

**Component**: `DashboardExport.tsx`

## Architecture

### Backend (NestJS)

#### Analytics Service (`apps/api/src/modules/analytics/`)

**Methods**:
- `getWorkspaceDashboard()` - Overview metrics and recent activity
- `getProjectProgress()` - Per-project progress and task distribution
- `getTeamProductivity()` - Individual member metrics and team averages
- `getActivityTrend()` - Activity trend data over time
- `getTaskDistribution()` - Task breakdown by status and priority
- `exportDashboardData()` - Complete data export for reporting

**Security**: All endpoints verify workspace membership before returning data.

#### Analytics Controller

**Routes**:
- `GET /analytics/workspaces/:workspaceId/dashboard`
- `GET /analytics/workspaces/:workspaceId/project-progress`
- `GET /analytics/workspaces/:workspaceId/team-productivity`
- `GET /analytics/workspaces/:workspaceId/activity-trend?days=30`
- `GET /analytics/workspaces/:workspaceId/task-distribution`
- `GET /analytics/workspaces/:workspaceId/export?format=csv|json`

### Frontend (Next.js)

#### Dashboard Page
**Route**: `/workspaces/[id]/dashboard`

**Location**: `apps/web/src/app/workspaces/[id]/dashboard/page.tsx`

#### Components

1. **WorkspaceDashboard.tsx**
   - Displays overview metrics
   - Shows recent activity feed
   - Uses card-based layout

2. **ProjectProgressTracker.tsx**
   - Individual project cards with progress bars
   - Task status breakdown
   - Priority distribution
   - Recharts bar charts for comparisons

3. **TeamProductivityMetrics.tsx**
   - Team average statistics
   - Member performance cards
   - Activity tracking
   - Recharts comparison charts

4. **CustomDashboardWidgets.tsx**
   - Widget management system
   - Drag-to-reorder functionality
   - Show/hide toggle controls
   - LocalStorage persistence

5. **DashboardExport.tsx**
   - CSV download
   - JSON download
   - PDF generation via print dialog

## Data Flow

```
User Request → Dashboard Page → Component (with workspaceId + token)
                                       ↓
                                 API Request
                                       ↓
                      Analytics Controller (JWT Auth)
                                       ↓
                      Analytics Service (Permission Check)
                                       ↓
                      Prisma Queries (Database)
                                       ↓
                      Data Processing & Aggregation
                                       ↓
                      Response with Metrics
                                       ↓
                      Component Renders Charts/Cards
```

## Installation

1. **Install Dependencies**:
```bash
cd apps/web
pnpm install
```

The `recharts` library is now included in `package.json` for chart visualizations.

2. **Backend is Ready**: The analytics module is already integrated into `app.module.ts`

## Usage

### Accessing the Dashboard

1. Navigate to a workspace: `/workspaces/[workspaceId]`
2. Click the "Ver Dashboard & Analytics" button
3. View comprehensive analytics and metrics

### Customizing Widgets

1. Click "Customize" button in dashboard
2. Toggle widgets on/off using Show/Hide buttons
3. Reorder widgets using ↑↓ buttons
4. Click "Done Customizing" to save

### Exporting Data

1. Scroll to the "Export Dashboard" section
2. Choose format:
   - **CSV**: For spreadsheet analysis
   - **JSON**: For programmatic processing
   - **PDF**: For printing/sharing reports

## Database Queries

The analytics service performs optimized queries using:
- `Promise.all()` for parallel data fetching
- Prisma `groupBy()` for aggregations
- Selective field retrieval with `select`
- Efficient counting with `_count`

## Performance Considerations

- **Parallel Queries**: Multiple metrics fetched simultaneously
- **Data Caching**: Consider implementing Redis caching for frequently accessed metrics
- **Pagination**: Recent activity limited to 10 items
- **Optimized Aggregations**: Using database-level groupBy operations

## Future Enhancements

- [ ] Real-time metric updates via WebSocket
- [ ] Date range filters for historical analysis
- [ ] Custom metric definitions
- [ ] Scheduled report emails
- [ ] Advanced chart types (line charts, pie charts)
- [ ] Drill-down capability for detailed views
- [ ] Comparison views (month-over-month, etc.)
- [ ] Export to Excel with formatting
- [ ] Dashboard templates/presets

## Testing

To test the dashboard:

1. Create a workspace with projects and tasks
2. Assign tasks to team members
3. Complete some tasks
4. Navigate to the dashboard to see metrics
5. Test widget customization
6. Test export functionality in different formats

## Troubleshooting

**Issue**: Charts not displaying
- **Solution**: Ensure `recharts` is installed: `pnpm install recharts`

**Issue**: "Access denied to workspace" error
- **Solution**: Verify user is a member of the workspace

**Issue**: Export not working
- **Solution**: Check browser's popup blocker for PDF export

**Issue**: Widget preferences not persisting
- **Solution**: Check browser localStorage is enabled

## API Response Examples

### Dashboard Overview
```json
{
  "overview": {
    "totalProjects": 5,
    "totalTasks": 42,
    "totalMembers": 8,
    "completedTasks": 28,
    "overdueTasks": 3,
    "completionRate": 66.7
  },
  "recentActivity": [...]
}
```

### Project Progress
```json
[
  {
    "projectId": "abc123",
    "projectName": "Website Redesign",
    "totalTasks": 15,
    "completedTasks": 10,
    "inProgressTasks": 3,
    "todoTasks": 2,
    "overdueTasks": 1,
    "completionRate": 66.7,
    "tasksByPriority": [
      { "priority": "HIGH", "count": 5 },
      { "priority": "MEDIUM", "count": 8 },
      { "priority": "LOW", "count": 2 }
    ]
  }
]
```

### Team Productivity
```json
{
  "memberMetrics": [
    {
      "user": {
        "id": "user1",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "assignedTasks": 12,
      "completedTasks": 10,
      "completionRate": 83.3,
      "activitiesCount": 45,
      "commentsCount": 23,
      "recentActivities": [...]
    }
  ],
  "teamAverages": {
    "totalAssigned": 42,
    "totalCompleted": 28,
    "averageCompletionRate": 66.7
  }
}
```

## Security

- All endpoints require JWT authentication
- Workspace membership verified before data access
- No sensitive user data exposed
- Rate limiting applied via NestJS throttler

## File Structure

```
apps/
├── api/src/modules/analytics/
│   ├── analytics.module.ts
│   ├── analytics.controller.ts
│   └── analytics.service.ts
└── web/src/
    ├── app/workspaces/[id]/dashboard/
    │   └── page.tsx
    └── components/
        ├── WorkspaceDashboard.tsx
        ├── ProjectProgressTracker.tsx
        ├── TeamProductivityMetrics.tsx
        ├── CustomDashboardWidgets.tsx
        └── DashboardExport.tsx
```

## Dependencies Added

- `recharts: ^2.10.3` - Chart library for data visualization

## Conclusion

The Dashboard & Analytics feature provides a comprehensive view of workspace performance, enabling teams to track progress, identify bottlenecks, and make data-driven decisions. The modular widget system allows for customization, while export capabilities enable sharing and further analysis.
