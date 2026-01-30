import { useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface UserPresence {
  userId: string;
  userName: string;
  taskId?: string;
  projectId: string;
  action: 'viewing' | 'editing';
  timestamp: number;
}

interface Notification {
  id: string;
  type: 'task_assigned' | 'task_updated' | 'comment_added' | 'mention';
  title: string;
  message: string;
  projectId: string;
  taskId?: string;
  userId: string;
  timestamp: number;
  read: boolean;
}

interface UseWebSocketOptions {
  projectId?: string;
  onTaskCreated?: (task: any) => void;
  onTaskUpdated?: (task: any) => void;
  onTaskDeleted?: (data: { taskId: string }) => void;
  onTaskStatusChanged?: (data: { taskId: string; newStatus: string; updatedBy: string; timestamp: number }) => void;
  onTaskAssigned?: (data: { taskId: string; assigneeId: string; assignedBy: string; timestamp: number }) => void;
  onCommentAdded?: (comment: any) => void;
  onCommentUpdated?: (comment: any) => void;
  onCommentDeleted?: (data: { commentId: string }) => void;
  onPresenceUpdate?: (presence: UserPresence[]) => void;
  onNotification?: (notification: Notification) => void;
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const { data: session } = useSession();
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [presence, setPresence] = useState<UserPresence[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!session?.user) return;

    // Initialize socket connection
    const socket = io(SOCKET_URL, {
      transports: ['websocket'],
      query: {
        userId: (session.user as any).id,
      },
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('WebSocket connected');
      setIsConnected(true);

      // Join project room if projectId is provided
      if (options.projectId) {
        socket.emit('join_project', {
          projectId: options.projectId,
          userId: (session.user as any).id,
          userName: session.user.name,
        });
      }
    });

    socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
    });

    // Task events
    socket.on('task_created', (task: any) => {
      console.log('Task created:', task);
      options.onTaskCreated?.(task);
    });

    socket.on('task_updated', (task: any) => {
      console.log('Task updated:', task);
      options.onTaskUpdated?.(task);
    });

    socket.on('task_deleted', (data: { taskId: string }) => {
      console.log('Task deleted:', data);
      options.onTaskDeleted?.(data);
    });

    socket.on('task_status_changed', (data: any) => {
      console.log('Task status changed:', data);
      options.onTaskStatusChanged?.(data);
    });

    socket.on('task_assigned', (data: any) => {
      console.log('Task assigned:', data);
      options.onTaskAssigned?.(data);
    });

    // Comment events
    socket.on('comment_added', (comment: any) => {
      console.log('Comment added:', comment);
      options.onCommentAdded?.(comment);
    });

    socket.on('comment_updated', (comment: any) => {
      console.log('Comment updated:', comment);
      options.onCommentUpdated?.(comment);
    });

    socket.on('comment_deleted', (data: { commentId: string }) => {
      console.log('Comment deleted:', data);
      options.onCommentDeleted?.(data);
    });

    // Presence events
    socket.on('presence_update', (presenceData: UserPresence[]) => {
      console.log('Presence update:', presenceData);
      setPresence(presenceData);
      options.onPresenceUpdate?.(presenceData);
    });

    socket.on('user_editing_task', (data: { taskId: string; userId: string; userName: string }) => {
      console.log('User editing task:', data);
    });

    socket.on('user_stopped_editing_task', (data: { taskId: string; userId: string }) => {
      console.log('User stopped editing task:', data);
    });

    // Notification events
    socket.on(`notification_${(session.user as any).id}`, (notification: Notification) => {
      console.log('New notification:', notification);
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
      options.onNotification?.(notification);
    });

    return () => {
      if (options.projectId) {
        socket.emit('leave_project', { projectId: options.projectId });
      }
      socket.disconnect();
    };
  }, [session, options.projectId]);

  const startEditingTask = (taskId: string) => {
    if (!socketRef.current || !options.projectId || !session?.user) return;
    
    socketRef.current.emit('start_editing_task', {
      taskId,
      projectId: options.projectId,
      userId: (session.user as any).id,
      userName: session.user.name,
    });
  };

  const stopEditingTask = (taskId: string) => {
    if (!socketRef.current || !options.projectId || !session?.user) return;
    
    socketRef.current.emit('stop_editing_task', {
      taskId,
      projectId: options.projectId,
      userId: (session.user as any).id,
    });
  };

  const getNotifications = () => {
    if (!socketRef.current || !session?.user) return;
    
    socketRef.current.emit('get_notifications', {
      userId: (session.user as any).id,
    });
  };

  const markNotificationRead = (notificationId: string) => {
    if (!socketRef.current || !session?.user) return;
    
    socketRef.current.emit('mark_notification_read', {
      userId: (session.user as any).id,
      notificationId,
    });
    
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const getUsersEditingTask = (taskId: string): UserPresence[] => {
    return presence.filter(
      (p) => p.taskId === taskId && p.action === 'editing' && p.userId !== (session?.user as any)?.id
    );
  };

  return {
    isConnected,
    presence,
    notifications,
    unreadCount,
    startEditingTask,
    stopEditingTask,
    getNotifications,
    markNotificationRead,
    getUsersEditingTask,
  };
}
