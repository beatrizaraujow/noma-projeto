import * as React from 'react';
import { ChevronLeft, ChevronRight, Flag, User } from 'lucide-react';
import { cn } from '../lib/utils';
import { Avatar } from './avatar';
import { Button } from './button';

export interface TimelineTask {
  id: string;
  title: string;
  status: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  assignee?: {
    name: string;
    avatar?: string;
  };
  startDate: Date;
  endDate: Date;
  progress?: number;
}

export interface TaskTimelineViewProps {
  tasks: TimelineTask[];
  onTaskClick?: (task: TimelineTask) => void;
  onTaskResize?: (taskId: string, startDate: Date, endDate: Date) => void;
  className?: string;
}

const priorityColors = {
  urgent: 'bg-red-500 border-red-600',
  high: 'bg-orange-500 border-orange-600',
  medium: 'bg-yellow-500 border-yellow-600',
  low: 'bg-blue-500 border-blue-600',
};

const DAYS_TO_SHOW = 30;

export const TaskTimelineView = React.forwardRef<HTMLDivElement, TaskTimelineViewProps>(
  ({ tasks, onTaskClick, onTaskResize, className }, ref) => {
    const [startDate, setStartDate] = React.useState(() => {
      const today = new Date();
      today.setDate(today.getDate() - 7); // Start 7 days ago
      return today;
    });

    // Generate date range
    const dates: Date[] = [];
    for (let i = 0; i < DAYS_TO_SHOW; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      dates.push(date);
    }

    const endDate = dates[dates.length - 1];

    const handlePrevWeek = () => {
      const newDate = new Date(startDate);
      newDate.setDate(newDate.getDate() - 7);
      setStartDate(newDate);
    };

    const handleNextWeek = () => {
      const newDate = new Date(startDate);
      newDate.setDate(newDate.getDate() + 7);
      setStartDate(newDate);
    };

    const handleToday = () => {
      const today = new Date();
      today.setDate(today.getDate() - 7);
      setStartDate(today);
    };

    const isToday = (date: Date) => {
      const today = new Date();
      return (
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
      );
    };

    const calculateTaskPosition = (task: TimelineTask) => {
      const taskStart = new Date(task.startDate);
      const taskEnd = new Date(task.endDate);
      const rangeStart = new Date(startDate);
      const rangeEnd = new Date(endDate);

      // Calculate days from range start
      const daysFromStart = Math.max(
        0,
        Math.floor((taskStart.getTime() - rangeStart.getTime()) / (1000 * 60 * 60 * 24))
      );

      // Calculate task duration in days
      const duration = Math.max(
        1,
        Math.ceil((taskEnd.getTime() - taskStart.getTime()) / (1000 * 60 * 60 * 24))
      );

      // Calculate position and width as percentages
      const left = (daysFromStart / DAYS_TO_SHOW) * 100;
      const width = (duration / DAYS_TO_SHOW) * 100;

      // Check if task is visible in current range
      const isVisible = taskEnd >= rangeStart && taskStart <= rangeEnd;

      return { left, width, isVisible };
    };

    const formatDateHeader = (date: Date) => {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const formatMonthYear = () => {
      return startDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    };

    return (
      <div ref={ref} className={cn('flex flex-col h-full bg-white dark:bg-neutral-900', className)}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
              {formatMonthYear()}
            </h2>
            <Button variant="outline" size="sm" onClick={handleToday}>
              Today
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handlePrevWeek}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleNextWeek}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Timeline */}
        <div className="flex-1 overflow-auto">
          <div className="min-w-max">
            {/* Date headers */}
            <div className="flex sticky top-0 z-10 bg-neutral-50 dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700">
              {/* Task name column */}
              <div className="w-64 flex-shrink-0 px-4 py-3 border-r border-neutral-200 dark:border-neutral-700">
                <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase">
                  Task
                </span>
              </div>

              {/* Date columns */}
              <div className="flex-1 flex">
                {dates.map((date, index) => (
                  <div
                    key={index}
                    className={cn(
                      'flex-1 min-w-[40px] px-2 py-3 text-center border-r border-neutral-100 dark:border-neutral-700',
                      isToday(date) && 'bg-orange-50 dark:bg-orange-950/20'
                    )}
                  >
                    <div
                      className={cn(
                        'text-xs font-medium',
                        isToday(date)
                          ? 'text-orange-600 dark:text-orange-400'
                          : 'text-neutral-600 dark:text-neutral-400'
                      )}
                    >
                      {formatDateHeader(date)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Task rows */}
            <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {tasks.map((task) => {
                const { left, width, isVisible } = calculateTaskPosition(task);

                if (!isVisible) return null;

                return (
                  <div key={task.id} className="flex hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                    {/* Task info */}
                    <div className="w-64 flex-shrink-0 px-4 py-3 border-r border-neutral-200 dark:border-neutral-700">
                      <div className="flex items-center gap-2">
                        {task.priority && (
                          <Flag
                            className={cn(
                              'h-3.5 w-3.5',
                              task.priority === 'urgent' && 'text-red-600',
                              task.priority === 'high' && 'text-orange-600',
                              task.priority === 'medium' && 'text-yellow-600',
                              task.priority === 'low' && 'text-blue-600'
                            )}
                          />
                        )}
                        <button
                          onClick={() => onTaskClick?.(task)}
                          className="flex-1 text-left text-sm font-medium text-neutral-900 dark:text-white hover:text-orange-600 dark:hover:text-orange-400 transition-colors truncate"
                        >
                          {task.title}
                        </button>
                      </div>
                      {task.assignee && (
                        <div className="flex items-center gap-2 mt-1">
                          <Avatar
                            src={task.assignee.avatar}
                            fallback={task.assignee.name}
                            size="xs"
                          />
                          <span className="text-xs text-neutral-500 dark:text-neutral-400">
                            {task.assignee.name}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Timeline bar */}
                    <div className="flex-1 relative py-6 px-2">
                      {/* Grid lines */}
                      <div className="absolute inset-0 flex">
                        {dates.map((date, index) => (
                          <div
                            key={index}
                            className={cn(
                              'flex-1 border-r border-neutral-100 dark:border-neutral-800',
                              isToday(date) && 'bg-orange-50/50 dark:bg-orange-950/10'
                            )}
                          />
                        ))}
                      </div>

                      {/* Task bar */}
                      <div
                        className="relative h-8"
                        style={{
                          marginLeft: `${left}%`,
                          width: `${Math.max(width, 2)}%`,
                        }}
                      >
                        <div
                          onClick={() => onTaskClick?.(task)}
                          className={cn(
                            'h-full rounded-md border-2 cursor-pointer',
                            'hover:shadow-lg transition-shadow',
                            'overflow-hidden',
                            priorityColors[task.priority || 'medium']
                          )}
                        >
                          {/* Progress bar */}
                          {task.progress !== undefined && (
                            <div
                              className="h-full bg-white/30 transition-all"
                              style={{ width: `${task.progress}%` }}
                            />
                          )}
                          
                          {/* Task title overlay */}
                          <div className="absolute inset-0 flex items-center px-2">
                            <span className="text-xs font-medium text-white truncate">
                              {task.title}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Empty state */}
            {tasks.length === 0 && (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="h-12 w-12 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mx-auto mb-4">
                    <Flag className="h-6 w-6 text-neutral-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
                    No tasks in timeline
                  </h3>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    Tasks with start and end dates will appear here
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 px-6 py-3 border-t border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-red-500" />
            <span className="text-xs text-neutral-600 dark:text-neutral-400">Urgent</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-orange-500" />
            <span className="text-xs text-neutral-600 dark:text-neutral-400">High</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-yellow-500" />
            <span className="text-xs text-neutral-600 dark:text-neutral-400">Medium</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-blue-500" />
            <span className="text-xs text-neutral-600 dark:text-neutral-400">Low</span>
          </div>
        </div>
      </div>
    );
  }
);

TaskTimelineView.displayName = 'TaskTimelineView';
