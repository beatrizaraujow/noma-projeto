# Kanban Board Implementation

Complete kanban board system with drag & drop, filters, and multiple views.

## 🎯 Components

### 1. KanbanCard
**Location:** `packages/ui/components/kanban-card.tsx`

Compact task card with all essential information:
- Title (2 lines max with ellipsis)
- Priority indicator (left border + icon color)
- Labels (first 2 visible + count)
- Due date with status colors (overdue: red, due soon: orange, normal: gray)
- Comments count
- Attachments count
- Assignee avatar
- Drag handle (visible on hover)

**Visual States:**
- `isDragging`: Opacity 50%, shadow 2xl, rotate 2°, scale 105%
- Hover: Shadow md, orange border

**Props:**
```typescript
interface KanbanCardProps {
  task: KanbanTask;
  onClick?: () => void;
  isDragging?: boolean;
}

interface KanbanTask {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  assignee?: {
    name: string;
    avatar?: string;
  };
  dueDate?: Date;
  commentsCount?: number;
  attachmentsCount?: number;
  labels?: Array<{
    id: string;
    name: string;
    color: string;
  }>;
}
```

### 2. KanbanColumn
**Location:** `packages/ui/components/kanban-column.tsx`

Status lane with scrollable task list:
- Header with color indicator + title
- Task count badge
- WIP limit indicator (e.g., "3/5")
- Warning badge when over limit
- Add task button
- Column options menu
- Scrollable task list
- Empty state with drop zone
- Drop zone indicators between cards

**Features:**
- Native drag & drop support
- Drop zone highlighting (orange border)
- Placeholder cards during drag
- Auto-scroll on overflow

**Props:**
```typescript
interface KanbanColumnProps {
  column: KanbanColumn;
  onTaskClick?: (task: KanbanTask) => void;
  onAddTask?: (columnId: string) => void;
  onTaskDragStart?: (task: KanbanTask, columnId: string) => void;
  onTaskDragEnd?: () => void;
  onTaskDrop?: (taskId: string, targetColumnId: string, targetIndex: number) => void;
  isDragOver?: boolean;
  draggedTaskId?: string | null;
}

interface KanbanColumn {
  id: string;
  title: string;
  tasks: KanbanTask[];
  color?: string;
  limit?: number;
}
```

### 3. BoardHeader
**Location:** `packages/ui/components/board-header.tsx`

Comprehensive board header with:
- Title + description
- Team members (avatar group, max 4 visible)
- Search bar (autocomplete ready)
- Filter dropdown (priority, assignees, labels, due dates)
- Active filters badge
- View switcher (board/list/calendar)
- Share button
- Add task CTA button
- Export & more actions

**Filter System:**
```typescript
interface BoardFilter {
  assignees?: string[];
  priorities?: Array<'low' | 'medium' | 'high' | 'urgent'>;
  labels?: string[];
  dueDate?: {
    from?: Date;
    to?: Date;
  };
}
```

### 4. KanbanBoard
**Location:** `packages/ui/components/kanban-board.tsx`

Main board container:
- Integrates BoardHeader
- Horizontal scroll for columns
- Drag & drop orchestration
- Search & filter logic
- View switching (board/list/calendar)
- Task move handling

**Props:**
```typescript
interface KanbanBoardProps {
  title: string;
  description?: string;
  columns: KanbanColumnType[];
  onTaskClick?: (task: KanbanTask) => void;
  onTaskMove?: (taskId: string, fromColumn: string, toColumn: string, toIndex: number) => void;
  onAddTask?: (columnId?: string) => void;
  onShare?: () => void;
  members?: Array<{
    name: string;
    avatar?: string;
  }>;
}
```

## 📄 Page Template

### Board Page
**Location:** `apps/web/src/app/workspaces/[id]/board/page.tsx`

Full-page board implementation with:
- WorkspaceLayout integration
- Mock data (5 columns, 10 tasks)
- Task move handler with state update
- Click handlers for task detail
- Add task modal trigger
- Share board handler

**Mock Columns:**
1. **Backlog** (gray) - Research & planning tasks
2. **To Do** (indigo, limit: 5) - Ready to start
3. **In Progress** (orange, limit: 3) - Active work
4. **In Review** (purple) - Code review & QA
5. **Done** (green) - Completed tasks

## 🎨 Design Features

