# Notifications & Activity System

Complete implementation of notifications center, activity feed timeline, and email notification templates.

## Components Created

### 1. NotificationCenter (`notification-center.tsx`)
Dropdown notification panel with filtering, mark as read, and badge counter.

**Features:**
- ✅ Bell icon with unread badge counter
- ✅ Dropdown panel with smooth animations
- ✅ Filter tabs: All, Unread, Mentions, Assigned
- ✅ Mark individual as read (click dot)
- ✅ Mark all as read button
- ✅ Clear all notifications
- ✅ Relative timestamps (just now, 5m ago, 1h ago, etc.)
- ✅ Empty state with icon
- ✅ See all notifications link
- ✅ Click outside to close
- ✅ Type-based icons (mention @, assigned 👤, comment 💬, status 📋, due ⏰, invite ✉️)

**Props:**
```typescript
interface NotificationCenterProps {
  notifications: Notification[];
  unreadCount?: number;
  filter?: NotificationFilter; // 'all' | 'unread' | 'mentions' | 'assigned'
  onFilterChange?: (filter: NotificationFilter) => void;
  onNotificationClick?: (notification: Notification) => void;
  onMarkAsRead?: (notificationId: string) => void;
  onMarkAllAsRead?: () => void;
  onClearAll?: () => void;
  className?: string;
}

interface Notification {
  id: string;
  type: 'mention' | 'assigned' | 'comment' | 'status' | 'due' | 'invite';
  title: string;
  message: string;
  actor?: {
    name: string;
    avatar?: string;
  };
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  metadata?: {
    taskId?: string;
    taskTitle?: string;
    projectName?: string;
  };
}
```

**Usage Example:**
```typescript
const [notifications, setNotifications] = useState<Notification[]>([...]);
const [filter, setFilter] = useState<NotificationFilter>('all');

const unreadCount = notifications.filter(n => !n.read).length;

<NotificationCenter
  notifications={notifications}
  unreadCount={unreadCount}
  filter={filter}
  onFilterChange={setFilter}
  onNotificationClick={(notification) => {
    // Navigate to task or relevant page
    router.push(notification.actionUrl);
  }}
  onMarkAsRead={(id) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  }}
  onMarkAllAsRead={() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }}
  onClearAll={() => setNotifications([])}
/>
```

### 2. ActivityFeed (`activity-feed.tsx`)
Vertical timeline showing historical activities with icons, avatars, and timestamps.

**Features:**
- ✅ Vertical timeline with connecting lines
- ✅ Type-based icons (16 activity types supported)
- ✅ Color-coded activity types
- ✅ User avatars (optional)
- ✅ Relative timestamps
- ✅ Rich descriptions with formatting
- ✅ Field changes (from → to with visual indicators)
- ✅ Comment previews with blockquote style
- ✅ Task/project metadata badges
- ✅ Compact mode for sidebars
- ✅ Empty state
- ✅ Max items limit

**Props:**
```typescript
interface ActivityFeedProps {
  activities: Activity[];
  maxItems?: number;
  showAvatar?: boolean; // Default: true
  compact?: boolean; // Default: false
  className?: string;
}

interface Activity {
  id: string;
  type: ActivityType;
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
  timestamp: Date;
  description: string;
  metadata?: {
    field?: string;
    oldValue?: string;
    newValue?: string;
    taskTitle?: string;
    projectName?: string;
    commentText?: string;
  };
}

type ActivityType =
  | 'created'
  | 'updated'
  | 'deleted'
  | 'commented'
  | 'status_changed'
  | 'assigned'
  | 'unassigned'
  | 'due_date_changed'
  | 'priority_changed'
  | 'label_added'
  | 'label_removed'
  | 'attachment_added'
  | 'attachment_removed'
  | 'archived'
  | 'duplicated'
  | 'moved';
```

**Activity Type Colors:**
- **Created**: Green
- **Updated**: Blue
- **Deleted/Removed**: Red
- **Commented**: Purple
- **Status Changed**: Orange
- **Assigned/Unassigned**: Indigo
- **Priority Changed**: Yellow
- **Due Date Changed**: Pink
- **Default**: Neutral

**Usage Example:**
```typescript
const activities: Activity[] = [
  {
    id: 'a1',
    type: 'status_changed',
    user: { id: 'u1', name: 'Jane Doe', avatar: '/avatars/jane.jpg' },
    timestamp: new Date(Date.now() - 300000),
    description: 'changed status',
    metadata: {
      field: 'status',
      oldValue: 'In Progress',
      newValue: 'Done',
      taskTitle: 'Fix bug in authentication',
      projectName: 'Backend API',
    },
  },
  {
    id: 'a2',
    type: 'commented',
    user: { id: 'u2', name: 'John Smith' },
    timestamp: new Date(Date.now() - 600000),
    description: 'commented',
    metadata: {
      commentText: 'This looks good to merge!',
      taskTitle: 'Add user profile page',
    },
  },
];

// Full view
<ActivityFeed activities={activities} showAvatar={true} />

// Compact sidebar view
<ActivityFeed activities={activities} compact={true} maxItems={10} />
```

