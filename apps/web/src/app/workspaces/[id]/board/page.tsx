'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  KanbanBoard,
  KanbanTask,
  KanbanColumnType,
  TaskDetailPanel,
  Task,
  ViewSwitcher,
  ViewType,
  TaskListView,
  TaskListItem,
  TaskCalendarView,
  CalendarTask,
  TaskTimelineView,
  TimelineTask,
  SortField,
  SortDirection,
  PresenceAvatars,
  PresenceUser,
  CursorTracker,
  RemoteCursor,
  ToastContainer,
  useToast,
  usePulse,
  NotificationCenter,
  Notification,
  NotificationFilter,
} from '@nexora/ui';

// Mock data
const mockColumns: KanbanColumnType[] = [
  {
    id: 'backlog',
    title: 'Backlog',
    color: '#94a3b8',
    tasks: [
      {
        id: '1',
        title: 'Research user authentication patterns',
        status: 'backlog',
        priority: 'low',
        assignee: {
          name: 'Alice Johnson',
          avatar: undefined,
        },
        dueDate: new Date('2026-02-15'),
        commentsCount: 3,
        attachmentsCount: 2,
        labels: [
          { id: 'l1', name: 'Research', color: '#3b82f6' },
          { id: 'l2', name: 'Backend', color: '#8b5cf6' },
        ],
      },
      {
        id: '2',
        title: 'Create API documentation',
        status: 'backlog',
        priority: 'medium',
        dueDate: new Date('2026-02-20'),
        commentsCount: 1,
        labels: [{ id: 'l3', name: 'Documentation', color: '#06b6d4' }],
      },
    ],
  },
  {
    id: 'todo',
    title: 'To Do',
    color: '#6366f1',
    limit: 5,
    tasks: [
      {
        id: '3',
        title: 'Design new dashboard layout',
        status: 'todo',
        priority: 'high',
        assignee: {
          name: 'Bob Smith',
          avatar: undefined,
        },
        dueDate: new Date('2026-02-08'),
        commentsCount: 5,
        attachmentsCount: 4,
        labels: [
          { id: 'l4', name: 'Design', color: '#ec4899' },
          { id: 'l5', name: 'UI/UX', color: '#f59e0b' },
        ],
      },
      {
        id: '4',
        title: 'Implement user profile page',
        status: 'todo',
        priority: 'urgent',
        assignee: {
          name: 'Carol White',
          avatar: undefined,
        },
        dueDate: new Date('2026-02-06'),
        commentsCount: 8,
        labels: [{ id: 'l6', name: 'Frontend', color: '#10b981' }],
      },
      {
        id: '5',
        title: 'Setup CI/CD pipeline',
        status: 'todo',
        priority: 'high',
        dueDate: new Date('2026-02-10'),
        commentsCount: 2,
        labels: [{ id: 'l7', name: 'DevOps', color: '#ef4444' }],
      },
    ],
  },
  {
    id: 'in-progress',
    title: 'In Progress',
    color: '#f59e0b',
    limit: 3,
    tasks: [
      {
        id: '6',
        title: 'Refactor authentication module',
        status: 'in-progress',
        priority: 'high',
        assignee: {
          name: 'David Brown',
          avatar: undefined,
        },
        dueDate: new Date('2026-02-12'),
        commentsCount: 12,
        attachmentsCount: 1,
        labels: [
          { id: 'l2', name: 'Backend', color: '#8b5cf6' },
          { id: 'l8', name: 'Security', color: '#ef4444' },
        ],
      },
      {
        id: '7',
        title: 'Optimize database queries',
        status: 'in-progress',
        priority: 'medium',
        assignee: {
          name: 'Eve Davis',
          avatar: undefined,
        },
        dueDate: new Date('2026-02-18'),
        commentsCount: 6,
        labels: [{ id: 'l9', name: 'Performance', color: '#14b8a6' }],
      },
    ],
  },
  {
    id: 'review',
    title: 'In Review',
    color: '#8b5cf6',
    tasks: [
      {
        id: '8',
        title: 'Add dark mode support',
        status: 'review',
        priority: 'medium',
        assignee: {
          name: 'Frank Miller',
          avatar: undefined,
        },
        dueDate: new Date('2026-02-09'),
        commentsCount: 4,
        attachmentsCount: 3,
        labels: [
          { id: 'l4', name: 'Design', color: '#ec4899' },
          { id: 'l6', name: 'Frontend', color: '#10b981' },
        ],
      },
    ],
  },
  {
    id: 'done',
    title: 'Done',
    color: '#10b981',
    tasks: [
      {
        id: '9',
        title: 'Setup project repository',
        status: 'done',
        priority: 'high',
        assignee: {
          name: 'Grace Lee',
          avatar: undefined,
        },
        dueDate: new Date('2026-02-01'),
        commentsCount: 7,
        labels: [{ id: 'l7', name: 'DevOps', color: '#ef4444' }],
      },
      {
        id: '10',
        title: 'Create design system',
        status: 'done',
        priority: 'high',
        assignee: {
          name: 'Henry Wilson',
          avatar: undefined,
        },
        dueDate: new Date('2026-02-03'),
        commentsCount: 15,
        attachmentsCount: 8,
        labels: [{ id: 'l4', name: 'Design', color: '#ec4899' }],
      },
    ],
  },
];

