'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { KanbanBoard, KanbanTask, KanbanColumnType } from '@nexora/ui';
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
  { name: 'Alice Johnson' },
  { name: 'Bob Smith' },
  { name: 'Carol White' },
  { name: 'David Brown' },
  { name: 'Eve Davis' },
  { name: 'Frank Miller' },
  { name: 'Grace Lee' },
  { name: 'Henry Wilson' },
];

export default function BoardPage() {
  const params = useParams();
  const router = useRouter();
  const [columns, setColumns] = React.useState<KanbanColumnType[]>(mockColumns);

  const handleTaskClick = (task: KanbanTask) => {
    console.log('Task clicked:', task);
    // TODO: Open task detail modal or navigate to task page
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

  return (
    <WorkspaceLayout>
      <div className="h-full">
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
      </div>
    </WorkspaceLayout>
  );
}