### 3. Email Templates (`email-templates.tsx`)
React-based email templates ready for rendering to HTML.

**Templates Included:**

#### TaskAssignedEmail
Sent when user is assigned to a task.
```typescript
<TaskAssignedEmail
  recipientName="Jane Doe"
  taskTitle="Design new dashboard"
  taskUrl="https://app.nexora.com/tasks/123"
  assignedBy="John Smith"
  projectName="Product Redesign"
  dueDate="February 15, 2026"
/>
```

#### MentionEmail
Sent when user is mentioned in a comment.
```typescript
<MentionEmail
  recipientName="Jane Doe"
  mentionedBy="John Smith"
  commentText="@jane What do you think about this approach?"
  taskTitle="Implement OAuth"
  taskUrl="https://app.nexora.com/tasks/456"
  projectName="Authentication"
/>
```

#### DueDateReminderEmail
Sent when task is due soon or overdue.
```typescript
<DueDateReminderEmail
  recipientName="Jane Doe"
  taskTitle="Submit quarterly report"
  taskUrl="https://app.nexora.com/tasks/789"
  dueDate="February 6, 2026"
  projectName="Business Operations"
  isOverdue={true}
/>
```

#### DailyDigestEmail
Daily summary of activity and upcoming tasks.
```typescript
<DailyDigestEmail
  recipientName="Jane Doe"
  date="February 5, 2026"
  stats={{
    tasksCompleted: 5,
    newTasks: 3,
    commentsMade: 12,
    mentionsReceived: 4,
  }}
  upcomingTasks={[
    {
      title: "Review PR #123",
      dueDate: "Tomorrow",
      priority: "High",
      url: "...",
    },
  ]}
  recentActivity={[
    {
      description: "John completed 'Fix authentication bug'",
      timestamp: "2 hours ago",
    },
  ]}
/>
```

**Email Components:**
- `EmailLayout` - Base wrapper with centered max-width box
- `EmailHeader` - Orange header with logo/text
- `EmailFooter` - Gray footer with unsubscribe link

## Integration Patterns

### WebSocket Real-time Notifications

```typescript
// Connect to WebSocket
const socket = io('wss://your-server.com');

socket.on('notification', (notification: Notification) => {
  // Add to notifications list
  setNotifications(prev => [notification, ...prev]);
  
  // Show toast for instant feedback
  if (notification.type === 'assigned') {
    info('New task assigned', notification.message);
  }
  
  // Trigger browser notification (if permission granted)
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(notification.title, {
      body: notification.message,
      icon: '/logo.png',
    });
  }
});

// Request notification permission
useEffect(() => {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
}, []);
```

### Activity Feed with Real-time Updates

```typescript
// Listen for activity events
socket.on('activity', (activity: Activity) => {
  setActivities(prev => [activity, ...prev]);
  
  // Trigger subtle animation
  triggerPulse(activity.metadata?.taskId, 2000);
});

// Render in task detail panel
<TaskDetailPanel>
  <ActivityFeed 
    activities={taskActivities.filter(a => a.metadata?.taskId === currentTask.id)}
    maxItems={20}
  />
</TaskDetailPanel>
```

### Notification Badge Updates

```typescript
// Auto-update badge count
const unreadCount = useMemo(
  () => notifications.filter(n => !n.read).length,
  [notifications]
);

// Show in header
<NotificationCenter 
  notifications={notifications}
  unreadCount={unreadCount}
  {...handlers}
/>
```

### Email Rendering for Backend

Using `@react-email/components` or similar:

```typescript
import { render } from '@react-email/render';
import { TaskAssignedEmail } from '@nexora/ui';

// Generate HTML
const emailHtml = render(
  <TaskAssignedEmail
    recipientName={user.name}
    taskTitle={task.title}
    taskUrl={`${baseUrl}/tasks/${task.id}`}
    assignedBy={assigner.name}
    projectName={project.name}
    dueDate={task.dueDate.toLocaleDateString()}
  />
);

// Send via email service
await sendEmail({
  to: user.email,
  subject: `You've been assigned to ${task.title}`,
  html: emailHtml,
});
```

### Notification Preferences

```typescript
interface NotificationPreferences {
  email: {
    mentions: boolean;
    assigned: boolean;
    dueDates: boolean;
    dailyDigest: boolean;
  };
  push: {
    mentions: boolean;
    assigned: boolean;
    statusChanges: boolean;
  };
  inApp: {
    all: boolean;
  };
}

