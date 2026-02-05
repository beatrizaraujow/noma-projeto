# Multiple Views Implementation

Complete implementation of multiple view modes for task management: Board, List, Calendar, and Timeline views.

## Components Created

### 1. ViewSwitcher (`view-switcher.tsx`)
Tab-based view switcher component.

**Features:**
- 4 view types: Board, List, Calendar, Timeline
- Icon + label for each view (responsive - icons only on mobile)
- Active state with orange highlight
- Smooth transitions
- Focus ring for accessibility

**Props:**
```typescript
interface ViewSwitcherProps {
  currentView: ViewType; // 'board' | 'list' | 'calendar' | 'timeline'
  onViewChange: (view: ViewType) => void;
  className?: string;
}
```

### 2. TaskListView (`task-list-view.tsx`)
Table-based list view with advanced features.

**Features:**
- ✅ Sortable columns (title, status, priority, assignee, due date)
- ✅ Inline title editing (double-click to edit)
- ✅ Bulk selection with checkboxes
- ✅ Bulk actions bar (when items selected)
- ✅ Priority indicators with color-coded flags
- ✅ Due date with overdue highlighting
- ✅ Labels (color dots), comments, attachments counters
- ✅ Row hover actions dropdown
- ✅ Empty state
- ✅ Sticky header

**Props:**
```typescript
interface TaskListViewProps {
  tasks: TaskListItem[];
  selectedTasks?: string[];
  sortField?: SortField; // 'title' | 'status' | 'priority' | 'assignee' | 'dueDate'
  sortDirection?: SortDirection; // 'asc' | 'desc'
  onTaskClick?: (task: TaskListItem) => void;
  onTaskSelect?: (taskId: string, selected: boolean) => void;
  onSelectAll?: (selected: boolean) => void;
  onSort?: (field: SortField) => void;
  onEdit?: (taskId: string, field: string, value: any) => void;
  onDelete?: (taskId: string) => void;
}
```

**Sorting Logic:**
- Click column header to sort ascending
- Click again to toggle to descending
- Visual indicators: up/down chevrons, orange color when active

**Inline Editing:**
- Double-click title cell to edit
- Enter to save, Escape to cancel
- Input with orange border focus ring

**Bulk Actions:**
- Select multiple tasks with checkboxes
- Bulk actions bar appears at top
- Actions: Change Status, Assign, Delete
- Deselect all functionality

### 3. TaskCalendarView (`task-calendar-view.tsx`)
Monthly calendar view with task scheduling.

**Features:**
- ✅ Month grid (6 weeks x 7 days)
- ✅ Current day highlighting (orange background)
- ✅ Tasks shown as color-coded blocks (by priority)
- ✅ Drag & drop to reschedule tasks
- ✅ Click task to open detail
- ✅ Click date to filter or create task
- ✅ Navigation: prev/next month, today button
- ✅ Priority color legend
- ✅ Shows up to 3 tasks per day with "+N more" indicator
- ✅ Visual drop zone highlighting

**Props:**
```typescript
interface TaskCalendarViewProps {
  tasks: CalendarTask[];
  selectedDate?: Date;
  onTaskClick?: (task: CalendarTask) => void;
  onDateClick?: (date: Date) => void;
  onTaskDrop?: (taskId: string, newDate: Date) => void;
}
```

**Priority Colors:**
- Urgent: Red (`bg-red-500`)
- High: Orange (`bg-orange-500`)
- Medium: Yellow (`bg-yellow-500`)
- Low: Blue (`bg-blue-500`)

**Drag & Drop:**
- Native HTML5 drag & drop API
- Task bars are draggable
- Drop zones highlight on hover (orange ring)
- Updates task due date on drop

### 4. TaskTimelineView (`task-timeline-view.tsx`)
Gantt-style timeline view with horizontal bars.

**Features:**
- ✅ Horizontal timeline with 30-day range
- ✅ Task bars with date range
- ✅ Progress indicators (optional)
- ✅ Priority-based colors
- ✅ Assignee info per task
- ✅ Today indicator (orange column)
- ✅ Navigation: prev/next week, today button
- ✅ Grid lines for date alignment
- ✅ Responsive bar widths
- ✅ Click task bar to open detail

**Props:**
```typescript
interface TaskTimelineViewProps {
  tasks: TimelineTask[];
  onTaskClick?: (task: TimelineTask) => void;
  onTaskResize?: (taskId: string, startDate: Date, endDate: Date) => void;
}
```

**Timeline Bar Colors:**
- Urgent: Red border + background
- High: Orange border + background
- Medium: Yellow border + background
- Low: Blue border + background

**Date Calculation:**
- Default: 30-day range (7 days back to 23 days forward)
- Bar position: `left = (daysFromStart / 30) * 100%`
- Bar width: `width = (duration / 30) * 100%`
- Tasks outside range are hidden

## Integration Example

