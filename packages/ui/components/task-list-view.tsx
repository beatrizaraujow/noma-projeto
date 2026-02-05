import * as React from 'react';
import {
  ChevronUp,
  ChevronDown,
  Flag,
  Calendar,
  User,
  Tag,
  MessageSquare,
  Paperclip,
  MoreVertical,
  AlertCircle,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Avatar } from './avatar';
import { Badge } from './badge';
import { Checkbox } from './checkbox';
import { Dropdown, DropdownItem, DropdownSeparator } from './dropdown';

export interface TaskListItem {
  id: string;
  title: string;
  status: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  assignee?: {
    name: string;
    avatar?: string;
  };
  dueDate?: Date;
  labels?: Array<{
    id: string;
    name: string;
    color: string;
  }>;
  commentsCount?: number;
  attachmentsCount?: number;
}

export type SortField = 'title' | 'status' | 'priority' | 'assignee' | 'dueDate';
export type SortDirection = 'asc' | 'desc';

export interface TaskListViewProps {
  tasks: TaskListItem[];
  selectedTasks?: string[];
  sortField?: SortField;
  sortDirection?: SortDirection;
  onTaskClick?: (task: TaskListItem) => void;
  onTaskSelect?: (taskId: string, selected: boolean) => void;
  onSelectAll?: (selected: boolean) => void;
  onSort?: (field: SortField) => void;
  onEdit?: (taskId: string, field: string, value: any) => void;
  onDelete?: (taskId: string) => void;
  className?: string;
}

const priorityConfig = {
  urgent: { color: 'text-red-600 dark:text-red-400', label: 'Urgent' },
  high: { color: 'text-orange-600 dark:text-orange-400', label: 'High' },
  medium: { color: 'text-yellow-600 dark:text-yellow-400', label: 'Medium' },
  low: { color: 'text-blue-600 dark:text-blue-400', label: 'Low' },
};

