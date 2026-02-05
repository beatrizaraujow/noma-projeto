import * as React from 'react';
import { MessageSquare, MoreVertical, Edit2, Trash2, AtSign, Send } from 'lucide-react';
import { cn } from '../lib/utils';
import { Avatar } from './avatar';
import { Button } from './button';
import { Dropdown, DropdownItem, DropdownSeparator } from './dropdown';
import { TypingIndicator } from './typing-indicator';

export interface Comment {
  id: string;
  author: {
    name: string;
    avatar?: string;
  };
  content: string;
  timestamp: Date;
  isEdited?: boolean;
  mentions?: string[];
}

export interface TaskCommentProps {
  comment: Comment;
  currentUserId?: string;
  onEdit?: (commentId: string, content: string) => void;
  onDelete?: (commentId: string) => void;
  className?: string;
}

export const TaskComment = React.forwardRef<HTMLDivElement, TaskCommentProps>(
  ({ comment, currentUserId, onEdit, onDelete, className }, ref) => {
    const [isEditing, setIsEditing] = React.useState(false);
    const [editValue, setEditValue] = React.useState(comment.content);

    const handleSave = () => {
      if (onEdit) {
        onEdit(comment.id, editValue);
      }
      setIsEditing(false);
    };

    const handleCancel = () => {
      setEditValue(comment.content);
      setIsEditing(false);
    };

    // Highlight mentions in content
    const renderContent = (content: string) => {
      if (!comment.mentions || comment.mentions.length === 0) {
        return content;
      }

      const parts = content.split(/(@\w+)/g);
      return parts.map((part, index) => {
        if (part.startsWith('@') && comment.mentions?.includes(part)) {
          return (
            <span
              key={index}
              className="text-orange-600 dark:text-orange-400 font-medium hover:underline cursor-pointer"
            >
              {part}
            </span>
          );
        }
        return part;
      });
    };

    return (
      <div ref={ref} className={cn('flex gap-3 group', className)}>
        <Avatar src={comment.author.avatar} fallback={comment.author.name} size="sm" />

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between gap-2 mb-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-neutral-900 dark:text-white">
                {comment.author.name}
              </span>
              <span className="text-xs text-neutral-500 dark:text-neutral-400">
                {new Date(comment.timestamp).toLocaleString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                })}
                {comment.isEdited && ' (edited)'}
              </span>
            </div>

            {/* Actions (visible on hover) */}
            {(onEdit || onDelete) && (
              <Dropdown
                trigger={
                  <button className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-all">
                    <MoreVertical className="h-4 w-4 text-neutral-500" />
                  </button>
                }
                align="end"
              >
                {onEdit && (
                  <DropdownItem
                    leftIcon={<Edit2 className="h-4 w-4" />}
                    onClick={() => setIsEditing(true)}
                  >
                    Edit
                  </DropdownItem>
                )}
                {onDelete && (
                  <>
                    <DropdownSeparator />
                    <DropdownItem
                      leftIcon={<Trash2 className="h-4 w-4" />}
                      onClick={() => onDelete(comment.id)}
                      danger
                    >
                      Delete
                    </DropdownItem>
                  </>
                )}
              </Dropdown>
            )}
          </div>

          {/* Content */}
          {isEditing ? (
            <div className="space-y-2">
              <textarea
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                rows={3}
                autoFocus
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleSave}>
                  Save
                </Button>
                <Button size="sm" variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-sm text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap">
              {renderContent(comment.content)}
            </div>
          )}
        </div>
      </div>
    );
  }
);

TaskComment.displayName = 'TaskComment';

export interface User {
  id: string;
  name: string;
  avatar?: string;
}

export interface TaskCommentInputProps {
  currentUser: User;
  onSubmit: (content: string, mentions: string[]) => void;
  placeholder?: string;
  users?: User[];
  onTypingStart?: () => void;
  onTypingEnd?: () => void;
  className?: string;
}

