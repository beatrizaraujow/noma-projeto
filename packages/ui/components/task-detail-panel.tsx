import * as React from 'react';
import { X } from 'lucide-react';
import { cn } from '../lib/utils';
import {
  TaskDetailHeader,
  TaskMetadataSidebar,
  TaskActivityTimeline,
  TaskMetadata,
  TaskActivity,
} from './task-detail';
import { TaskComments, Comment, User } from './task-comments';
import { TaskAttachments, Attachment } from './task-attachments';
import { RichTextEditor } from './rich-text-editor';

export interface Task {
  id: string;
  title: string;
  description: string;
  metadata: TaskMetadata;
  activities: TaskActivity[];
  comments: Comment[];
  attachments: Attachment[];
}

export interface TaskDetailPanelProps {
  task: Task;
  currentUser: User;
  users?: User[];
  typingUsers?: Array<{ id: string; name: string; avatar?: string }>;
  isOpen: boolean;
  onClose: () => void;
  onTitleChange: (title: string) => void;
  onDescriptionChange: (description: string) => void;
  onMetadataChange: (metadata: Partial<TaskMetadata>) => void;
  onAddComment: (content: string, mentions: string[]) => void;
  onEditComment?: (commentId: string, content: string) => void;
  onDeleteComment?: (commentId: string) => void;
  onCommentTypingStart?: () => void;
  onCommentTypingEnd?: () => void;
  onUploadAttachment: (files: FileList) => void;
  onDownloadAttachment?: (attachmentId: string) => void;
  onDeleteAttachment?: (attachmentId: string) => void;
  onCopy?: () => void;
  onArchive?: () => void;
  onDelete?: () => void;
  className?: string;
}

export const TaskDetailPanel = React.forwardRef<HTMLDivElement, TaskDetailPanelProps>(
  (
    {
      task,
      currentUser,
      users = [],
      typingUsers = [],
      isOpen,
      onClose,
      onTitleChange,
      onDescriptionChange,
      onMetadataChange,
      onAddComment,
      onEditComment,
      onDeleteComment,
      onCommentTypingStart,
      onCommentTypingEnd,
      onUploadAttachment,
      onDownloadAttachment,
      onDeleteAttachment,
      onCopy,
      onArchive,
      onDelete,
      className,
    },
    ref
  ) => {
    const [isTitleEditing, setIsTitleEditing] = React.useState(false);

    // Prevent body scroll when panel is open
    React.useEffect(() => {
      if (isOpen) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }

      return () => {
        document.body.style.overflow = '';
      };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
      <>
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/50 z-40 animate-in fade-in"
          onClick={onClose}
        />

        {/* Panel */}
        <div
          ref={ref}
          className={cn(
            'fixed inset-y-0 right-0 w-full md:w-3/4 lg:w-2/3 xl:w-1/2 max-w-4xl',
            'bg-white dark:bg-neutral-900',
            'shadow-2xl z-50',
            'flex flex-col',
            'animate-in slide-in-from-right duration-300',
            className
          )}
        >
          {/* Header */}
          <TaskDetailHeader
            title={task.title}
            isEditing={isTitleEditing}
            onTitleChange={onTitleChange}
            onEditToggle={() => setIsTitleEditing(!isTitleEditing)}
            onClose={onClose}
            onCopy={onCopy}
            onArchive={onArchive}
            onDelete={onDelete}
          />

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
              {/* Main content - 2 columns */}
              <div className="lg:col-span-2 space-y-6">
                {/* Description */}
                <div>
                  <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2 block">
                    Description
                  </label>
                  <RichTextEditor
                    value={task.description}
                    onChange={onDescriptionChange}
                    placeholder="Add a description..."
                    minHeight={150}
                  />
                </div>

                {/* Attachments */}
                <TaskAttachments
                  attachments={task.attachments}
                  onUpload={onUploadAttachment}
                  onDownload={onDownloadAttachment}
                  onDelete={onDeleteAttachment}
                />

                {/* Activity Timeline */}
                <TaskActivityTimeline activities={task.activities} />

                {/* Comments */}
                <TaskComments
                  comments={task.comments}
                  currentUser={currentUser}
                  users={users}
                  typingUsers={typingUsers}
                  onAdd={onAddComment}
                  onEdit={onEditComment}
                  onDelete={onDeleteComment}
                  onTypingStart={onCommentTypingStart}
                  onTypingEnd={onCommentTypingEnd}
                />
              </div>

              {/* Sidebar - 1 column */}
              <div className="lg:col-span-1">
                <TaskMetadataSidebar
                  metadata={task.metadata}
                  onStatusChange={(status) => onMetadataChange({ status })}
                  onPriorityChange={(priority) => onMetadataChange({ priority })}
                  onAssigneeChange={(assignee) => onMetadataChange({ assignee })}
                  onDueDateChange={(dueDate) => onMetadataChange({ dueDate })}
                  onLabelsChange={(labels) => onMetadataChange({ labels })}
                />
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }
);

TaskDetailPanel.displayName = 'TaskDetailPanel';
