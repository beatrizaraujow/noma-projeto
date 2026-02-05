# Task Detail & Comments System

Complete task detail panel with rich text editing, comments system with @mentions, and file attachments with drag & drop.

## 🎯 Components

### 1. TaskDetailHeader
**Location:** `packages/ui/components/task-detail.tsx`

Header with editable title and actions:
- **Inline title editing** with Enter/Escape shortcuts
- Edit button (visible on hover)
- Actions dropdown: Copy link, Archive, Delete
- Close button

**Props:**
```typescript
interface TaskDetailHeaderProps {
  title: string;
  isEditing: boolean;
  onTitleChange: (title: string) => void;
  onEditToggle: () => void;
  onClose: () => void;
  onCopy?: () => void;
  onArchive?: () => void;
  onDelete?: () => void;
}
```

### 2. TaskMetadataSidebar
**Location:** `packages/ui/components/task-detail.tsx`

Metadata management sidebar:
- **Status dropdown** with color indicators
- **Assignee** with avatar
- **Priority** with flag icon and colors
- **Due date** picker
- **Labels** with colored badges
- **Project** association

**Props:**
```typescript
interface TaskMetadata {
  status: 'backlog' | 'todo' | 'in-progress' | 'review' | 'done';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  assignee?: { name: string; avatar?: string; };
  dueDate?: Date;
  labels?: Array<{ id: string; name: string; color: string; }>;
  project?: { id: string; name: string; color?: string; };
}
```

### 3. TaskActivityTimeline
**Location:** `packages/ui/components/task-detail.tsx`

Activity feed with history:
- Activity types: created, updated, commented, status_changed, assigned
- User avatar + name + timestamp
- Activity description with field changes
- Chronological order

**Props:**
```typescript
interface TaskActivity {
  id: string;
  type: 'created' | 'updated' | 'commented' | 'status_changed' | 'assigned';
  user: { name: string; avatar?: string; };
  timestamp: Date;
  content?: string;
  changes?: { field: string; from: string; to: string; };
}
```

### 4. TaskComment
**Location:** `packages/ui/components/task-comments.tsx`

Individual comment with:
- Avatar + author name + timestamp
- "edited" indicator
- **@mention highlighting** (orange color, clickable)
- Edit/Delete actions (visible on hover)
- Inline editing mode

### 5. TaskCommentInput
**Location:** `packages/ui/components/task-comments.tsx`

Rich comment input with:
- **@mention autocomplete** - Type @ to trigger
- User search/filter
- Keyboard shortcuts (Cmd/Ctrl+Enter to send)
- Mention button
- Multi-line textarea

**Features:**
- Detects @ in text and shows user dropdown
- Filters users by name as you type
- Inserts @username with space
- Tracks all mentions for submission

### 6. TaskComments
**Location:** `packages/ui/components/task-comments.tsx`

Complete comments system:
- Header with count
- Comments list
- Empty state
- Comment input

**Props:**
```typescript
interface TaskCommentsProps {
  comments: Comment[];
  currentUser: User;
  users?: User[];
  onAddComment: (content: string, mentions: string[]) => void;
  onEditComment?: (commentId: string, content: string) => void;
  onDeleteComment?: (commentId: string) => void;
}
```

### 7. TaskAttachmentItem
**Location:** `packages/ui/components/task-attachments.tsx`

File attachment card:
- **Image preview** with aspect-video ratio
- **File icon** for non-images (PDF, etc)
- File name + size (formatted)
- Hover overlay with actions:
  - Preview (Eye icon)
  - Download
  - Delete (red)

### 8. TaskAttachmentUpload
**Location:** `packages/ui/components/task-attachments.tsx`

Drag & drop upload zone:
- **Drag & drop** with visual feedback
- Click to browse files
- Max size indicator
- Upload icon animation on drag
- Multiple file support

**Features:**
- `onDragEnter/Leave/Over/Drop` handlers
- Visual state: border color changes, background tint
- File input hidden, triggered by zone click
- Accepts `accept` prop for file filtering

