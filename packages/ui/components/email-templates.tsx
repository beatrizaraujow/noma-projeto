/**
 * Email Notification Templates
 * 
 * These are React components that can be rendered to HTML for email notifications.
 * Use a library like @react-email/components or mjml for production email rendering.
 */

import * as React from 'react';

export interface EmailTemplateProps {
  recipientName: string;
  [key: string]: any;
}

// Base email layout wrapper
export const EmailLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div style={{
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      backgroundColor: '#f5f5f5',
      padding: '40px 20px',
    }}>
      <div style={{
        maxWidth: '600px',
        margin: '0 auto',
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      }}>
        {children}
      </div>
    </div>
  );
};

// Email Header
export const EmailHeader: React.FC<{ logoUrl?: string }> = ({ logoUrl }) => {
  return (
    <div style={{
      padding: '24px',
      backgroundColor: '#FF5722',
      textAlign: 'center',
    }}>
      {logoUrl ? (
        <img src={logoUrl} alt="Logo" style={{ height: '32px' }} />
      ) : (
        <h1 style={{ color: '#ffffff', margin: 0, fontSize: '24px', fontWeight: 'bold' }}>
          Nexora
        </h1>
      )}
    </div>
  );
};

// Email Footer
export const EmailFooter: React.FC<{ unsubscribeUrl?: string }> = ({ unsubscribeUrl }) => {
  return (
    <div style={{
      padding: '24px',
      backgroundColor: '#f9fafb',
      borderTop: '1px solid #e5e7eb',
      textAlign: 'center',
      fontSize: '12px',
      color: '#6b7280',
    }}>
      <p style={{ margin: '0 0 8px' }}>
        This email was sent by Nexora. If you have questions, please contact support.
      </p>
      {unsubscribeUrl && (
        <p style={{ margin: 0 }}>
          <a href={unsubscribeUrl} style={{ color: '#FF5722', textDecoration: 'none' }}>
            Unsubscribe from these emails
          </a>
        </p>
      )}
    </div>
  );
};

// Task Assigned Email
export interface TaskAssignedEmailProps extends EmailTemplateProps {
  taskTitle: string;
  taskUrl: string;
  assignedBy: string;
  projectName: string;
  dueDate?: string;
}

export const TaskAssignedEmail: React.FC<TaskAssignedEmailProps> = ({
  recipientName,
  taskTitle,
  taskUrl,
  assignedBy,
  projectName,
  dueDate,
}) => {
  return (
    <EmailLayout>
      <EmailHeader />
      <div style={{ padding: '32px 24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827', marginTop: 0 }}>
          You've been assigned a task
        </h2>
        <p style={{ fontSize: '16px', color: '#374151', lineHeight: '24px' }}>
          Hi {recipientName},
        </p>
        <p style={{ fontSize: '16px', color: '#374151', lineHeight: '24px' }}>
          <strong>{assignedBy}</strong> assigned you a new task in <strong>{projectName}</strong>:
        </p>
        <div style={{
          padding: '16px',
          backgroundColor: '#f9fafb',
          borderLeft: '4px solid #FF5722',
          borderRadius: '4px',
          margin: '24px 0',
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: '0 0 8px' }}>
            {taskTitle}
          </h3>
          {dueDate && (
            <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
              Due: {dueDate}
            </p>
          )}
        </div>
        <a
          href={taskUrl}
          style={{
            display: 'inline-block',
            padding: '12px 24px',
            backgroundColor: '#FF5722',
            color: '#ffffff',
            textDecoration: 'none',
            borderRadius: '6px',
            fontWeight: '600',
            fontSize: '16px',
          }}
        >
          View Task
        </a>
      </div>
      <EmailFooter />
    </EmailLayout>
  );
};

// Mention in Comment Email
export interface MentionEmailProps extends EmailTemplateProps {
  mentionedBy: string;
  commentText: string;
  taskTitle: string;
  taskUrl: string;
  projectName: string;
}

export const MentionEmail: React.FC<MentionEmailProps> = ({
  recipientName,
  mentionedBy,
  commentText,
  taskTitle,
  taskUrl,
  projectName,
}) => {
  return (
    <EmailLayout>
      <EmailHeader />
      <div style={{ padding: '32px 24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827', marginTop: 0 }}>
          You were mentioned in a comment
        </h2>
        <p style={{ fontSize: '16px', color: '#374151', lineHeight: '24px' }}>
          Hi {recipientName},
        </p>
        <p style={{ fontSize: '16px', color: '#374151', lineHeight: '24px' }}>
          <strong>{mentionedBy}</strong> mentioned you in <strong>{taskTitle}</strong>:
        </p>
        <div style={{
          padding: '16px',
          backgroundColor: '#f9fafb',
          borderLeft: '4px solid #3b82f6',
          borderRadius: '4px',
          margin: '24px 0',
        }}>
          <p style={{ fontSize: '14px', color: '#374151', margin: 0, fontStyle: 'italic' }}>
            "{commentText}"
          </p>
        </div>
        <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '24px' }}>
          in {projectName}
        </p>
        <a
          href={taskUrl}
          style={{
            display: 'inline-block',
            padding: '12px 24px',
            backgroundColor: '#FF5722',
            color: '#ffffff',
            textDecoration: 'none',
            borderRadius: '6px',
            fontWeight: '600',
            fontSize: '16px',
          }}
        >
          View Comment
        </a>
      </div>
      <EmailFooter />
    </EmailLayout>
  );
};