// Filter notifications based on preferences
const shouldNotify = (type: Notification['type'], preferences: NotificationPreferences) => {
  if (!preferences.inApp.all) return false;
  // Add logic based on type
  return true;
};
```

## Backend Integration

### REST API Endpoints

```typescript
// GET /api/notifications
// Returns: { notifications: Notification[], unreadCount: number }

// POST /api/notifications/:id/read
// Marks notification as read

// POST /api/notifications/read-all
// Marks all as read

// DELETE /api/notifications
// Clears all notifications

// GET /api/activities
// Query params: taskId?, userId?, type?, limit?, offset?
// Returns: { activities: Activity[], total: number }
```

### Creating Notifications

```typescript
// Server-side helper
async function createNotification(
  userId: string,
  type: Notification['type'],
  data: {
    title: string;
    message: string;
    actorId?: string;
    taskId?: string;
    actionUrl?: string;
  }
) {
  const notification = await db.notification.create({
    data: {
      userId,
      type,
      ...data,
      timestamp: new Date(),
      read: false,
    },
  });
  
  // Emit via WebSocket
  io.to(`user:${userId}`).emit('notification', notification);
  
  // Send email if user preferences allow
  if (await shouldSendEmail(userId, type)) {
    await sendEmailNotification(userId, notification);
  }
  
  return notification;
}

// Usage in task controller
await createNotification(assigneeId, 'assigned', {
  title: 'New task assigned',
  message: `You were assigned to "${task.title}"`,
  actorId: currentUser.id,
  taskId: task.id,
  actionUrl: `/tasks/${task.id}`,
});
```

### Activity Logging

```typescript
// Automatic activity logging middleware
async function logActivity(
  userId: string,
  type: ActivityType,
  description: string,
  metadata?: Activity['metadata']
) {
  const activity = await db.activity.create({
    data: {
      userId,
      type,
      description,
      metadata,
      timestamp: new Date(),
    },
  });
  
  // Broadcast to relevant users
  const watchers = await getTaskWatchers(metadata?.taskId);
  watchers.forEach(watcher => {
    io.to(`user:${watcher.id}`).emit('activity', activity);
  });
  
  return activity;
}

// Usage examples
await logActivity(userId, 'status_changed', 'changed status', {
  field: 'status',
  oldValue: 'todo',
  newValue: 'done',
  taskId: task.id,
  taskTitle: task.title,
});

await logActivity(userId, 'commented', 'commented', {
  commentText: comment.content.substring(0, 100),
  taskId: task.id,
  taskTitle: task.title,
});
```

## Design System

### Colors
- **Notification Badge**: Orange (#FF5722)
- **Unread Background**: Orange-50 with opacity
- **Filter Active**: Orange-100 dark:Orange-950

### Animations
- **Badge zoom-in**: 50% scale with fade
- **Dropdown fade-in**: Slide from top with opacity
- **Timeline**: Static with connecting lines

### Accessibility
- ARIA labels on bell icon
- Keyboard navigation support
- Screen reader announcements for new notifications
- Focus indicators on interactive elements
- High contrast colors

## Performance Considerations

### Notification List
- Limit initial load to 50 notifications
- Pagination for "See all" page
- Virtual scrolling for large lists
- Debounce filter changes

### Activity Feed
- Lazy load activities on scroll
- Cache activities per task
- Limit to reasonable history (e.g., last 30 days)

### Email Rendering
- Pre-render common templates
- Cache rendered HTML
- Use CDN for images
- Inline critical CSS

## Testing Checklist

### NotificationCenter
- [x] Badge shows correct unread count
- [x] Dropdown opens/closes correctly
- [x] Filters work properly
- [x] Mark as read updates state
- [x] Mark all as read works
- [x] Clear all removes notifications
- [x] Click notification triggers callback
- [x] Timestamps format correctly
- [x] Empty state displays

### ActivityFeed
- [x] Timeline renders correctly
- [x] Icons match activity types
- [x] Colors are correct
- [x] Avatars display
- [x] Timestamps are relative
- [x] Field changes format properly
- [x] Comments display with quotes
- [x] Compact mode works
- [x] Empty state displays

### Email Templates
- [x] All templates render without errors
- [x] Responsive on mobile
- [x] Images load correctly
- [x] Links work
- [x] Unsubscribe link present
- [x] HTML is email-client compatible

All notifications and activity features implemented and working! 🎉