### Priority Colors
- **Urgent:** Red (#ef4444) - AlertCircle icon
- **High:** Orange (#f97316) - Flag icon
- **Medium:** Yellow (#eab308) - Flag icon
- **Low:** Blue (#3b82f6) - Flag icon

### Status Colors (Column Headers)
- Backlog: Gray (#94a3b8)
- To Do: Indigo (#6366f1)
- In Progress: Orange (#f59e0b)
- In Review: Purple (#8b5cf6)
- Done: Green (#10b981)

### Due Date Colors
- **Overdue:** Red text + bold
- **Due soon** (< 3 days): Orange text
- **Normal:** Gray text

### Drag & Drop States
1. **Dragging card:**
   - Opacity: 50%
   - Shadow: 2xl
   - Transform: rotate(2deg) scale(1.05)

2. **Drop zone:**
   - Border: Dashed orange
   - Background: Orange 50
   - Placeholder card shown

3. **Column hover:**
   - Background: Orange tint
   - Border highlight

## 🔌 Usage Example

```tsx
import { KanbanBoard, KanbanColumnType } from '@nexora/ui';

const columns: KanbanColumnType[] = [
  {
    id: 'todo',
    title: 'To Do',
    color: '#6366f1',
    limit: 5,
    tasks: [
      {
        id: '1',
        title: 'Design new dashboard',
        status: 'todo',
        priority: 'high',
        assignee: { name: 'John Doe' },
        dueDate: new Date('2026-02-10'),
        commentsCount: 5,
        attachmentsCount: 2,
        labels: [
          { id: 'l1', name: 'Design', color: '#ec4899' }
        ],
      },
    ],
  },
];

export default function BoardPage() {
  const [cols, setCols] = useState(columns);

  const handleTaskMove = (taskId, from, to, index) => {
    // Update state logic
  };

  return (
    <KanbanBoard
      title="Project Board"
      columns={cols}
      onTaskMove={handleTaskMove}
      onTaskClick={(task) => console.log(task)}
      onAddTask={(colId) => console.log('Add to', colId)}
      members={[{ name: 'Team' }]}
    />
  );
}
```

## ✅ Features Checklist

### Layout
- [x] Board view with horizontal scroll
- [x] Responsive column width (320-360px)
- [x] Header with all controls
- [x] Empty states for columns
- [ ] List view (placeholder ready)
- [ ] Calendar view (placeholder ready)

### Task Cards
- [x] Compact design (title, meta, assignee)
- [x] Priority indicator (left border + icon)
- [x] Due date with status colors
- [x] Comments & attachments count
- [x] Labels (first 2 + count)
- [x] Assignee avatar
- [x] Hover effects
- [x] Drag handle

### Drag & Drop
- [x] Native HTML5 drag & drop
- [x] Visual feedback (opacity, shadow, rotation)
- [x] Drop zone highlights
- [x] Placeholder cards
- [x] Drag between columns
- [x] Insert at specific index
- [x] Drag state management

### Filters & Search
- [x] Search bar integration
- [x] Priority filter (multi-select)
- [x] Active filters badge with count
- [x] Clear all filters
- [x] Real-time filtering
- [ ] Assignee filter (API needed)
- [ ] Label filter (API needed)
- [ ] Due date range (API needed)

### Views
- [x] Board view (implemented)
- [x] View switcher (3 buttons)
- [ ] List view (TODO)
- [ ] Calendar view (TODO)

### Actions
- [x] Add task (per column + global)
- [x] Share board
- [x] Task click handler
- [x] Column options menu
- [x] Export board (dropdown)
- [x] Manage members (dropdown)

### Visual Polish
- [x] Color-coded columns
- [x] Priority colors
- [x] Status indicators
- [x] Smooth transitions
- [x] Dark mode support
- [x] Responsive design
- [x] Scrollbar styling
- [x] WIP limits display
- [x] Over-limit warnings

## 🚀 Next Steps

1. **API Integration:**
   - Connect to task API endpoints
   - Real-time updates with WebSocket
   - Optimistic UI updates
   - Error handling & retry logic

2. **Task Detail Modal:**
   - Full task view
   - Edit inline
   - Add comments
   - Upload attachments
   - Activity log

3. **Advanced Filters:**
   - Assignee multi-select
   - Label multi-select
   - Date range picker
   - Custom filters
   - Save filter presets

4. **List View:**
   - Table layout
   - Sortable columns
   - Bulk actions
   - Quick edit

5. **Calendar View:**
   - Month/week view
   - Drag to reschedule
   - Due date visualization
   - Milestone markers

6. **Keyboard Shortcuts:**
   - Arrow keys navigation
   - Quick add (Cmd+K)
   - Quick search (/)
   - View switching (1-3)

7. **Collaboration:**
   - Real-time cursors
   - Task assignments
   - @mentions
   - Activity feed

## 📁 File Structure

```
packages/ui/components/
├── kanban-card.tsx         # Task card + placeholder
├── kanban-column.tsx       # Status lane with tasks
├── board-header.tsx        # Header with filters/search/views
└── kanban-board.tsx        # Main board container

apps/web/src/app/workspaces/[id]/
└── board/
    └── page.tsx            # Board page with mock data

docs/
└── KANBAN_BOARD.md        # This file
```

## 🎯 References

Inspired by:
- **Linear:** Minimal design, subtle colors, clean typography
- **Height:** Colorful priority indicators, visual hierarchy

Combined approach:
- Linear's minimalism for layout and spacing
- Height's color system for priorities and status
- Custom orange accent (#FF5722) for brand consistency
