import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

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

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
})
export class WebsocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('WebsocketGateway');
  private userPresence: Map<string, UserPresence> = new Map();
  private userNotifications: Map<string, Notification[]> = new Map();

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    const userId = client.handshake.query.userId as string;
    if (userId) {
      client.data.userId = userId;
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    // Remove user presence
    this.userPresence.delete(client.id);
    // Broadcast presence update
    if (client.data.projectId) {
      this.broadcastPresence(client.data.projectId);
    }
  }

  @SubscribeMessage('join_project')
  handleJoinProject(
    @MessageBody() data: { projectId: string; userId: string; userName: string },
    @ConnectedSocket() client: Socket
  ) {
    client.join(`project_${data.projectId}`);
    client.data.projectId = data.projectId;
    client.data.userId = data.userId;
    client.data.userName = data.userName;

    // Add user presence
    this.userPresence.set(client.id, {
      userId: data.userId,
      userName: data.userName,
      projectId: data.projectId,
      action: 'viewing',
      timestamp: Date.now(),
    });

    this.logger.log(`Client ${client.id} joined project ${data.projectId}`);
    
    // Broadcast presence update
    this.broadcastPresence(data.projectId);
    
    return { event: 'joined_project', data: { projectId: data.projectId } };
  }

  @SubscribeMessage('leave_project')
  handleLeaveProject(
    @MessageBody() data: { projectId: string },
    @ConnectedSocket() client: Socket
  ) {
    client.leave(`project_${data.projectId}`);
    this.userPresence.delete(client.id);
    this.logger.log(`Client ${client.id} left project ${data.projectId}`);
    
    // Broadcast presence update
    this.broadcastPresence(data.projectId);
    
    return { event: 'left_project', data: { projectId: data.projectId } };
  }

  @SubscribeMessage('start_editing_task')
  handleStartEditingTask(
    @MessageBody() data: { taskId: string; projectId: string; userId: string; userName: string },
    @ConnectedSocket() client: Socket
  ) {
    const presence = this.userPresence.get(client.id);
    if (presence) {
      presence.taskId = data.taskId;
      presence.action = 'editing';
      presence.timestamp = Date.now();
      this.userPresence.set(client.id, presence);
    } else {
      this.userPresence.set(client.id, {
        userId: data.userId,
        userName: data.userName,
        taskId: data.taskId,
        projectId: data.projectId,
        action: 'editing',
        timestamp: Date.now(),
      });
    }

    // Broadcast to project
    this.server.to(`project_${data.projectId}`).emit('user_editing_task', {
      taskId: data.taskId,
      userId: data.userId,
      userName: data.userName,
    });

    this.broadcastPresence(data.projectId);
  }

  @SubscribeMessage('stop_editing_task')
  handleStopEditingTask(
    @MessageBody() data: { taskId: string; projectId: string; userId: string },
    @ConnectedSocket() client: Socket
  ) {
    const presence = this.userPresence.get(client.id);
    if (presence) {
      presence.taskId = undefined;
      presence.action = 'viewing';
      presence.timestamp = Date.now();
      this.userPresence.set(client.id, presence);
    }

    // Broadcast to project
    this.server.to(`project_${data.projectId}`).emit('user_stopped_editing_task', {
      taskId: data.taskId,
      userId: data.userId,
    });

    this.broadcastPresence(data.projectId);
  }

  @SubscribeMessage('task_update')
  handleTaskUpdate(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
    const { projectId, task } = data;
    this.server.to(`project_${projectId}`).emit('task_updated', task);
    return { event: 'task_update_sent', data: { success: true } };
  }

  @SubscribeMessage('typing')
  handleTyping(@MessageBody() data: { projectId: string; user: string }) {
    this.server.to(`project_${data.projectId}`).emit('user_typing', data);
  }

  @SubscribeMessage('get_notifications')
  handleGetNotifications(
    @MessageBody() data: { userId: string },
    @ConnectedSocket() client: Socket
  ) {
    const notifications = this.userNotifications.get(data.userId) || [];
    return { event: 'notifications', data: notifications };
  }

  @SubscribeMessage('mark_notification_read')
  handleMarkNotificationRead(
    @MessageBody() data: { userId: string; notificationId: string },
    @ConnectedSocket() client: Socket
  ) {
    const notifications = this.userNotifications.get(data.userId) || [];
    const notification = notifications.find(n => n.id === data.notificationId);
    if (notification) {
      notification.read = true;
      this.userNotifications.set(data.userId, notifications);
    }
    return { event: 'notification_marked_read', data: { success: true } };
  }

  @SubscribeMessage('get_presence')
  handleGetPresence(
    @MessageBody() data: { projectId: string },
    @ConnectedSocket() client: Socket
  ) {
    const presence = this.getProjectPresence(data.projectId);
    return { event: 'presence', data: presence };
  }

  // Broadcast task created
  broadcastTaskCreated(projectId: string, task: any) {
    this.server.to(`project_${projectId}`).emit('task_created', task);
  }

  // Broadcast task updated
  broadcastTaskUpdated(projectId: string, task: any) {
    this.server.to(`project_${projectId}`).emit('task_updated', task);
  }

  // Broadcast task deleted
  broadcastTaskDeleted(projectId: string, taskId: string) {
    this.server.to(`project_${projectId}`).emit('task_deleted', { taskId });
  }

  // Broadcast presence
  private broadcastPresence(projectId: string) {
    const presence = this.getProjectPresence(projectId);
    this.server.to(`project_${projectId}`).emit('presence_update', presence);
  }

  // Get presence for a project
  private getProjectPresence(projectId: string): UserPresence[] {
    const presence: UserPresence[] = [];
    this.userPresence.forEach((value) => {
      if (value.projectId === projectId) {
        presence.push(value);
      }
    });
    return presence;
  }

  // Send notification to user
  sendNotification(userId: string, notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) {
    const fullNotification: Notification = {
      ...notification,
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      read: false,
    };

    const userNotifs = this.userNotifications.get(userId) || [];
    userNotifs.push(fullNotification);
    this.userNotifications.set(userId, userNotifs);

    // Broadcast to user's connected clients
    this.server.emit(`notification_${userId}`, fullNotification);
  }

  // Broadcast task status change
  broadcastTaskStatusChange(projectId: string, taskId: string, newStatus: string, updatedBy: string) {
    this.server.to(`project_${projectId}`).emit('task_status_changed', {
      taskId,
      newStatus,
      updatedBy,
      timestamp: Date.now(),
    });
  }

  // Broadcast task assignment
  broadcastTaskAssignment(projectId: string, taskId: string, assigneeId: string, assignedBy: string) {
    this.server.to(`project_${projectId}`).emit('task_assigned', {
      taskId,
      assigneeId,
      assignedBy,
      timestamp: Date.now(),
    });
  }

  // Broadcast comment added
  broadcastCommentAdded(projectId: string, comment: any) {
    this.server.to(`project_${projectId}`).emit('comment_added', comment);
  }

  // Broadcast comment updated
  broadcastCommentUpdated(projectId: string, comment: any) {
    this.server.to(`project_${projectId}`).emit('comment_updated', comment);
  }

  // Broadcast comment deleted
  broadcastCommentDeleted(projectId: string, commentId: string) {
    this.server.to(`project_${projectId}`).emit('comment_deleted', { commentId });
  }
}
