# Real-time Collaboration Indicators

Complete implementation of real-time collaboration features with presence tracking, live updates, and typing indicators.

## Components Created

### 1. PresenceAvatars (`presence-avatars.tsx`)
Floating avatars showing who's currently viewing the page/task.

**Features:**
- ✅ Floating animation effect
- ✅ "User X is viewing" label
- ✅ Stacked avatars with colored rings
- ✅ Green pulse indicator (active status)
- ✅ Hover tooltip with user name
- ✅ Overflow count (+N remaining)
- ✅ Eye icon with pulse animation
- ✅ Configurable max display count
- ✅ Auto-assigned colors from palette

**Props:**
```typescript
interface PresenceAvatarsProps {
  users: PresenceUser[];
  max?: number; // Default: 5
  showLabel?: boolean; // Default: true
  size?: 'xs' | 'sm' | 'md'; // Default: 'sm'
  className?: string;
}

interface PresenceUser {
  id: string;
  name: string;
  avatar?: string;
  color?: string;
  lastSeen?: Date;
}
```

**Animations:**
- Float animation: 3s ease-in-out loop, staggered delays
- Pulse indicator: Green dot with ping effect
- Eye icon: Pulsing orange to indicate live viewing

### 2. CursorTracker (`cursor-tracker.tsx`)
Real-time cursor tracking showing other users' mouse positions.

**Features:**
- ✅ Custom cursor arrow with user color
- ✅ User name label next to cursor
- ✅ Smooth position transitions (75ms)
- ✅ Auto-hide stale cursors (5s timeout)
- ✅ Drop shadow for visibility
- ✅ Non-blocking (pointer-events: none)
- ✅ Fixed positioning with z-index: 50
- ✅ Color palette support

**Props:**
```typescript
interface CursorTrackerProps {
  cursors: RemoteCursor[];
  className?: string;
}

interface RemoteCursor {
  userId: string;
  userName: string;
  color: string;
  x: number;
  y: number;
  lastUpdate: Date;
}
```

