import * as React from 'react';
import {
  Upload,
  Paperclip,
  X,
  FileText,
  Image as ImageIcon,
  File,
  Download,
  Trash2,
  Eye,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Button } from './button';

export interface Attachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploadedBy?: {
    name: string;
    avatar?: string;
  };
  uploadedAt: Date;
}

export interface TaskAttachmentItemProps {
  attachment: Attachment;
  onDownload?: (attachmentId: string) => void;
  onDelete?: (attachmentId: string) => void;
  onPreview?: (attachmentId: string) => void;
  className?: string;
}

export const TaskAttachmentItem = React.forwardRef<HTMLDivElement, TaskAttachmentItemProps>(
  ({ attachment, onDownload, onDelete, onPreview, className }, ref) => {
    const getFileIcon = () => {
      if (attachment.type.startsWith('image/')) {
        return <ImageIcon className="h-5 w-5" />;
      }
      if (attachment.type.includes('pdf')) {
        return <FileText className="h-5 w-5" />;
      }
      return <File className="h-5 w-5" />;
    };

    const formatSize = (bytes: number) => {
      if (bytes < 1024) return `${bytes} B`;
      if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const isImage = attachment.type.startsWith('image/');

    return (
      <div
        ref={ref}
        className={cn(
          'group relative rounded-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden hover:border-orange-300 dark:hover:border-orange-600 transition-colors',
          className
        )}
      >
        {/* Preview/Thumbnail */}
        {isImage ? (
          <div className="aspect-video w-full bg-neutral-100 dark:bg-neutral-800 relative">
            <img
              src={attachment.url}
              alt={attachment.name}
              className="w-full h-full object-cover"
            />
            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              {onPreview && (
                <button
                  onClick={() => onPreview(attachment.id)}
                  className="p-2 bg-white/90 dark:bg-neutral-800/90 rounded-lg hover:bg-white dark:hover:bg-neutral-800 transition-colors"
                  title="Preview"
                >
                  <Eye className="h-4 w-4" />
                </button>
              )}
              {onDownload && (
                <button
                  onClick={() => onDownload(attachment.id)}
                  className="p-2 bg-white/90 dark:bg-neutral-800/90 rounded-lg hover:bg-white dark:hover:bg-neutral-800 transition-colors"
                  title="Download"
                >
                  <Download className="h-4 w-4" />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(attachment.id)}
                  className="p-2 bg-red-500/90 text-white rounded-lg hover:bg-red-600 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 p-4">
            <div className="flex-shrink-0 w-10 h-10 bg-neutral-100 dark:bg-neutral-800 rounded-lg flex items-center justify-center text-neutral-600 dark:text-neutral-400">
              {getFileIcon()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">
                {attachment.name}
              </p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {formatSize(attachment.size)}
              </p>
            </div>
            <div className="flex-shrink-0 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {onDownload && (
                <button
                  onClick={() => onDownload(attachment.id)}
                  className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded transition-colors"
                  title="Download"
                >
                  <Download className="h-4 w-4" />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(attachment.id)}
                  className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 rounded transition-colors"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* File info (for images) */}
        {isImage && (
          <div className="p-3 border-t border-neutral-200 dark:border-neutral-700">
            <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">
              {attachment.name}
            </p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              {formatSize(attachment.size)}
            </p>
          </div>
        )}
      </div>
    );
  }
);

TaskAttachmentItem.displayName = 'TaskAttachmentItem';

export interface TaskAttachmentUploadProps {
  onUpload: (files: FileList) => void;
  maxSize?: number; // in MB
  accept?: string;
  className?: string;
}

export const TaskAttachmentUpload = React.forwardRef<HTMLDivElement, TaskAttachmentUploadProps>(
  ({ onUpload, maxSize = 10, accept, className }, ref) => {
    const [isDragging, setIsDragging] = React.useState(false);
    const inputRef = React.useRef<HTMLInputElement>(null);

    const handleDragEnter = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
    };

    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        onUpload(e.dataTransfer.files);
      }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        onUpload(e.target.files);
        // Reset input
        e.target.value = '';
      }
    };

    return (
      <div ref={ref} className={cn('', className)}>
        <input
          ref={inputRef}
          type="file"
          onChange={handleFileSelect}
          accept={accept}
          multiple
          className="hidden"
        />

        <div
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={cn(
            'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all',
            isDragging
              ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
              : 'border-neutral-300 dark:border-neutral-600 hover:border-orange-400 dark:hover:border-orange-500 hover:bg-neutral-50 dark:hover:bg-neutral-800'
          )}
        >
          <div className="flex flex-col items-center gap-3">
            <div
              className={cn(
                'w-12 h-12 rounded-full flex items-center justify-center',
                isDragging
                  ? 'bg-orange-500 text-white'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
              )}
            >
              <Upload className="h-6 w-6" />
            </div>

            <div>
              <p className="text-sm font-medium text-neutral-900 dark:text-white">
                {isDragging ? 'Drop files here' : 'Drop files here or click to browse'}
              </p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                Maximum file size: {maxSize} MB
              </p>
            </div>

            <Button size="sm" variant="outline">
              <Paperclip className="h-4 w-4 mr-2" />
              Choose Files
            </Button>
          </div>
        </div>
      </div>
    );
  }
);

TaskAttachmentUpload.displayName = 'TaskAttachmentUpload';

export interface TaskAttachmentsProps {
  attachments: Attachment[];
  onUpload: (files: FileList) => void;
  onDownload?: (attachmentId: string) => void;
  onDelete?: (attachmentId: string) => void;
  onPreview?: (attachmentId: string) => void;
  maxSize?: number;
  className?: string;
}

export const TaskAttachments = React.forwardRef<HTMLDivElement, TaskAttachmentsProps>(
  (
    {
      attachments,
      onUpload,
      onDownload,
      onDelete,
      onPreview,
      maxSize = 10,
      className,
    },
    ref
  ) => {
    return (
      <div ref={ref} className={cn('space-y-4', className)}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Paperclip className="h-5 w-5 text-neutral-700 dark:text-neutral-300" />
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
              Attachments
              {attachments.length > 0 && (
                <span className="ml-2 text-sm font-normal text-neutral-500 dark:text-neutral-400">
                  ({attachments.length})
                </span>
              )}
            </h3>
          </div>
        </div>

        {/* Attachments grid */}
        {attachments.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {attachments.map((attachment) => (
              <TaskAttachmentItem
                key={attachment.id}
                attachment={attachment}
                onDownload={onDownload}
                onDelete={onDelete}
                onPreview={onPreview}
              />
            ))}
          </div>
        )}

        {/* Upload zone */}
        <TaskAttachmentUpload onUpload={onUpload} maxSize={maxSize} />
      </div>
    );
  }
);

TaskAttachments.displayName = 'TaskAttachments';