// Due Date Reminder Email
export interface DueDateReminderEmailProps extends EmailTemplateProps {
  taskTitle: string;
  taskUrl: string;
  dueDate: string;
  projectName: string;
  isOverdue?: boolean;
}

export const DueDateReminderEmail: React.FC<DueDateReminderEmailProps> = ({
  recipientName,
  taskTitle,
  taskUrl,
  dueDate,
  projectName,
  isOverdue = false,
}) => {
  return (
    <EmailLayout>
      <EmailHeader />
      <div style={{ padding: '32px 24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: isOverdue ? '#ef4444' : '#111827', marginTop: 0 }}>
          {isOverdue ? 'Task Overdue' : 'Task Due Soon'}
        </h2>
        <p style={{ fontSize: '16px', color: '#374151', lineHeight: '24px' }}>
          Hi {recipientName},
        </p>
        <p style={{ fontSize: '16px', color: '#374151', lineHeight: '24px' }}>
          {isOverdue
            ? 'This task is now overdue:'
            : 'This task is due soon:'}
        </p>
        <div style={{
          padding: '16px',
          backgroundColor: '#f9fafb',
          borderLeft: `4px solid ${isOverdue ? '#ef4444' : '#f59e0b'}`,
          borderRadius: '4px',
          margin: '24px 0',
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: '0 0 8px' }}>
            {taskTitle}
          </h3>
          <p style={{ fontSize: '14px', color: isOverdue ? '#ef4444' : '#f59e0b', margin: '0 0 4px', fontWeight: '600' }}>
            Due: {dueDate}
          </p>
          <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
            {projectName}
          </p>
        </div>
        <a
          href={taskUrl}
          style={{
            display: 'inline-block',
            padding: '12px 24px',
            backgroundColor: isOverdue ? '#ef4444' : '#FF5722',
            color: '#ffffff',
            textDecoration: 'none',
            borderRadius: '6px',
            fontWeight: '600',
            fontSize: '16px',
          }}
        >
          View Task
        </a>
      </div>
      <EmailFooter />
    </EmailLayout>
  );
};

// Daily Digest Email
export interface DailyDigestEmailProps extends EmailTemplateProps {
  date: string;
  stats: {
    tasksCompleted: number;
    newTasks: number;
    commentsMade: number;
    mentionsReceived: number;
  };
  upcomingTasks: Array<{
    title: string;
    dueDate: string;
    priority: string;
    url: string;
  }>;
  recentActivity: Array<{
    description: string;
    timestamp: string;
  }>;
}

export const DailyDigestEmail: React.FC<DailyDigestEmailProps> = ({
  recipientName,
  date,
  stats,
  upcomingTasks,
  recentActivity,
}) => {
  return (
    <EmailLayout>
      <EmailHeader />
      <div style={{ padding: '32px 24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827', marginTop: 0 }}>
          Your Daily Digest - {date}
        </h2>
        <p style={{ fontSize: '16px', color: '#374151', lineHeight: '24px' }}>
          Hi {recipientName},
        </p>
        <p style={{ fontSize: '16px', color: '#374151', lineHeight: '24px' }}>
          Here's your activity summary for today:
        </p>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', margin: '24px 0' }}>
          <div style={{ padding: '16px', backgroundColor: '#f0fdf4', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#16a34a' }}>{stats.tasksCompleted}</div>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>Tasks Completed</div>
          </div>
          <div style={{ padding: '16px', backgroundColor: '#fef3c7', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#f59e0b' }}>{stats.newTasks}</div>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>New Tasks</div>
          </div>
          <div style={{ padding: '16px', backgroundColor: '#ddd6fe', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#7c3aed' }}>{stats.commentsMade}</div>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>Comments Made</div>
          </div>
          <div style={{ padding: '16px', backgroundColor: '#dbeafe', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#2563eb' }}>{stats.mentionsReceived}</div>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>Mentions</div>
          </div>
        </div>

        {/* Upcoming Tasks */}
        {upcomingTasks.length > 0 && (
          <>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginTop: '32px', marginBottom: '16px' }}>
              Upcoming Tasks
            </h3>
            <div style={{ borderRadius: '8px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
              {upcomingTasks.map((task, index) => (
                <div
                  key={index}
                  style={{
                    padding: '12px 16px',
                    borderBottom: index < upcomingTasks.length - 1 ? '1px solid #e5e7eb' : 'none',
                  }}
                >
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#111827', marginBottom: '4px' }}>
                    {task.title}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>
                    Due: {task.dueDate} • Priority: {task.priority}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      <EmailFooter />
    </EmailLayout>
  );
};

// Export all templates
export const emailTemplates = {
  TaskAssignedEmail,
  MentionEmail,
  DueDateReminderEmail,
  DailyDigestEmail,
};