### 9. TaskAttachments
**Location:** `packages/ui/components/task-attachments.tsx`

Complete attachments UI:
- Header with count
- Grid layout (1→2 cols responsive)
- Upload zone always visible
- Preview, download, delete actions

### 10. RichTextEditor
**Location:** `packages/ui/components/rich-text-editor.tsx`

Simple rich text editor:
- **Toolbar** with formatting buttons:
  - Bold, Italic, Underline
  - Bullet list, Numbered list
  - Quote, Code block
  - Insert link (with prompt)
- **ContentEditable** div
- HTML content storage
- Focus ring (orange)
- Placeholder support

**Uses native `document.execCommand` for formatting**

### 11. TaskDetailPanel
**Location:** `packages/ui/components/task-detail-panel.tsx`

Main task detail panel (side panel):
- **Slide-in from right** animation
- Backdrop overlay (click to close)
- Responsive width (1/2 desktop, 3/4 tablet, full mobile)
- **Scrollable content** with fixed header
- **Grid layout:** 2 cols (content) + 1 col (sidebar) on desktop

**Sections:**
1. Header (title, actions, close)
2. Description (rich text editor)
3. Attachments
4. Activity timeline
5. Comments
6. Sidebar (metadata)

**Props:**
```typescript
interface TaskDetailPanelProps {
  task: Task;
  currentUser: User;
  users?: User[];
  isOpen: boolean;
  onClose: () => void;
  onTitleChange: (title: string) => void;
  onDescriptionChange: (description: string) => void;
  onMetadataChange: (metadata: Partial<TaskMetadata>) => void;
  onAddComment: (content: string, mentions: string[]) => void;
  // ... all other handlers
}
```

## 🎨 Design Features