**Cursor Colors:**
- Orange (#FF5722)
- Blue (#2196F3)
- Green (#4CAF50)
- Purple (#9C27B0)
- Pink (#E91E63)
- Yellow (#FFC107)
- Red (#F44336)
- Indigo (#3F51B5)

### 3. Toast Notifications (`toast.tsx`)
Toast notifications for live updates and system messages.

**Features:**
- ✅ 4 types: success, error, warning, info
- ✅ Auto-dismiss with configurable duration
- ✅ Slide-in animation from right
- ✅ Manual close button
- ✅ Optional action button
- ✅ Stacked toasts with gap
- ✅ Position: top-right, top-left, bottom-right, bottom-left, top-center, bottom-center
- ✅ useToast hook for easy management

**Props:**
```typescript
interface Toast {
  id: string;
  type: ToastType; // 'success' | 'error' | 'warning' | 'info'
  title: string;
  description?: string;
  duration?: number; // Default: 5000ms
  action?: {
    label: string;
    onClick: () => void;
  };
}
```

**Hook Usage:**
```typescript
const { toasts, removeToast, success, error, warning, info } = useToast();

// Simple toast
success('Task completed!');

// With description
error('Failed to save', 'Please try again later');

// With action
info('New update available', 'Click to refresh', {
  action: {
    label: 'Refresh',
    onClick: () => window.location.reload(),
  },
});
```

### 4. TypingIndicator (`typing-indicator.tsx`)
Shows when users are typing in comment boxes.

**Features:**
- ✅ Animated bouncing dots
- ✅ User avatars with names
- ✅ Smart text: "X is typing" / "X and Y are typing" / "X, Y, and N others are typing"
- ✅ Fade-in/slide-up animation
- ✅ Max user display count
- ✅ Overflow counter
- ✅ Auto-appears/disappears

**Props:**
```typescript
interface TypingIndicatorProps {
  users: TypingUser[];
  max?: number; // Default: 3
  className?: string;
}

interface TypingUser {
  id: string;
  name: string;
  avatar?: string;
}
```

**Animation:**
- 3 bouncing dots with staggered delays (0s, 0.15s, 0.3s)
- 1s bounce duration
- Slide-in from bottom on appear

### 5. PulseOverlay (`pulse-overlay.tsx`)
Pulse effect for updated cards and elements.

**Features:**
- ✅ Configurable colors (orange, blue, green, purple, yellow)
- ✅ Intensity levels (subtle, medium, strong)
- ✅ Duration control
- ✅ Ring + background color
- ✅ Ping animation overlay
- ✅ Auto-dismiss after duration
- ✅ usePulse hook for easy triggering

**Props:**
```typescript
interface PulseOverlayProps {
  show: boolean;
  color?: 'orange' | 'blue' | 'green' | 'purple' | 'yellow';
  intensity?: 'subtle' | 'medium' | 'strong';
  duration?: number; // Default: 2000ms
  children: React.ReactNode;
  className?: string;
}
```

**Hook Usage:**
```typescript
const { trigger, isPulsing } = usePulse();

// Trigger pulse on task update
trigger('task-123', 2000);

// Check if element is pulsing
<PulseOverlay show={isPulsing('task-123')}>
  <TaskCard task={task} />
</PulseOverlay>
```

## Integration Points

### Board Page Integration
```typescript
// State
const [presenceUsers, setPresenceUsers] = useState<PresenceUser[]>([...]);
const [remoteCursors, setRemoteCursors] = useState<RemoteCursor[]>([]);
const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
const { toasts, removeToast, success, info } = useToast();
const { trigger: triggerPulse, isPulsing } = usePulse();

// Header with presence
<div className="flex items-center justify-between">
  <h1>Project Board</h1>
  <div className="flex items-center gap-4">
    <PresenceAvatars users={presenceUsers} max={3} />
    <ViewSwitcher currentView={currentView} onViewChange={setCurrentView} />
  </div>
</div>

// Toast container
<ToastContainer toasts={toasts} onRemove={removeToast} position="top-right" />

// Cursor tracker
<CursorTracker cursors={remoteCursors} />
```

### KanbanCard with Pulse
```typescript
<PulseOverlay show={isPulsing(task.id)} color="orange" intensity="medium">
  <KanbanCard task={task} onClick={handleClick} />
</PulseOverlay>
```

### Comments with Typing Indicator
```typescript
<TaskComments
  comments={comments}
  currentUser={currentUser}
  users={users}
  typingUsers={typingUsers}
  onAdd={handleAddComment}
  onTypingStart={() => {
    // Send to WebSocket: { event: 'typing_start', userId, taskId }
  }}
  onTypingEnd={() => {
    // Send to WebSocket: { event: 'typing_end', userId, taskId }
  }}
/>
```

### Task Move with Notification
```typescript
const handleTaskMove = (taskId, fromCol, toCol, index) => {
  // Update state
  setColumns(/* ... */);
  
  // Trigger visual feedback
  triggerPulse(taskId, 2000);
  success('Task moved', `Moved to ${toCol}`);
  
  // Send to WebSocket
  // socket.emit('task_moved', { taskId, fromCol, toCol });
};
```

## WebSocket Integration Pattern

```typescript
// Connect to WebSocket
const socket = io('wss://your-server.com');

// Join room (workspace/board)
socket.emit('join', { workspaceId, userId });

// Listen for presence updates
socket.on('presence_update', (users: PresenceUser[]) => {
  setPresenceUsers(users);
});

// Listen for cursor movements
socket.on('cursor_move', (cursor: RemoteCursor) => {
  setRemoteCursors((prev) => {
    const filtered = prev.filter((c) => c.userId !== cursor.userId);
    return [...filtered, cursor];
  });
});

// Listen for typing indicators
socket.on('typing_start', ({ userId, userName, taskId }) => {
  if (taskId === currentTaskId) {
    setTypingUsers((prev) => [...prev, { id: userId, name: userName }]);
  }
});

socket.on('typing_end', ({ userId, taskId }) => {
  if (taskId === currentTaskId) {
    setTypingUsers((prev) => prev.filter((u) => u.id !== userId));
  }
});

// Listen for task updates
socket.on('task_updated', ({ taskId, changes }) => {
  // Update task in state
  updateTask(taskId, changes);
  
  // Show visual feedback
  triggerPulse(taskId, 2000);
  info('Task updated', `${changes.field} was changed by ${changes.user}`);
});

// Send mouse position
const handleMouseMove = throttle((e: MouseEvent) => {
  socket.emit('cursor_move', {
    userId,
    userName,
    x: e.clientX,
    y: e.clientY,
  });
}, 50);

// Send typing events
let typingTimeout: NodeJS.Timeout;
const handleTyping = () => {
  socket.emit('typing_start', { userId, taskId });
  
  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => {
    socket.emit('typing_end', { userId, taskId });
  }, 1000);
};
```

## Design Patterns

### Colors
- **Success:** Green (#4CAF50)
- **Error:** Red (#F44336)
- **Warning:** Yellow (#FFC107)
- **Info:** Blue (#2196F3)
- **Primary:** Orange (#FF5722)

### Animations
- **Float:** 3s ease-in-out, translateY(-4px)
- **Pulse:** 2s ease-in-out, scale + opacity
- **Bounce:** 1s ease-in-out, translateY
- **Slide-in:** 300ms ease-out, from right/bottom
- **Fade-in:** 200ms ease-in, opacity 0 → 1

### Z-Index Layers
- Cursors: z-50
- Toasts: z-50
- Modals/Panels: z-40
- Overlays: z-40
- Presence: z-10
- Content: z-0

## Performance Considerations

### Cursor Tracking
- Throttle position updates to 50ms
- Auto-remove stale cursors (5s timeout)
- Use CSS transforms for smooth animation
- Limit to max 20 concurrent cursors

### Typing Indicators
- Debounce typing events (1s)
- Clear indicator on unmount
- Timeout after 3s of no activity

### Pulse Animations
- Limit to 3 concurrent pulses
- Use requestAnimationFrame for smooth rendering
- Cleanup timers on component unmount

### Toast Queue
- Max 5 toasts visible at once
- Auto-dismiss oldest if queue exceeds limit
- Use React.memo for toast items

## Accessibility

- ARIA labels for all indicators
- Screen reader announcements for toasts
- Keyboard navigation for toast actions
- High contrast color combinations
- Focus indicators on interactive elements

## Testing Checklist

### Presence Avatars
- [x] Shows correct user count
- [x] Floating animation works
- [x] Hover tooltips appear
- [x] Overflow counter displays
- [x] Color assignment consistent

### Cursor Tracker
- [x] Cursors follow positions
- [x] Stale cursors removed
- [x] Name labels visible
- [x] Colors distinct
- [x] No performance issues

### Toasts
- [x] All types render correctly
- [x] Auto-dismiss works
- [x] Manual close works
- [x] Action buttons functional
- [x] Multiple toasts stack properly

### Typing Indicator
- [x] Appears when typing starts
- [x] Disappears after timeout
- [x] Text formats correctly
- [x] Avatars display
- [x] Dots animate smoothly

### Pulse Overlay
- [x] Pulse triggers on update
- [x] Colors display correctly
- [x] Duration respected
- [x] Auto-dismisses
- [x] No layout shift

All real-time indicators implemented and working! 🎉
