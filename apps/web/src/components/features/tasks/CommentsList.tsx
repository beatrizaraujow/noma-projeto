'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface Comment {
  id: string;
  content: string;
  authorId: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  mentions: string[];
  createdAt: string;
  updatedAt: string;
  attachments: Array<{
    id: string;
    filename: string;
    url: string;
    size: number;
    mimeType: string;
  }>;
}

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface CommentsListProps {
  taskId: string;
  projectMembers?: User[];
  onCommentAdded?: () => void;
}

export function CommentsList({ taskId, projectMembers = [], onCommentAdded }: CommentsListProps) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionSearch, setMentionSearch] = useState('');
  const [cursorPosition, setCursorPosition] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    loadComments();
  }, [taskId]);

  const loadComments = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/comments/task/${taskId}`, {
        headers: {
          Authorization: `Bearer ${(session as any)?.accessToken}`,
        },
      });
      setComments(response.data);
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const position = e.target.selectionStart;
    
    setNewComment(value);
    setCursorPosition(position);

    // Check for @ mention
    const textBeforeCursor = value.substring(0, position);
    const mentionMatch = textBeforeCursor.match(/@(\w*)$/);
    
    if (mentionMatch) {
      setMentionSearch(mentionMatch[1].toLowerCase());
      setShowMentions(true);
    } else {
      setShowMentions(false);
    }
  };

  const insertMention = (user: User) => {
    const textBeforeCursor = newComment.substring(0, cursorPosition);
    const textAfterCursor = newComment.substring(cursorPosition);
    
    // Remove the partial @mention and insert the full one
    const beforeMention = textBeforeCursor.replace(/@\w*$/, '');
    const newText = `${beforeMention}@${user.name} ${textAfterCursor}`;
    
    setNewComment(newText);
    setShowMentions(false);
    textareaRef.current?.focus();
  };

  const filteredMembers = projectMembers.filter((member) =>
    member.name.toLowerCase().includes(mentionSearch)
  );

  const postComment = async () => {
    if (!newComment.trim()) return;

    setLoading(true);
    try {
      await axios.post(
        `${API_URL}/api/comments`,
        {
          content: newComment,
          taskId,
        },
        {
          headers: {
            Authorization: `Bearer ${(session as any)?.accessToken}`,
          },
        }
      );
      setNewComment('');
      loadComments();
      onCommentAdded?.();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error posting comment');
    } finally {
      setLoading(false);
    }
  };

  const deleteComment = async (commentId: string) => {
    if (!confirm('Excluir este comentário?')) return;

    try {
      await axios.delete(`${API_URL}/api/comments/${commentId}`, {
        headers: {
          Authorization: `Bearer ${(session as any)?.accessToken}`,
        },
      });
      loadComments();
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
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
    return date.toLocaleDateString('pt-BR');
  };

  const renderContent = (content: string) => {
    // Highlight mentions
    const parts = content.split(/(@\w+)/g);
    return parts.map((part, index) => {
      if (part.startsWith('@')) {
        return (
          <span key={index} className="text-blue-600 dark:text-blue-400 font-medium">
            {part}
          </span>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        Comentários ({comments.length})
      </h3>

      {/* New Comment */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={newComment}
          onChange={handleTextChange}
          placeholder="Adicionar um comentário... (use @ para mencionar)"
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white resize-none focus:ring-2 focus:ring-blue-500"
          rows={3}
        />

        {/* Mention Dropdown */}
        {showMentions && filteredMembers.length > 0 && (
          <div className="absolute z-10 mt-1 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 max-h-48 overflow-y-auto">
            {filteredMembers.map((member) => (
              <button
                key={member.id}
                onClick={() => insertMention(member)}
                className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
              >
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                  {member.name[0].toUpperCase()}
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {member.name}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {member.email}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        <div className="flex justify-end mt-2">
          <button
            onClick={postComment}
            disabled={loading || !newComment.trim()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
          >
            {loading ? 'Enviando...' : 'Comentar'}
          </button>
        </div>
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        {comments.map((comment) => (
          <div
            key={comment.id}
            className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {comment.author.name[0].toUpperCase()}
                </div>
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {comment.author.name}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {formatTime(comment.createdAt)}
                  </div>
                </div>
              </div>
              {comment.authorId === (session?.user as any)?.id && (
                <button
                  onClick={() => deleteComment(comment.id)}
                  className="text-red-600 hover:text-red-700 text-sm"
                >
                  Excluir
                </button>
              )}
            </div>

            <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {renderContent(comment.content)}
            </div>

            {comment.attachments.length > 0 && (
              <div className="mt-3 space-y-2">
                {comment.attachments.map((attachment) => (
                  <a
                    key={attachment.id}
                    href={`${API_URL}${attachment.url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    📎 {attachment.filename}
                  </a>
                ))}
              </div>
            )}
          </div>
        ))}

        {comments.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            Nenhum comentário ainda. Seja o primeiro!
          </div>
        )}
      </div>
    </div>
  );
}
