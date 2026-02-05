import * as React from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Flag } from 'lucide-react';
import { cn } from '../lib/utils';
import { Badge } from './badge';
import { Button } from './button';

export interface CalendarTask {
  id: string;
  title: string;
  status: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  dueDate: Date;
  labels?: Array<{
    id: string;
    name: string;
    color: string;
  }>;
}

export interface TaskCalendarViewProps {
  tasks: CalendarTask[];
  selectedDate?: Date;
  onTaskClick?: (task: CalendarTask) => void;
  onDateClick?: (date: Date) => void;
  onTaskDrop?: (taskId: string, newDate: Date) => void;
  className?: string;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const priorityColors = {
  urgent: 'bg-red-500 dark:bg-red-600',
  high: 'bg-orange-500 dark:bg-orange-600',
  medium: 'bg-yellow-500 dark:bg-yellow-600',
  low: 'bg-blue-500 dark:bg-blue-600',
};

export const TaskCalendarView = React.forwardRef<HTMLDivElement, TaskCalendarViewProps>(
  ({ tasks, selectedDate, onTaskClick, onDateClick, onTaskDrop, className }, ref) => {
    const [currentDate, setCurrentDate] = React.useState(new Date());
    const [draggedTask, setDraggedTask] = React.useState<string | null>(null);
    const [hoveredDate, setHoveredDate] = React.useState<Date | null>(null);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // Get first day of month and number of days
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    // Generate calendar days
    const calendarDays: Array<{ date: Date; isCurrentMonth: boolean }> = [];

    // Previous month days
    for (let i = firstDay - 1; i >= 0; i--) {
      calendarDays.push({
        date: new Date(year, month - 1, daysInPrevMonth - i),
        isCurrentMonth: false,
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      calendarDays.push({
        date: new Date(year, month, i),
        isCurrentMonth: true,
      });
    }

    // Next month days to fill grid
    const remainingDays = 42 - calendarDays.length; // 6 weeks * 7 days
    for (let i = 1; i <= remainingDays; i++) {
      calendarDays.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
      });
    }

    const getTasksForDate = (date: Date) => {
      return tasks.filter((task) => {
        const taskDate = new Date(task.dueDate);
        return (
          taskDate.getFullYear() === date.getFullYear() &&
          taskDate.getMonth() === date.getMonth() &&
          taskDate.getDate() === date.getDate()
        );
      });
    };

    const isToday = (date: Date) => {
      const today = new Date();
      return (
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
      );
    };

    const isSelected = (date: Date) => {
      if (!selectedDate) return false;
      return (
        date.getDate() === selectedDate.getDate() &&
        date.getMonth() === selectedDate.getMonth() &&
        date.getFullYear() === selectedDate.getFullYear()
      );
    };

    const handlePrevMonth = () => {
      setCurrentDate(new Date(year, month - 1, 1));
    };

    const handleNextMonth = () => {
      setCurrentDate(new Date(year, month + 1, 1));
    };

    const handleToday = () => {
      setCurrentDate(new Date());
    };

    const handleTaskDragStart = (taskId: string) => {
      setDraggedTask(taskId);
    };

    const handleTaskDragEnd = () => {
      setDraggedTask(null);
      setHoveredDate(null);
    };

    const handleDateDragOver = (e: React.DragEvent, date: Date) => {
      e.preventDefault();
      setHoveredDate(date);
    };

    const handleDateDragLeave = () => {
      setHoveredDate(null);
    };

    const handleDateDrop = (e: React.DragEvent, date: Date) => {
      e.preventDefault();
      if (draggedTask && onTaskDrop) {
        onTaskDrop(draggedTask, date);
      }
      setDraggedTask(null);
      setHoveredDate(null);
    };

    return (
      <div ref={ref} className={cn('flex flex-col h-full bg-white dark:bg-neutral-900', className)}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
              {MONTHS[month]} {year}
            </h2>
            <Button variant="outline" size="sm" onClick={handleToday}>
              Today
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handlePrevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="flex-1 overflow-auto p-4">
          <div className="grid grid-cols-7 gap-px bg-neutral-200 dark:bg-neutral-700 rounded-lg overflow-hidden">
            {/* Day headers */}
            {DAYS.map((day) => (
              <div
                key={day}
                className="bg-neutral-50 dark:bg-neutral-800 px-2 py-3 text-center"
              >
                <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase">
                  {day}
                </span>
              </div>
            ))}

            {/* Calendar days */}
            {calendarDays.map((day, index) => {
              const dayTasks = getTasksForDate(day.date);
              const isHovered =
                hoveredDate &&
                hoveredDate.getDate() === day.date.getDate() &&
                hoveredDate.getMonth() === day.date.getMonth() &&
                hoveredDate.getFullYear() === day.date.getFullYear();

              return (
                <div
                  key={index}
                  onClick={() => onDateClick?.(day.date)}
                  onDragOver={(e) => handleDateDragOver(e, day.date)}
                  onDragLeave={handleDateDragLeave}
                  onDrop={(e) => handleDateDrop(e, day.date)}
                  className={cn(
                    'bg-white dark:bg-neutral-900 min-h-[120px] p-2',
                    'cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors',
                    !day.isCurrentMonth && 'opacity-40',
                    isHovered && 'ring-2 ring-orange-500 ring-inset',
                    isSelected(day.date) && 'ring-2 ring-orange-500 ring-inset'
                  )}
                >
                  {/* Date number */}
                  <div
                    className={cn(
                      'flex items-center justify-center w-7 h-7 rounded-full mb-1 text-sm font-medium',
                      isToday(day.date)
                        ? 'bg-orange-600 text-white'
                        : 'text-neutral-700 dark:text-neutral-300'
                    )}
                  >
                    {day.date.getDate()}
                  </div>

                  {/* Tasks */}
                  <div className="space-y-1">
                    {dayTasks.slice(0, 3).map((task) => (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={() => handleTaskDragStart(task.id)}
                        onDragEnd={handleTaskDragEnd}
                        onClick={(e) => {
                          e.stopPropagation();
                          onTaskClick?.(task);
                        }}
                        className={cn(
                          'group relative px-2 py-1 rounded text-xs font-medium cursor-grab active:cursor-grabbing',
                          'hover:shadow-md transition-shadow',
                          'text-white truncate',
                          priorityColors[task.priority || 'medium'],
                          draggedTask === task.id && 'opacity-50'
                        )}
                        title={task.title}
                      >
                        {task.title}
                      </div>
                    ))}
                    {dayTasks.length > 3 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDateClick?.(day.date);
                        }}
                        className="text-xs text-neutral-500 dark:text-neutral-400 hover:text-orange-600 dark:hover:text-orange-400 font-medium"
                      >
                        +{dayTasks.length - 3} more
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
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

TaskCalendarView.displayName = 'TaskCalendarView';