const mockMembers = [
  { id: 'u1', name: 'Alice Johnson' },
  { id: 'u2', name: 'Bob Smith' },
  { id: 'u3', name: 'Carol White' },
  { id: 'u4', name: 'David Brown' },
  { id: 'u5', name: 'Eve Davis' },
  { id: 'u6', name: 'Frank Miller' },
  { id: 'u7', name: 'Grace Lee' },
  { id: 'u8', name: 'Henry Wilson' },
];

const mockCurrentUser = {
  id: 'current-user',
  name: 'Current User',
  avatar: undefined,
};

const mockUsers = [
  { id: 'u1', name: 'Alice Johnson', avatar: undefined },
  { id: 'u2', name: 'Bob Smith', avatar: undefined },
  { id: 'u3', name: 'Carol White', avatar: undefined },
  { id: 'u4', name: 'David Brown', avatar: undefined },
  { id: 'u5', name: 'Eve Davis', avatar: undefined },
];

export default function BoardPage() {
  const params = useParams();
  const router = useRouter();
  const [columns, setColumns] = React.useState<KanbanColumnType[]>(mockColumns);
  const [selectedTask, setSelectedTask] = React.useState<Task | null>(null);
  const [isTaskDetailOpen, setIsTaskDetailOpen] = React.useState(false);
  const [currentView, setCurrentView] = React.useState<ViewType>('board');
  const [sortField, setSortField] = React.useState<SortField>('title');
  const [sortDirection, setSortDirection] = React.useState<SortDirection>('asc');
  const [selectedTasks, setSelectedTasks] = React.useState<string[]>([]);
  
  // Real-time collaboration states
  const [presenceUsers, setPresenceUsers] = React.useState<PresenceUser[]>([
    { id: 'u2', name: 'Jane Smith', avatar: undefined, color: 'orange' },
    { id: 'u3', name: 'Bob Johnson', avatar: undefined, color: 'blue' },
  ]);
  const [remoteCursors, setRemoteCursors] = React.useState<RemoteCursor[]>([]);
  const [typingUsers, setTypingUsers] = React.useState<Array<{ id: string; name: string; avatar?: string }>>([]);
  const { toasts, removeToast, success, info } = useToast();
  const { trigger: triggerPulse, isPulsing } = usePulse();

  // Notifications state
  const [notifications, setNotifications] = React.useState<Notification[]>([
    {
      id: 'n1',
      type: 'assigned',
      title: 'New task assigned',
      message: 'You were assigned to "Design new dashboard layout"',
      actor: { name: 'Bob Smith', avatar: undefined },
      timestamp: new Date(Date.now() - 300000), // 5m ago
      read: false,
      metadata: { taskId: '3', taskTitle: 'Design new dashboard layout' },
    },
    {
      id: 'n2',
      type: 'mention',
      title: 'You were mentioned',
      message: '@you What do you think about this approach?',
      actor: { name: 'Jane Smith', avatar: undefined },
      timestamp: new Date(Date.now() - 1800000), // 30m ago
      read: false,
      metadata: { taskId: '6', taskTitle: 'Refactor authentication module' },
    },
    {
      id: 'n3',
      type: 'comment',
      title: 'New comment',
      message: 'Alice commented on your task',
      actor: { name: 'Alice Johnson', avatar: undefined },
      timestamp: new Date(Date.now() - 3600000), // 1h ago
      read: true,
      metadata: { taskId: '4', taskTitle: 'Implement user profile page' },
    },
    {
      id: 'n4',
      type: 'due',
      title: 'Task due soon',
      message: 'Implement user profile page is due tomorrow',
      timestamp: new Date(Date.now() - 7200000), // 2h ago
      read: true,
      metadata: { taskId: '4', taskTitle: 'Implement user profile page' },
    },
  ]);
  const [notificationFilter, setNotificationFilter] = React.useState<NotificationFilter>('all');
  
  const unreadCount = React.useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  const handleNotificationClick = (notification: Notification) => {
    console.log('Notification clicked:', notification);
    // TODO: Navigate to task or relevant page
    if (notification.metadata?.taskId) {
      // Find and open the task
      info('Opening task', notification.metadata.taskTitle || 'Task');
    }
  };

  const handleMarkAsRead = (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    success('All notifications marked as read');
  };

  const handleClearAll = () => {
    setNotifications([]);
    info('All notifications cleared');
  };

  const handleTaskClick = (task: KanbanTask) => {
    console.log('Task clicked:', task);
    
    // Simulate real-time notification
    info('Task opened', `Viewing "${task.title}"`);
    
    // Convert KanbanTask to full Task object
    const fullTask: Task = {
      id: task.id,
      title: task.title,
      description: '<p>This is a detailed description with <strong>rich text</strong> formatting. It supports <em>italics</em>, <u>underline</u>, and more.</p><ul><li>Bullet points</li><li>And lists</li></ul>',
      metadata: {
        status: task.status as 'backlog' | 'todo' | 'in-progress' | 'review' | 'done',
        priority: task.priority,
        assignee: task.assignee,
        dueDate: task.dueDate,
        labels: task.labels || [],
        project: { id: 'p1', name: 'Main Project' },
      },
      activities: [
        {
          id: '1',
          type: 'created',
          user: { name: 'John Doe', avatar: undefined },
          timestamp: new Date(Date.now() - 86400000 * 2),
        },
        {
          id: '2',
          type: 'status_changed',
          user: { name: 'Jane Smith', avatar: undefined },
          timestamp: new Date(Date.now() - 86400000),
          changes: { field: 'status', from: 'todo', to: task.status },
        },
      ],
      comments: [
        {
          id: 'c1',
          author: { name: 'Jane Smith', avatar: undefined },
          content: 'This looks great! Can we discuss the @johndoe approach?',
          timestamp: new Date(Date.now() - 3600000 * 4),
          mentions: ['@johndoe'],
        },
      ],
      attachments: [
        {
          id: 'a1',
          name: 'design-mockup.png',
          type: 'image/png',
          size: 2048000,
          url: 'https://placehold.co/600x400',
          uploadedBy: { name: 'John Doe', avatar: undefined },
          uploadedAt: new Date(Date.now() - 86400000),
        },
      ],
    };
    
    setSelectedTask(fullTask);
    setIsTaskDetailOpen(true);
  };

  const handleTaskMove = (
    taskId: string,
    fromColumn: string,
    toColumn: string,
    toIndex: number
  ) => {
    setColumns((prevColumns) => {
      // Find source and target columns
      const sourceColumn = prevColumns.find((col) => col.id === fromColumn);
      const targetColumn = prevColumns.find((col) => col.id === toColumn);

      if (!sourceColumn || !targetColumn) return prevColumns;

      // Find the task
      const taskIndex = sourceColumn.tasks.findIndex((task) => task.id === taskId);
      if (taskIndex === -1) return prevColumns;

      const task = sourceColumn.tasks[taskIndex];

      // Create new columns array
      return prevColumns.map((col) => {
        if (col.id === fromColumn) {
          // Remove from source
          return {
            ...col,
            tasks: col.tasks.filter((t) => t.id !== taskId),
          };
        } else if (col.id === toColumn) {
          // Add to target at specific index
          const newTasks = [...col.tasks];
          newTasks.splice(toIndex, 0, { ...task, status: toColumn });
          return {
            ...col,
            tasks: newTasks,
          };
        }
        return col;
      });
    });
    
    // Trigger pulse animation and notification
    triggerPulse(taskId, 2000);
    success('Task moved', `Task moved to ${toColumn}`);

    // TODO: Call API to update task status
    console.log(`Moved task ${taskId} from ${fromColumn} to ${toColumn} at index ${toIndex}`);
  };

  const handleAddTask = (columnId?: string) => {
    console.log('Add task to column:', columnId);
    // TODO: Open create task modal
  };

  const handleShare = () => {
    console.log('Share board');
    // TODO: Open share modal
  };

  // Get all tasks from all columns
  const allTasks = React.useMemo(() => {
    return columns.flatMap((col) => col.tasks);
  }, [columns]);

  // Convert to list view format
  const listTasks: TaskListItem[] = React.useMemo(() => {
    return allTasks.map((task) => ({
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
  }, [allTasks]);

  // Convert to calendar view format
  const calendarTasks: CalendarTask[] = React.useMemo(() => {
    return allTasks
      .filter((task) => task.dueDate)
      .map((task) => ({
        id: task.id,
        title: task.title,
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate!,
        labels: task.labels,
      }));
  }, [allTasks]);

  // Convert to timeline view format
  const timelineTasks: TimelineTask[] = React.useMemo(() => {
    return allTasks
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
  }, [allTasks]);

  // Sorting logic
  const sortedTasks = React.useMemo(() => {
    const sorted = [...listTasks];
    sorted.sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      if (sortField === 'assignee') {
        aValue = a.assignee?.name || '';
        bValue = b.assignee?.name || '';
      } else if (sortField === 'dueDate') {
        aValue = a.dueDate?.getTime() || 0;
        bValue = b.dueDate?.getTime() || 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [listTasks, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleTaskSelect = (taskId: string, selected: boolean) => {
    setSelectedTasks((prev) =>
      selected ? [...prev, taskId] : prev.filter((id) => id !== taskId)
    );
  };

  const handleSelectAll = (selected: boolean) => {
    setSelectedTasks(selected ? allTasks.map((t) => t.id) : []);
  };

  const handleCalendarTaskDrop = (taskId: string, newDate: Date) => {
    // TODO: Update task due date
    console.log('Task dropped on calendar:', taskId, newDate);
    success('Task rescheduled', `Due date updated to ${newDate.toLocaleDateString()}`);
  };

  // Simulate mouse tracking for cursor presence (optional)
  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // In a real app, this would send to WebSocket server
      // For demo, we'll just update local state periodically
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const [sidebarOpen, setSidebarOpen] = React.useState(true);

  return (
    <div className="flex h-screen bg-[#0f0f0f]">
      {/* Toasts */}
      <ToastContainer toasts={toasts} onRemove={removeToast} position="top-right" />
      
      {/* Cursor tracker (optional) */}
      <CursorTracker cursors={remoteCursors} />

      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-[#1a1a1a] border-r border-gray-800 transition-all duration-300 flex flex-col`}>
        <div className="p-4 border-b border-gray-800">
          <Link href="/workspaces">
            <span className="text-2xl font-bold text-white">
              <span className="text-orange-500">/</span>noma
            </span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <button 
            onClick={() => router.push(`/workspaces/${params.id}`)}
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 rounded-lg hover:bg-[#2a2a2a] hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <rect x="3" y="3" width="7" height="7" strokeWidth="2"/>
              <rect x="14" y="3" width="7" height="7" strokeWidth="2"/>
              <rect x="14" y="14" width="7" height="7" strokeWidth="2"/>
              <rect x="3" y="14" width="7" height="7" strokeWidth="2"/>
            </svg>
            {sidebarOpen && <span className="font-medium">Painel</span>}
          </button>

          <button 
            onClick={() => router.push(`/workspaces/${params.id}/analytics`)}
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 rounded-lg hover:bg-[#2a2a2a] hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            {sidebarOpen && <span className="font-medium">Análises</span>}
          </button>

          <button 
            onClick={() => router.push(`/workspaces/${params.id}/projects`)}
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 rounded-lg hover:bg-[#2a2a2a] hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
            {sidebarOpen && <span className="font-medium">Projetos</span>}
          </button>

          <button 
            onClick={() => router.push(`/workspaces/${params.id}/invoices`)}
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 rounded-lg hover:bg-[#2a2a2a] hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {sidebarOpen && <span className="font-medium">Faturas</span>}
          </button>

          <button 
            onClick={() => router.push(`/workspaces/${params.id}/recurring`)}
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 rounded-lg hover:bg-[#2a2a2a] hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {sidebarOpen && <span className="font-medium">Recorrente</span>}
          </button>

          <button 
            onClick={() => router.push(`/workspaces/${params.id}/reports`)}
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 rounded-lg hover:bg-[#2a2a2a] hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {sidebarOpen && <span className="font-medium">Relatórios</span>}
          </button>

          <button 
            onClick={() => router.push(`/workspaces/${params.id}/feedback`)}
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 rounded-lg hover:bg-[#2a2a2a] hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            {sidebarOpen && <span className="font-medium">Feedback</span>}
          </button>
        </nav>

        <div className="p-4 m-4 bg-gradient-to-br from-orange-600 to-red-600 rounded-xl">
          <h3 className="text-white font-bold mb-1">Upgrade Pro!</h3>
          <p className="text-white/80 text-xs mb-3">Maior produtividade com melhores recursos</p>
          <button className="w-full px-4 py-2 bg-white text-orange-600 rounded-lg text-sm font-semibold hover:bg-gray-100 transition-colors">
            Fazer Upgrade
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header with view switcher and presence */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#1a1a1a] border-b border-gray-800">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white">
              Quadro de Tarefas
            </h1>
            <p className="text-sm text-gray-400">
              Gerencie tarefas e acompanhe o progresso
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <NotificationCenter
              notifications={notifications}
              unreadCount={unreadCount}
              filter={notificationFilter}
              onFilterChange={setNotificationFilter}
              onNotificationClick={handleNotificationClick}
              onMarkAsRead={handleMarkAsRead}
              onMarkAllAsRead={handleMarkAllAsRead}
              onClearAll={handleClearAll}
            />
            <PresenceAvatars users={presenceUsers} max={3} />
            <ViewSwitcher currentView={currentView} onViewChange={setCurrentView} />
            <button 
              onClick={() => router.push('/workspaces')}
              className="p-2 bg-[#2a2a2a] text-white rounded-lg hover:bg-[#333] transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* View content */}
        <div className="flex-1 overflow-hidden bg-[#0f0f0f]">
          {currentView === 'board' && (
            <KanbanBoard
              columns={columns}
              onTaskClick={handleTaskClick}
              onTaskMove={handleTaskMove}
              onAddTask={handleAddTask}
              onShare={handleShare}
              members={mockMembers}
            />
          )}

          {currentView === 'list' && (
            <TaskListView
              tasks={sortedTasks}
              selectedTasks={selectedTasks}
              sortField={sortField}
              sortDirection={sortDirection}
              onTaskClick={handleTaskClick}
              onTaskSelect={handleTaskSelect}
              onSelectAll={handleSelectAll}
              onSort={handleSort}
              onEdit={(taskId: string, field: string, value: any) => {
                console.log('Edit task:', taskId, field, value);
                // TODO: Update task field
              }}
              onDelete={(taskId: string) => {
                console.log('Delete task:', taskId);
                // TODO: Delete task
              }}
            />
          )}

          {currentView === 'calendar' && (
            <TaskCalendarView
              tasks={calendarTasks}
              onTaskClick={handleTaskClick}
              onDateClick={(date: Date) => {
                console.log('Date clicked:', date);
                // TODO: Filter tasks by date or create new task
              }}
              onTaskDrop={handleCalendarTaskDrop}
            />
          )}

          {currentView === 'timeline' && (
            <TaskTimelineView
              tasks={timelineTasks}
              onTaskClick={handleTaskClick}
              onTaskResize={(taskId: string, startDate: Date, endDate: Date) => {
                console.log('Task resized:', taskId, startDate, endDate);
                // TODO: Update task dates
              }}
            />
          )}
        </div>

        {/* Task Detail Panel */}
        {selectedTask && (
          <TaskDetailPanel
            task={selectedTask}
            isOpen={isTaskDetailOpen}
            onClose={() => {
              setIsTaskDetailOpen(false);
              setSelectedTask(null);
            }}
            currentUser={mockCurrentUser}
            users={mockUsers}
            typingUsers={typingUsers}
            onTitleChange={(title: string) => {
              console.log('Title changed:', title);
              setSelectedTask((prev) => prev ? { ...prev, title } : null);
              // TODO: Call API to update title
            }}
            onDescriptionChange={(description: string) => {
              console.log('Description changed:', description);
              setSelectedTask((prev) => prev ? { ...prev, description } : null);
              // TODO: Call API to update description
            }}
            onMetadataChange={(metadata) => {
              console.log('Metadata changed:', metadata);
              setSelectedTask((prev) =>
                prev ? { ...prev, metadata: { ...prev.metadata, ...metadata } } : null
              );
              // TODO: Call API to update metadata
            }}
            onCommentTypingStart={() => {
              console.log('User started typing');
              // TODO: Send typing indicator to WebSocket
            }}
            onCommentTypingEnd={() => {
              console.log('User stopped typing');
              // TODO: Send typing stopped to WebSocket
            }}
            onAddComment={(content: string, mentions: string[]) => {
              console.log('Comment added:', content, mentions);
              const newComment = {
                id: `c${Date.now()}`,
                author: { name: 'Current User', avatar: undefined },
                content,
                timestamp: new Date(),
                mentions,
              };
              setSelectedTask((prev) =>
                prev ? { ...prev, comments: [...prev.comments, newComment] } : null
              );
              // TODO: Call API to add comment
            }}
            onEditComment={(commentId: string, content: string) => {
              console.log('Comment edited:', commentId, content);
              setSelectedTask((prev) =>
                prev
                  ? {
                      ...prev,
                      comments: prev.comments.map((c) =>
                        c.id === commentId ? { ...c, content, isEdited: true } : c
                      ),
                    }
                  : null
              );
              // TODO: Call API to edit comment
            }}
            onDeleteComment={(commentId: string) => {
              console.log('Comment deleted:', commentId);
              setSelectedTask((prev) =>
                prev
                  ? {
                      ...prev,
                      comments: prev.comments.filter((c) => c.id !== commentId),
                    }
                  : null
              );
              // TODO: Call API to delete comment
            }}
            onUploadAttachment={(files: FileList) => {
              console.log('Attachments uploaded:', files);
              const newAttachments = Array.from(files).map((file, index) => ({
                id: `a${Date.now()}-${index}`,
                name: file.name,
                type: file.type,
                size: file.size,
                url: URL.createObjectURL(file),
                uploadedBy: { name: 'Current User', avatar: undefined },
                uploadedAt: new Date(),
              }));
              setSelectedTask((prev) =>
                prev
                  ? { ...prev, attachments: [...prev.attachments, ...newAttachments] }
                  : null
              );
              // TODO: Call API to upload attachments
            }}
            onDeleteAttachment={(attachmentId: string) => {
              console.log('Attachment deleted:', attachmentId);
              setSelectedTask((prev) =>
                prev
                  ? {
                      ...prev,
                      attachments: prev.attachments.filter((a) => a.id !== attachmentId),
                    }
                  : null
              );
              // TODO: Call API to delete attachment
            }}
            onCopy={() => {
              console.log('Task copied');
              // TODO: Copy task link to clipboard
            }}
            onArchive={() => {
              console.log('Task archived');
              setIsTaskDetailOpen(false);
              // TODO: Call API to archive task
            }}
            onDelete={() => {
              console.log('Task deleted');
              setIsTaskDetailOpen(false);
              // TODO: Call API to delete task
            }}
          />
        )}
      </div>
    </div>
  );
}
