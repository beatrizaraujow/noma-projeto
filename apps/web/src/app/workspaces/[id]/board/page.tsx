'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
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
} from '@nexora/ui';
import WorkspaceLayout from '@/components/WorkspaceLayout';

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

  return (
    <WorkspaceLayout workspaceId={params.id as string}>
      <div className="h-full flex flex-col">
        {/* Toasts */}
        <ToastContainer toasts={toasts} onRemove={removeToast} position="top-right" />
        
        {/* Cursor tracker (optional) */}
        <CursorTracker cursors={remoteCursors} />

        {/* Header with view switcher and presence */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-700">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
              Project Board
            </h1>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Manage tasks and track progress
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <PresenceAvatars users={presenceUsers} max={3} />
            <ViewSwitcher currentView={currentView} onViewChange={setCurrentView} />
          </div>
        </div>

        {/* View content */}
        <div className="flex-1 overflow-hidden">
          {currentView === 'board' && (
            <KanbanBoard
              title="Project Board"
              description="Manage tasks and track progress"
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
    </WorkspaceLayout>
  );
}
