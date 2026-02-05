import * as React from 'react';
import { Plus, MoreVertical, GripVertical } from 'lucide-react';
import { cn } from '../lib/utils';
import { KanbanCard, KanbanCardPlaceholder, KanbanTask } from './kanban-card';
import { Button } from './button';
import { Badge } from './badge';

export interface KanbanColumn {
  id: string;
  title: string;
  tasks: KanbanTask[];
  color?: string;
  limit?: number;
}

export interface KanbanColumnProps {
  column: KanbanColumn;
  onTaskClick?: (task: KanbanTask) => void;
  onAddTask?: (columnId: string) => void;
  onTaskDragStart?: (task: KanbanTask, columnId: string) => void;
  onTaskDragEnd?: () => void;
  onTaskDrop?: (taskId: string, targetColumnId: string, targetIndex: number) => void;
  isDragOver?: boolean;
  draggedTaskId?: string | null;
  className?: string;
}

export const KanbanColumn = React.forwardRef<HTMLDivElement, KanbanColumnProps>(
  (
    {
      column,
      onTaskClick,
      onAddTask,
      onTaskDragStart,
      onTaskDragEnd,
      onTaskDrop,
      isDragOver = false,
      draggedTaskId = null,
      className,
    },
    ref
  ) => {
    const [isDraggingOver, setIsDraggingOver] = React.useState(false);
    const [dropIndex, setDropIndex] = React.useState<number | null>(null);

    const isOverLimit = column.limit && column.tasks.length >= column.limit;

    const handleDragOver = (e: React.DragEvent, index?: number) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDraggingOver(true);
      if (index !== undefined) {
        setDropIndex(index);
      }
    };

    const handleDragLeave = (e: React.DragEvent) => {
      e.preventDefault();
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const x = e.clientX;
      const y = e.clientY;

      if (x < rect.left || x >= rect.right || y < rect.top || y >= rect.bottom) {
        setIsDraggingOver(false);
        setDropIndex(null);
      }
    };

    const handleDrop = (e: React.DragEvent, index: number) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDraggingOver(false);
      setDropIndex(null);

      if (draggedTaskId && onTaskDrop) {
        onTaskDrop(draggedTaskId, column.id, index);
      }
    };

    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col h-full min-w-[320px] max-w-[360px]',
          'bg-neutral-50 dark:bg-neutral-900',
          'rounded-xl',
          'transition-colors',
          isDragOver && 'bg-orange-50 dark:bg-orange-900/20',
          className
        )}
      >
        {/* Column Header */}
        <div className="flex items-center justify-between gap-2 p-4 pb-3">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {/* Color indicator */}
            {column.color && (
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: column.color }}
              />
            )}

            {/* Title */}
            <h3 className="font-semibold text-sm text-neutral-900 dark:text-white truncate">
              {column.title}
            </h3>

            {/* Count badge */}
            <Badge variant="neutral" size="sm">
              {column.tasks.length}
              {column.limit && `/${column.limit}`}
            </Badge>

            {/* Over limit warning */}
            {isOverLimit && (
              <Badge variant="warning" size="sm">
                !
              </Badge>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            {onAddTask && (
              <button
                onClick={() => onAddTask(column.id)}
                className="p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                title="Add task"
              >
                <Plus className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
              </button>
            )}
            <button
              className="p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
              title="Column options"
            >
              <MoreVertical className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
            </button>
          </div>
        </div>

        {/* Tasks list */}
        <div
          className={cn(
            'flex-1 px-4 pb-4 overflow-y-auto space-y-2',
            'scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-700'
          )}
          onDragOver={(e) => handleDragOver(e)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, column.tasks.length)}
        >
          {column.tasks.length === 0 ? (
            // Empty state
            <div
              className={cn(
                'flex flex-col items-center justify-center',
                'border-2 border-dashed border-neutral-300 dark:border-neutral-700',
                'rounded-lg p-8 text-center',
                isDraggingOver && 'border-orange-400 bg-orange-50 dark:bg-orange-900/20'
              )}
            >
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                {isDraggingOver ? 'Drop here' : 'No tasks'}
              </p>
            </div>
          ) : (
            column.tasks.map((task, index) => (
              <React.Fragment key={task.id}>
                {/* Drop zone indicator */}
                {isDraggingOver && dropIndex === index && draggedTaskId !== task.id && (
                  <KanbanCardPlaceholder />
                )}

                {/* Task card */}
                <div
                  draggable
                  onDragStart={(e) => {
                    if (onTaskDragStart) {
                      onTaskDragStart(task, column.id);
                    }
                  }}
                  onDragEnd={(e) => {
                    if (onTaskDragEnd) {
                      onTaskDragEnd();
                    }
                  }}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDrop={(e) => handleDrop(e, index)}
                >
                  <KanbanCard
                    task={task}
                    onClick={() => onTaskClick?.(task)}
                    isDragging={draggedTaskId === task.id}
                  />
                </div>
              </React.Fragment>
            ))
          )}

          {/* Drop zone at the end */}
          {isDraggingOver &&
            dropIndex === column.tasks.length &&
            column.tasks.length > 0 && <KanbanCardPlaceholder />}
        </div>
      </div>
    );
  }
);

KanbanColumn.displayName = 'KanbanColumn';