```tsx
import {
  ViewSwitcher,
  ViewType,
  TaskListView,
  TaskCalendarView,
  TaskTimelineView,
  KanbanBoard,
} from '@nexora/ui';

function ProjectBoard() {
  const [currentView, setCurrentView] = useState<ViewType>('board');
  const [sortField, setSortField] = useState<SortField>('title');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b">
        <h1>Project Board</h1>
        <ViewSwitcher currentView={currentView} onViewChange={setCurrentView} />
      </div>

      {/* View Content */}
      <div className="flex-1 overflow-hidden">
        {currentView === 'board' && (
          <KanbanBoard
            columns={columns}
            onTaskClick={handleTaskClick}
            onTaskMove={handleTaskMove}
          />
        )}

        {currentView === 'list' && (
          <TaskListView
            tasks={listTasks}
            selectedTasks={selectedTasks}
            sortField={sortField}
            sortDirection={sortDirection}
            onTaskClick={handleTaskClick}
            onTaskSelect={handleTaskSelect}
            onSelectAll={handleSelectAll}
            onSort={handleSort}
            onEdit={handleEdit}
          />
        )}

        {currentView === 'calendar' && (
          <TaskCalendarView
            tasks={calendarTasks}
            onTaskClick={handleTaskClick}
            onDateClick={handleDateClick}
            onTaskDrop={handleTaskDrop}
          />
        )}

        {currentView === 'timeline' && (
          <TaskTimelineView
            tasks={timelineTasks}
            onTaskClick={handleTaskClick}
            onTaskResize={handleTaskResize}
          />
        )}
      </div>
    </div>
  );
}
```

## Data Transformation

### Board → List
```typescript
const listTasks: TaskListItem[] = allTasks.map((task) => ({
  id: task.id,
  title: task.title,
  status: task.status,
  priority: task.priority,
  assignee: task.assignee,
  dueDate: task.dueDate,
  labels: task.labels,
  commentsCount: task.commentsCount,
  attachmentsCount: task.attachmentsCount,
}));
```

### Board → Calendar
```typescript
const calendarTasks: CalendarTask[] = allTasks
  .filter((task) => task.dueDate) // Only tasks with due dates
  .map((task) => ({
    id: task.id,
    title: task.title,
    status: task.status,
    priority: task.priority,
    dueDate: task.dueDate!,
    labels: task.labels,
  }));
```

### Board → Timeline
```typescript
const timelineTasks: TimelineTask[] = allTasks
  .filter((task) => task.dueDate)
  .map((task) => {
    const endDate = task.dueDate!;
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - 7); // Default 7-day duration
    return {
      id: task.id,
      title: task.title,
      status: task.status,
      priority: task.priority,
      assignee: task.assignee,
      startDate,
      endDate,
      progress: task.status === 'done' ? 100 : task.status === 'in-progress' ? 50 : 0,
    };
  });
```

## Design System Alignment

All views follow the design system:
- **Primary Color:** Orange (#FF5722)
- **Focus Rings:** Orange with 2px offset
- **Dark Mode:** Full support with neutral palette
- **Typography:** Sans-serif, responsive sizes
- **Spacing:** Consistent 4px grid
- **Borders:** Neutral-200 (light) / Neutral-700 (dark)
- **Hover States:** Subtle background changes
- **Transitions:** 200-300ms easing

## Keyboard Shortcuts

### List View
- `Enter` - Save inline edit
- `Escape` - Cancel inline edit
- `Space` - Toggle checkbox selection
- `Tab` - Navigate between cells

### Calendar View
- `←/→` - Previous/Next month
- `T` - Jump to today

### Timeline View
- `←/→` - Previous/Next week
- `T` - Jump to today

## Accessibility

- Semantic HTML (`<table>`, `<th>`, `<td>`)
- ARIA labels for icon buttons
- Focus indicators on all interactive elements
- Keyboard navigation support
- Screen reader friendly labels

## Performance Considerations

- **List View:** Virtual scrolling for large datasets (TODO)
- **Calendar View:** Only renders visible month (42 days)
- **Timeline View:** Filters out tasks outside date range
- **Memoization:** useMemo for sorted/filtered data
- **Event Delegation:** Efficient event handling

## Next Steps

1. **Virtual Scrolling** - For list view with 1000+ tasks
2. **Timeline Resize** - Drag handles to adjust task duration
3. **Calendar Week View** - Alternative to month view
4. **List View Grouping** - Group by status/assignee/project
5. **Saved Filters** - Save custom filter combinations
6. **Export Views** - Export as CSV/PDF
7. **Custom Columns** - User-configurable list columns
8. **Timeline Dependencies** - Show task dependencies
9. **Calendar Day View** - Detailed daily view
10. **Quick Actions** - Hover quick actions in all views

## File Structure

```
packages/ui/components/
├── view-switcher.tsx        # View mode tabs
├── task-list-view.tsx       # Table list view (452 lines)
├── task-calendar-view.tsx   # Monthly calendar (246 lines)
└── task-timeline-view.tsx   # Gantt timeline (271 lines)

apps/web/src/app/workspaces/[id]/board/
└── page.tsx                 # Integration example (628 lines)
```

## Testing Checklist

### List View
- [x] Sort by each column (asc/desc)
- [x] Double-click title to edit
- [x] Select/deselect all checkboxes
- [x] Bulk actions bar appears
- [x] Row hover shows actions
- [x] Empty state displays correctly
- [x] Priority colors show correctly
- [x] Overdue dates highlighted in red

### Calendar View
- [x] Month grid renders correctly
- [x] Tasks show on correct dates
- [x] Drag task to new date
- [x] Drop zone highlights
- [x] Click task opens detail
- [x] Navigation works (prev/next/today)
- [x] Priority colors match legend
- [x] "+N more" indicator works

### Timeline View
- [x] Timeline bars render
- [x] Bar widths match durations
- [x] Today column highlighted
- [x] Navigation works
- [x] Click bar opens detail
- [x] Progress bars show (if applicable)
- [x] Priority colors match legend
- [x] Tasks outside range hidden

### View Switcher
- [x] All 4 views accessible
- [x] Active view highlighted
- [x] Smooth transitions
- [x] Responsive (icons only on mobile)
- [x] Keyboard navigation works

All features implemented and working! 🎉
