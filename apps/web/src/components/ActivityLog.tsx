'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface Activity {
  id: string;
  type: string;
  description: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
  task?: {
    id: string;
    title: string;
  };
  metadata?: any;
}

interface ActivityLogProps {
  projectId?: string;
  taskId?: string;
}

export function ActivityLog({ projectId, taskId }: ActivityLogProps) {
  const { data: session } = useSession();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActivities();
  }, [projectId, taskId]);

  const loadActivities = async () => {
    try {
      let url = '';
      if (taskId) {
        url = `${API_URL}/api/activities/task/${taskId}`;
      } else if (projectId) {
        url = `${API_URL}/api/activities/project/${projectId}`;
      } else {
        return;
      }

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${(session as any)?.accessToken}`,
        },
      });
      setActivities(response.data);
    } catch (error) {
      console.error('Error loading activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    const icons: Record<string, string> = {
      task_created: '➕',
      task_updated: '✏️',
      task_deleted: '🗑️',
      task_assigned: '👤',
      status_changed: '🔄',
      comment_added: '💬',
      attachment_added: '📎',
      priority_changed: '⚡',
      due_date_changed: '📅',
    };
    return icons[type] || '📌';
  };

  const getActivityColor = (type: string) => {
    const colors: Record<string, string> = {
      task_created: 'text-green-600 dark:text-green-400',
      task_deleted: 'text-red-600 dark:text-red-400',
      task_assigned: 'text-blue-600 dark:text-blue-400',
      status_changed: 'text-purple-600 dark:text-purple-400',
      comment_added: 'text-indigo-600 dark:text-indigo-400',
    };
    return colors[type] || 'text-gray-600 dark:text-gray-400';
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'agora';
    if (minutes < 60) return `${minutes}m atrás`;
    if (hours < 24) return `${hours}h atrás`;
    if (days < 7) return `${days}d atrás`;
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const groupByDate = (activities: Activity[]) => {
    const groups: Record<string, Activity[]> = {};
    
    activities.forEach((activity) => {
      const date = new Date(activity.createdAt).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      });
      
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(activity);
    });
    
    return groups;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-gray-500 dark:text-gray-400">Carregando...</div>
      </div>
    );
  }

  const groupedActivities = groupByDate(activities);

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        Atividades Recentes
      </h3>

      {Object.keys(groupedActivities).length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
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
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p>Nenhuma atividade registrada</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedActivities).map(([date, dateActivities]) => (
            <div key={date}>
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
                {date}
              </div>
              <div className="space-y-3">
                {dateActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <span className="text-2xl flex-shrink-0">
                      {getActivityIcon(activity.type)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {activity.user.name}
                          </span>
                          <span className={`ml-2 ${getActivityColor(activity.type)}`}>
                            {activity.description}
                          </span>
                          {activity.task && (
                            <span className="ml-2 text-gray-600 dark:text-gray-400">
                              "{activity.task.title}"
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-500 whitespace-nowrap">
                          {formatTime(activity.createdAt)}
                        </span>
                      </div>
                      {activity.metadata && (
                        <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                          {activity.metadata.content && (
                            <div className="italic">"{activity.metadata.content}"</div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
