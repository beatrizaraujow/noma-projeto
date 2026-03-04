'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';

interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  dueDate?: string;
  position: number;
  assignee?: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  _count?: {
    comments: number;
  };
}

interface TaskTimelineViewProps {
  tasks: Task[];
}

export function TaskTimelineView({ tasks }: TaskTimelineViewProps) {
  const router = useRouter();
  const sortedTasks = useMemo(() => {
    return [...tasks]
      .filter((task) => task.dueDate)
      .sort((a, b) => {
        const dateA = new Date(a.dueDate!).getTime();
        const dateB = new Date(b.dueDate!).getTime();
        return dateA - dateB;
      });
  }, [tasks]);

  const groupTasksByMonth = (tasks: Task[]) => {
    const groups: Record<string, Task[]> = {};
    
    tasks.forEach((task) => {
      if (!task.dueDate) return;
      
      const date = new Date(task.dueDate);
      const monthKey = date.toLocaleDateString('pt-BR', {
        year: 'numeric',
        month: 'long',
      });
      
      if (!groups[monthKey]) {
        groups[monthKey] = [];
      }
      groups[monthKey].push(task);
    });
    
    return groups;
  };

  const groupedTasks = groupTasksByMonth(sortedTasks);

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      LOW: 'border-gray-400',
      MEDIUM: 'border-blue-500',
      HIGH: 'border-orange-500',
      URGENT: 'border-red-500',
    };
    return colors[priority] || colors.MEDIUM;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      TODO: 'bg-gray-100 dark:bg-gray-700',
      IN_PROGRESS: 'bg-blue-100 dark:bg-blue-900',
      REVIEW: 'bg-yellow-100 dark:bg-yellow-900',
      DONE: 'bg-green-100 dark:bg-green-900',
    };
    return colors[status] || colors.TODO;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
    });
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date() && new Date(dueDate).toDateString() !== new Date().toDateString();
  };

  const isToday = (dueDate: string) => {
    return new Date(dueDate).toDateString() === new Date().toDateString();
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="space-y-8">
        {Object.entries(groupedTasks).map(([month, monthTasks]) => (
          <div key={month}>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 capitalize">
              {month}
            </h3>
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-300 dark:bg-gray-600" />

              <div className="space-y-4">
                {monthTasks.map((task, index) => {
                  const overdue = isOverdue(task.dueDate!);
                  const today = isToday(task.dueDate!);

                  return (
                    <div key={task.id} className="relative flex items-start gap-6">
                      {/* Timeline dot */}
                      <div className="relative z-10 flex flex-col items-center">
                        <div
                          className={`w-4 h-4 rounded-full border-4 ${
                            today
                              ? 'border-blue-500 bg-blue-500 ring-4 ring-blue-200 dark:ring-blue-900'
                              : overdue
                              ? 'border-red-500 bg-red-500'
                              : 'border-gray-400 bg-white dark:bg-gray-800'
                          }`}
                        />
                        <div
                          className={`text-xs font-medium mt-2 ${
                            today
                              ? 'text-blue-600 dark:text-blue-400'
                              : overdue
                              ? 'text-red-600 dark:text-red-400'
                              : 'text-gray-500 dark:text-gray-400'
                          }`}
                        >
                          {formatDate(task.dueDate!)}
                        </div>
                      </div>

                      {/* Task card */}
                      <div
                        onClick={() => router.push(`/tasks/${task.id}`)}
                        className={`flex-1 border-l-4 ${getPriorityColor(
                          task.priority
                        )} ${getStatusColor(
                          task.status
                        )} rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                              {task.title}
                            </h4>
                            {task.description && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                                {task.description}
                              </p>
                            )}
                            <div className="flex items-center gap-3 flex-wrap">
                              <span className="text-xs px-2 py-1 rounded-full bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                                {task.priority}
                              </span>
                              <span className="text-xs px-2 py-1 rounded-full bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                                {task.status}
                              </span>
                              {task.assignee && (
                                <div className="flex items-center gap-1">
                                  <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                                    {task.assignee.name[0].toUpperCase()}
                                  </div>
                                  <span className="text-xs text-gray-600 dark:text-gray-400">
                                    {task.assignee.name}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                          {overdue && (
                            <span className="text-xs font-medium text-red-600 dark:text-red-400 whitespace-nowrap">
                              Atrasada
                            </span>
                          )}
                          {today && (
                            <span className="text-xs font-medium text-blue-600 dark:text-blue-400 whitespace-nowrap">
                              Hoje
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}

        {sortedTasks.length === 0 && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <svg
              className="w-16 h-16 mx-auto mb-4 opacity-50"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p>Nenhuma tarefa com data de entrega definida</p>
          </div>
        )}
      </div>
    </div>
  );
}