export const TaskCommentInput = React.forwardRef<HTMLDivElement, TaskCommentInputProps>(
  ({ currentUser, onSubmit, placeholder = 'Add a comment...', users = [], className }, ref) => {
    const [value, setValue] = React.useState('');
    const [showMentions, setShowMentions] = React.useState(false);
    const [mentionSearch, setMentionSearch] = React.useState('');
    const [cursorPosition, setCursorPosition] = React.useState(0);
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);

    // Detect @ mentions
    React.useEffect(() => {
      const beforeCursor = value.slice(0, cursorPosition);
      const match = beforeCursor.match(/@(\w*)$/);

      if (match) {
        setMentionSearch(match[1]);
        setShowMentions(true);
      } else {
        setShowMentions(false);
      }
    }, [value, cursorPosition]);

    // Filter users based on mention search
    const filteredUsers = React.useMemo(() => {
      if (!mentionSearch) return users;
      return users.filter((user) =>
        user.name.toLowerCase().includes(mentionSearch.toLowerCase())
      );
    }, [users, mentionSearch]);

    const handleMentionSelect = (user: User) => {
      const beforeCursor = value.slice(0, cursorPosition);
      const afterCursor = value.slice(cursorPosition);
      const beforeMention = beforeCursor.replace(/@\w*$/, '');
      const newValue = `${beforeMention}@${user.name} ${afterCursor}`;

      setValue(newValue);
      setShowMentions(false);

      // Focus back on textarea
      setTimeout(() => {
        textareaRef.current?.focus();
        const newPosition = beforeMention.length + user.name.length + 2;
        textareaRef.current?.setSelectionRange(newPosition, newPosition);
      }, 0);
    };

    const handleSubmit = () => {
      if (!value.trim()) return;

      // Extract mentions
      const mentions = value.match(/@\w+/g) || [];
      onSubmit(value, mentions);
      setValue('');
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        handleSubmit();
      }
    };

    return (
      <div ref={ref} className={cn('relative', className)}>
        <div className="flex gap-3">
          <Avatar src={currentUser.avatar} fallback={currentUser.name} size="sm" />

          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                setCursorPosition(e.target.selectionStart);
              }}
              onKeyDown={handleKeyDown}
              onClick={(e) => setCursorPosition(e.currentTarget.selectionStart)}
              onKeyUp={(e) => setCursorPosition(e.currentTarget.selectionStart)}
              placeholder={placeholder}
              className="w-full px-4 py-3 text-sm bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
              rows={3}
            />

            {/* Mentions dropdown */}
            {showMentions && filteredUsers.length > 0 && (
              <div className="absolute bottom-full left-0 mb-2 w-64 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-lg overflow-hidden z-50">
                <div className="py-1 max-h-48 overflow-y-auto">
                  {filteredUsers.slice(0, 5).map((user) => (
                    <button
                      key={user.id}
                      onClick={() => handleMentionSelect(user)}
                      className="w-full flex items-center gap-2 px-3 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                    >
                      <Avatar src={user.avatar} fallback={user.name} size="xs" />
                      <span className="text-sm text-neutral-900 dark:text-white">
                        {user.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between mt-2">
              <button
                type="button"
                className="flex items-center gap-1 px-2 py-1 text-xs text-neutral-500 dark:text-neutral-400 hover:text-orange-600 dark:hover:text-orange-400 rounded hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                onClick={() => {
                  setValue(value + '@');
                  textareaRef.current?.focus();
                }}
              >
                <AtSign className="h-3 w-3" />
                Mention
              </button>

              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-400">
                  Cmd/Ctrl + Enter to send
                </span>
                <Button
                  size="sm"
                  onClick={handleSubmit}
                  disabled={!value.trim()}
                >
                  <Send className="h-4 w-4 mr-1" />
                  Send
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

TaskCommentInput.displayName = 'TaskCommentInput';

export interface TaskCommentsProps {
  comments: Comment[];
  currentUser: User;
  users?: User[];
  typingUsers?: Array<{ id: string; name: string; avatar?: string }>;
  onAdd: (content: string, mentions: string[]) => void;
  onEdit?: (commentId: string, content: string) => void;
  onDelete?: (commentId: string) => void;
  onTypingStart?: () => void;
  onTypingEnd?: () => void;
  className?: string;
}

export const TaskComments = React.forwardRef<HTMLDivElement, TaskCommentsProps>(
  (
    {
      comments,
      currentUser,
      users = [],
      typingUsers = [],
      onAdd,
      onEdit,
      onDelete,
      onTypingStart,
      onTypingEnd,
      className,
    },
    ref
  ) => {
    return (
      <div ref={ref} className={cn('space-y-6', className)}>
        {/* Header */}
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-neutral-700 dark:text-neutral-300" />
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
            Comments
            {comments.length > 0 && (
              <span className="ml-2 text-sm font-normal text-neutral-500 dark:text-neutral-400">
                ({comments.length})
              </span>
            )}
          </h3>
        </div>

        {/* Comments list */}
        <div className="space-y-4">
          {comments.map((comment) => (
            <TaskComment
              key={comment.id}
              comment={comment}
              currentUserId={currentUser.id}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}

          {comments.length === 0 && (
            <p className="text-sm text-neutral-500 dark:text-neutral-400 text-center py-8">
              No comments yet. Be the first to comment!
            </p>
          )}
        </div>

        {/* Comment input */}
        <TaskCommentInput
          currentUser={currentUser}
          onSubmit={onAdd}
          users={users}
        />
      </div>
    );
  }
);

TaskComments.displayName = 'TaskComments';