### Status Colors
- Backlog: Neutral (#94a3b8)
- To Do: Blue (#3b82f6)
- In Progress: Yellow (#f59e0b)
- In Review: Purple (#8b5cf6)
- Done: Green (#10b981)

### Priority Colors
- Low: Blue (#3b82f6)
- Medium: Yellow (#eab308)
- High: Orange (#f97316)
- Urgent: Red (#ef4444)

### Visual States
- **Focus:** Orange ring (2px)
- **Hover:** Subtle background change
- **Dragging file:** Orange border, orange background tint
- **Mention highlighting:** Orange text with underline on hover

### Animations
- Panel: `slide-in-from-right` (300ms)
- Backdrop: `fade-in`
- Hover effects: Opacity transitions

## 🔌 Usage Example

```tsx
import { TaskDetailPanel, Task } from '@nexora/ui';

const task: Task = {
  id: '1',
  title: 'Implement user authentication',
  description: '<p>Add JWT-based auth with refresh tokens</p>',
  metadata: {
    status: 'in-progress',
    priority: 'high',
    assignee: { name: 'John Doe' },
    dueDate: new Date('2026-02-10'),
    labels: [
      { id: 'l1', name: 'Backend', color: '#8b5cf6' }
    ],
    project: { id: 'p1', name: 'Main App', color: '#f59e0b' }
  },
  activities: [
    {
      id: 'act1',
      type: 'created',
      user: { name: 'Alice' },
      timestamp: new Date()
    }
  ],
  comments: [
    {
      id: 'c1',
      author: { name: 'Bob' },
      content: 'Looks good! @Alice can you review?',
      timestamp: new Date(),
      mentions: ['@Alice']
    }
  ],
  attachments: [
    {
      id: 'att1',
      name: 'design.png',
      size: 245678,
      type: 'image/png',
      url: 'https://...',
      uploadedAt: new Date()
    }
  ]
};

const currentUser = {
  id: 'user1',
  name: 'John Doe'
};

export default function Page() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)}>
        Open Task
      </button>

      <TaskDetailPanel
        task={task}
        currentUser={currentUser}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onTitleChange={(title) => console.log('Title:', title)}
        onDescriptionChange={(desc) => console.log('Desc:', desc)}
        onMetadataChange={(meta) => console.log('Meta:', meta)}
        onAddComment={(content, mentions) => {
          console.log('Comment:', content, 'Mentions:', mentions);
        }}
        onUploadAttachment={(files) => {
          console.log('Files:', files);
        }}
      />
    </>
  );
}
```

## ✅ Features Checklist

### Task Detail Panel
- [x] Slide-in side panel
- [x] Backdrop overlay
- [x] Responsive layout (grid)
- [x] Scrollable content
- [x] Prevent body scroll when open

### Title
- [x] Inline editing
- [x] Hover to show edit button
- [x] Enter/Escape shortcuts
- [x] Save/Cancel buttons

### Description
- [x] Rich text editor
- [x] Formatting toolbar
- [x] Bold, Italic, Underline
- [x] Lists (bullet, numbered)
- [x] Quote, Code block
- [x] Link insertion
- [x] HTML storage

### Metadata Sidebar
- [x] Status dropdown with colors
- [x] Assignee selector
- [x] Priority with icons
- [x] Due date picker (UI ready)
- [x] Labels display
- [x] Project association

### Comments System
- [x] Comment list with avatars
- [x] Timestamp formatting
- [x] @mentions highlighting
- [x] @mention autocomplete
- [x] User search/filter
- [x] Edit inline (with textarea)
- [x] Delete action
- [x] Empty state
- [x] Keyboard shortcuts (Cmd+Enter)
- [x] Edited indicator

### Attachments
- [x] Drag & drop zone
- [x] Visual feedback on drag
- [x] Click to browse
- [x] File size formatting
- [x] Image thumbnails
- [x] File type icons
- [x] Preview action (images)
- [x] Download action
- [x] Delete action
- [x] Grid layout
- [x] Hover overlays

### Activity Timeline
- [x] Activity types (created, updated, etc)
- [x] User avatars
- [x] Timestamps
- [x] Activity descriptions
- [x] Field change tracking

### Actions
- [x] Copy link
- [x] Archive task
- [x] Delete task
- [x] Close panel

## 🚀 Next Steps

1. **Date Picker Component:**
   - Calendar UI
   - Date selection
   - Quick presets (Today, Tomorrow, Next week)
   - Clear date option

2. **Advanced Rich Text:**
   - Heading levels
   - Text color
   - Background color
   - Align left/center/right
   - Tables
   - Emojis

3. **File Preview Modal:**
   - Full-screen image preview
   - Zoom in/out
   - Navigate between images
   - PDF viewer

4. **Assignee Selector:**
   - Searchable dropdown
   - Multiple assignees
   - Recent/suggested users

5. **Labels Manager:**
   - Create new labels
   - Color picker
   - Search/filter labels

6. **Real-time Updates:**
   - WebSocket integration
   - Optimistic updates
   - Conflict resolution

## 📁 File Structure

```
packages/ui/components/
├── task-detail.tsx              # Header, Sidebar, Timeline
├── task-comments.tsx            # Comments system with @mentions
├── task-attachments.tsx         # File upload & management
├── rich-text-editor.tsx         # Simple WYSIWYG editor
└── task-detail-panel.tsx        # Main panel component

apps/web/src/app/workspaces/[id]/
└── board/
    └── page.tsx                 # Board with task detail integration

docs/
└── TASK_DETAIL.md              # This file
```

## 🎯 Integration with Kanban

The task detail panel integrates seamlessly with the kanban board:

```tsx
<KanbanBoard
  onTaskClick={(task) => {
    // Convert to full Task object
    setSelectedTask(fullTask);
    setIsTaskDetailOpen(true);
  }}
/>

<TaskDetailPanel
  task={selectedTask}
  isOpen={isTaskDetailOpen}
  onClose={() => setIsTaskDetailOpen(false)}
  // ... handlers
/>
```

**State management handles:**
- Opening panel on task click
- Closing panel (backdrop or X button)
- Updating task data in both board and panel
- Preventing body scroll when panel open
