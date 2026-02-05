import * as React from 'react';
import { cn } from '../lib/utils';
import { KanbanColumn, KanbanColumn as KanbanColumnType } from './kanban-column';
import { KanbanTask } from './kanban-card';
import { BoardHeader, BoardView, BoardFilter } from './board-header';

export interface KanbanBoardProps {
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
  className?: string;
}

export const KanbanBoard = React.forwardRef<HTMLDivElement, KanbanBoardProps>(
  (
    {
      title,
      description,
      columns,
      onTaskClick,
      onTaskMove,
      onAddTask,
      onShare,
      members,
      className,
    },
    ref
  ) => {
    const [view, setView] = React.useState<BoardView>('board');
    const [filter, setFilter] = React.useState<BoardFilter>({});
    const [searchValue, setSearchValue] = React.useState('');
    const [draggedTask, setDraggedTask] = React.useState<{
      task: KanbanTask;
      columnId: string;
    } | null>(null);

    const handleTaskDragStart = (task: KanbanTask, columnId: string) => {
      setDraggedTask({ task, columnId });
    };

    const handleTaskDragEnd = () => {
      setDraggedTask(null);
    };

    const handleTaskDrop = (taskId: string, targetColumnId: string, targetIndex: number) => {
      if (draggedTask && onTaskMove) {
        onTaskMove(taskId, draggedTask.columnId, targetColumnId, targetIndex);
      }
      setDraggedTask(null);
    };

    // Filter columns based on search and filters
    const filteredColumns = React.useMemo(() => {
      return columns.map((column) => ({
        ...column,
        tasks: column.tasks.filter((task) => {
          // Search filter
          if (searchValue && !task.title.toLowerCase().includes(searchValue.toLowerCase())) {
            return false;
          }

          // Priority filter
          if (
            filter.priorities &&
            filter.priorities.length > 0 &&
            (!task.priority || !filter.priorities.includes(task.priority))
          ) {
            return false;
          }

          return true;
        }),
      }));
    }, [columns, searchValue, filter]);

    return (
      <div ref={ref} className={cn('flex flex-col h-full', className)}>
        {/* Header */}
        <BoardHeader
          title={title}
          description={description}
          view={view}
          onViewChange={setView}
          filter={filter}
          onFilterChange={setFilter}
          onShare={onShare}
          onAddTask={() => onAddTask?.()}
          members={members}
          searchValue={searchValue}
          onSearchChange={setSearchValue}
        />

        {/* Board content */}
        {view === 'board' && (
          <div className="flex-1 overflow-x-auto overflow-y-hidden">
            <div className="flex gap-4 p-6 h-full min-w-min">
              {filteredColumns.map((column) => (
                <KanbanColumn
                  key={column.id}
                  column={column}
                  onTaskClick={onTaskClick}
                  onAddTask={onAddTask}
                  onTaskDragStart={handleTaskDragStart}
                  onTaskDragEnd={handleTaskDragEnd}
                  onTaskDrop={handleTaskDrop}
                  isDragOver={draggedTask !== null}
                  draggedTaskId={draggedTask?.task.id || null}
                />
              ))}
            </div>
          </div>
        )}

        {/* List view placeholder */}
        {view === 'list' && (
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
                List View
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                List view coming soon...
              </p>
            </div>
          </div>
        )}

        {/* Calendar view placeholder */}
        {view === 'calendar' && (
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
                Calendar View
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                Calendar view coming soon...
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }
);

KanbanBoard.displayName = 'KanbanBoard';

export type { KanbanTask, KanbanColumn as KanbanColumnType };