export const TaskListView = React.forwardRef<HTMLDivElement, TaskListViewProps>(
  (
    {
      tasks,
      selectedTasks = [],
      sortField,
      sortDirection,
      onTaskClick,
      onTaskSelect,
      onSelectAll,
      onSort,
      onEdit,
      onDelete,
      className,
    },
    ref
  ) => {
    const [editingCell, setEditingCell] = React.useState<{
      taskId: string;
      field: string;
    } | null>(null);
    const [editValue, setEditValue] = React.useState('');

    const allSelected = tasks.length > 0 && selectedTasks.length === tasks.length;
    const someSelected = selectedTasks.length > 0 && !allSelected;

    const handleCellDoubleClick = (taskId: string, field: string, currentValue: string) => {
      if (field === 'title') {
        setEditingCell({ taskId, field });
        setEditValue(currentValue);
      }
    };

    const handleCellBlur = () => {
      if (editingCell && onEdit) {
        const task = tasks.find((t) => t.id === editingCell.taskId);
        if (task && editValue !== (task as any)[editingCell.field]) {
          onEdit(editingCell.taskId, editingCell.field, editValue);
        }
      }
      setEditingCell(null);
    };

    const handleCellKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleCellBlur();
      } else if (e.key === 'Escape') {
        setEditingCell(null);
      }
    };

    const renderSortIcon = (field: SortField) => {
      if (sortField !== field) {
        return (
          <ChevronUp className="h-3 w-3 text-neutral-400 opacity-0 group-hover:opacity-100" />
        );
      }
      return sortDirection === 'asc' ? (
        <ChevronUp className="h-3 w-3 text-orange-600 dark:text-orange-400" />
      ) : (
        <ChevronDown className="h-3 w-3 text-orange-600 dark:text-orange-400" />
      );
    };

    const formatDueDate = (date: Date) => {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const dateStr = date.toDateString();
      if (dateStr === today.toDateString()) return 'Today';
      if (dateStr === tomorrow.toDateString()) return 'Tomorrow';

      const isOverdue = date < today;
      const formatted = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      return { formatted, isOverdue };
    };

    return (
      <div ref={ref} className={cn('flex flex-col h-full', className)}>
        {/* Header with bulk actions */}
        {selectedTasks.length > 0 && (
          <div className="flex items-center gap-3 px-4 py-3 bg-orange-50 dark:bg-orange-950/20 border-b border-orange-200 dark:border-orange-800">
            <span className="text-sm font-medium text-orange-900 dark:text-orange-100">
              {selectedTasks.length} selected
            </span>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1.5 text-sm font-medium rounded-md bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors">
                Change Status
              </button>
              <button className="px-3 py-1.5 text-sm font-medium rounded-md bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors">
                Assign
              </button>
              <button className="px-3 py-1.5 text-sm font-medium text-red-600 dark:text-red-400 rounded-md bg-white dark:bg-neutral-800 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors">
                Delete
              </button>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="flex-1 overflow-auto">
          <table className="w-full">
            <thead className="sticky top-0 z-10 bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-700">
              <tr>
                {/* Checkbox column */}
                <th className="w-12 px-4 py-3 text-left">
                  <Checkbox
                    checked={allSelected}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => onSelectAll?.(e.target.checked)}
                  />
                </th>

                {/* Title column */}
                <th className="px-4 py-3 text-left">
                  <button
                    onClick={() => onSort?.('title')}
                    className="group flex items-center gap-2 text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                  >
                    Task
                    {renderSortIcon('title')}
                  </button>
                </th>

                {/* Status column */}
                <th className="px-4 py-3 text-left">
                  <button
                    onClick={() => onSort?.('status')}
                    className="group flex items-center gap-2 text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                  >
                    Status
                    {renderSortIcon('status')}
                  </button>
                </th>

                {/* Priority column */}
                <th className="px-4 py-3 text-left">
                  <button
                    onClick={() => onSort?.('priority')}
                    className="group flex items-center gap-2 text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                  >
                    Priority
                    {renderSortIcon('priority')}
                  </button>
                </th>

                {/* Assignee column */}
                <th className="px-4 py-3 text-left">
                  <button
                    onClick={() => onSort?.('assignee')}
                    className="group flex items-center gap-2 text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                  >
                    Assignee
                    {renderSortIcon('assignee')}
                  </button>
                </th>

                {/* Due Date column */}
                <th className="px-4 py-3 text-left">
                  <button
                    onClick={() => onSort?.('dueDate')}
                    className="group flex items-center gap-2 text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                  >
                    Due Date
                    {renderSortIcon('dueDate')}
                  </button>
                </th>

                {/* Meta column */}
                <th className="px-4 py-3 text-left">
                  <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">
                    
                  </span>
                </th>

                {/* Actions column */}
                <th className="w-12 px-4 py-3"></th>
              </tr>
            </thead>

            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {tasks.map((task) => {
                const isSelected = selectedTasks.includes(task.id);
                const dueDateInfo = task.dueDate ? formatDueDate(task.dueDate) : null;

                return (
                  <tr
                    key={task.id}
                    className={cn(
                      'group hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors',
                      isSelected && 'bg-orange-50/50 dark:bg-orange-950/10'
                    )}
                  >
                    {/* Checkbox */}
                    <td className="px-4 py-3">
                      <Checkbox
                        checked={isSelected}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onTaskSelect?.(task.id, e.target.checked)}
                      />
                    </td>

                    {/* Title */}
                    <td
                      className="px-4 py-3 max-w-md"
                      onDoubleClick={() => handleCellDoubleClick(task.id, 'title', task.title)}
                    >
                      {editingCell?.taskId === task.id && editingCell.field === 'title' ? (
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={handleCellBlur}
                          onKeyDown={handleCellKeyDown}
                          autoFocus
                          className="w-full px-2 py-1 text-sm bg-white dark:bg-neutral-900 border border-orange-500 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      ) : (
                        <button
                          onClick={() => onTaskClick?.(task)}
                          className="w-full text-left text-sm font-medium text-neutral-900 dark:text-white hover:text-orange-600 dark:hover:text-orange-400 transition-colors truncate"
                        >
                          {task.title}
                        </button>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <Badge variant="secondary" className="capitalize">
                        {task.status}
                      </Badge>
                    </td>

                    {/* Priority */}
                    <td className="px-4 py-3">
                      {task.priority && (
                        <div className="flex items-center gap-2">
                          <Flag
                            className={cn(
                              'h-4 w-4',
                              priorityConfig[task.priority]?.color || 'text-neutral-400'
                            )}
                          />
                          <span className="text-sm text-neutral-700 dark:text-neutral-300">
                            {priorityConfig[task.priority]?.label}
                          </span>
                        </div>
                      )}
                    </td>

                    {/* Assignee */}
                    <td className="px-4 py-3">
                      {task.assignee && (
                        <div className="flex items-center gap-2">
                          <Avatar
                            src={task.assignee.avatar}
                            fallback={task.assignee.name}
                            size="xs"
                          />
                          <span className="text-sm text-neutral-700 dark:text-neutral-300">
                            {task.assignee.name}
                          </span>
                        </div>
                      )}
                    </td>

                    {/* Due Date */}
                    <td className="px-4 py-3">
                      {dueDateInfo && (
                        <div className="flex items-center gap-2">
                          <Calendar
                            className={cn(
                              'h-4 w-4',
                              typeof dueDateInfo === 'object' && dueDateInfo.isOverdue
                                ? 'text-red-600 dark:text-red-400'
                                : 'text-neutral-400'
                            )}
                          />
                          <span
                            className={cn(
                              'text-sm',
                              typeof dueDateInfo === 'object' && dueDateInfo.isOverdue
                                ? 'text-red-600 dark:text-red-400 font-medium'
                                : 'text-neutral-700 dark:text-neutral-300'
                            )}
                          >
                            {typeof dueDateInfo === 'string'
                              ? dueDateInfo
                              : dueDateInfo.formatted}
                          </span>
                        </div>
                      )}
                    </td>

                    {/* Meta (comments, attachments, labels) */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {task.labels && task.labels.length > 0 && (
                          <div className="flex items-center gap-1">
                            {task.labels.slice(0, 2).map((label) => (
                              <div
                                key={label.id}
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: label.color }}
                                title={label.name}
                              />
                            ))}
                            {task.labels.length > 2 && (
                              <span className="text-xs text-neutral-500">
                                +{task.labels.length - 2}
                              </span>
                            )}
                          </div>
                        )}
                        {task.commentsCount && task.commentsCount > 0 ? (
                          <div className="flex items-center gap-1 text-neutral-500">
                            <MessageSquare className="h-3.5 w-3.5" />
                            <span className="text-xs">{task.commentsCount}</span>
                          </div>
                        ) : null}
                        {task.attachmentsCount && task.attachmentsCount > 0 ? (
                          <div className="flex items-center gap-1 text-neutral-500">
                            <Paperclip className="h-3.5 w-3.5" />
                            <span className="text-xs">{task.attachmentsCount}</span>
                          </div>
                        ) : null}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <Dropdown
                        trigger={
                          <button className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-all">
                            <MoreVertical className="h-4 w-4 text-neutral-500" />
                          </button>
                        }
                        align="end"
                      >
                        <DropdownItem
                          leftIcon={<User className="h-4 w-4" />}
                          onClick={() => console.log('Assign task:', task.id)}
                        >
                          Assign
                        </DropdownItem>
                        <DropdownItem
                          leftIcon={<Tag className="h-4 w-4" />}
                          onClick={() => console.log('Add labels:', task.id)}
                        >
                          Labels
                        </DropdownItem>
                        <DropdownSeparator />
                        <DropdownItem
                          className="text-red-600 dark:text-red-400"
                          onClick={() => onDelete?.(task.id)}
                        >
                          Delete
                        </DropdownItem>
                      </Dropdown>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Empty state */}
        {tasks.length === 0 && (
          <div className="flex-1 flex items-center justify-center py-12">
            <div className="text-center">
              <div className="h-12 w-12 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="h-6 w-6 text-neutral-400" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
                No tasks found
              </h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Try adjusting your filters or create a new task
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }
);

TaskListView.displayName = 'TaskListView';
