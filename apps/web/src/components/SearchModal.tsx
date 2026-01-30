'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Search, Command, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface SearchResult {
  id: string;
  title: string;
  type: 'task' | 'project' | 'comment';
  description?: string;
  projectId?: string;
  workspaceId?: string;
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{
    tasks: any[];
    projects: any[];
    comments: any[];
  }>({ tasks: [], projects: [], comments: [] });
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults({ tasks: [], projects: [], comments: [] });
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/search?query=${encodeURIComponent(query)}&entityType=all&limit=5`,
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
        const data = await response.json();
        setResults(data);
        setSelectedIndex(0);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const allResults = [
    ...results.projects.map((p) => ({ ...p, type: 'project' as const })),
    ...results.tasks.map((t) => ({ ...t, type: 'task' as const })),
    ...results.comments.map((c) => ({ ...c, type: 'comment' as const })),
  ];

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, allResults.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && allResults[selectedIndex]) {
      e.preventDefault();
      handleSelectResult(allResults[selectedIndex]);
    }
  };

  const handleSelectResult = (result: any) => {
    if (result.type === 'project') {
      router.push(`/projects/${result.id}`);
    } else if (result.type === 'task') {
      router.push(`/projects/${result.projectId}?task=${result.id}`);
    } else if (result.type === 'comment') {
      router.push(`/projects/${result.task.projectId}?task=${result.task.id}`);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/50">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-2xl">
        {/* Search Input */}
        <div className="flex items-center gap-3 p-4 border-b">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search tasks, projects, comments..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 text-lg outline-none"
          />
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto">
          {loading && (
            <div className="p-8 text-center text-gray-500">Searching...</div>
          )}

          {!loading && query && allResults.length === 0 && (
            <div className="p-8 text-center text-gray-500">No results found</div>
          )}

          {!loading && allResults.length > 0 && (
            <div className="py-2">
              {/* Projects */}
              {results.projects.length > 0 && (
                <div className="mb-2">
                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">
                    Projects
                  </div>
                  {results.projects.map((project, idx) => {
                    const globalIdx = allResults.findIndex(
                      (r) => r.type === 'project' && r.id === project.id
                    );
                    return (
                      <button
                        key={project.id}
                        onClick={() =>
                          handleSelectResult({ ...project, type: 'project' })
                        }
                        className={`w-full px-4 py-3 text-left hover:bg-gray-50 ${
                          globalIdx === selectedIndex ? 'bg-blue-50' : ''
                        }`}
                      >
                        <div className="font-medium">{project.name}</div>
                        {project.description && (
                          <div className="text-sm text-gray-600 truncate">
                            {project.description}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Tasks */}
              {results.tasks.length > 0 && (
                <div className="mb-2">
                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">
                    Tasks
                  </div>
                  {results.tasks.map((task) => {
                    const globalIdx = allResults.findIndex(
                      (r) => r.type === 'task' && r.id === task.id
                    );
                    return (
                      <button
                        key={task.id}
                        onClick={() =>
                          handleSelectResult({ ...task, type: 'task' })
                        }
                        className={`w-full px-4 py-3 text-left hover:bg-gray-50 ${
                          globalIdx === selectedIndex ? 'bg-blue-50' : ''
                        }`}
                      >
                        <div className="font-medium">{task.title}</div>
                        <div className="text-sm text-gray-600">
                          {task.project.name} • {task.status}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Comments */}
              {results.comments.length > 0 && (
                <div>
                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">
                    Comments
                  </div>
                  {results.comments.map((comment) => {
                    const globalIdx = allResults.findIndex(
                      (r) => r.type === 'comment' && r.id === comment.id
                    );
                    return (
                      <button
                        key={comment.id}
                        onClick={() =>
                          handleSelectResult({ ...comment, type: 'comment' })
                        }
                        className={`w-full px-4 py-3 text-left hover:bg-gray-50 ${
                          globalIdx === selectedIndex ? 'bg-blue-50' : ''
                        }`}
                      >
                        <div className="text-sm truncate">{comment.content}</div>
                        <div className="text-xs text-gray-600">
                          {comment.task.title} • {comment.author.name}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-4 px-4 py-3 text-xs text-gray-500 border-t bg-gray-50">
          <div className="flex items-center gap-1">
            <kbd className="px-2 py-1 bg-white border rounded">↑↓</kbd>
            <span>Navigate</span>
          </div>
          <div className="flex items-center gap-1">
            <kbd className="px-2 py-1 bg-white border rounded">Enter</kbd>
            <span>Select</span>
          </div>
          <div className="flex items-center gap-1">
            <kbd className="px-2 py-1 bg-white border rounded">Esc</kbd>
            <span>Close</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function useSearchShortcut() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+K or Cmd+K
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return { isOpen, setIsOpen };
}
