'use client';

import React, { useState, useEffect } from 'react';
import { Star, Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import { TaskFilters } from './TaskFiltersPanel';

interface SavedFilter {
  id: string;
  name: string;
  description?: string;
  entityType: string;
  filters: TaskFilters;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

interface SavedFiltersProps {
  workspaceId?: string;
  entityType: 'task' | 'project' | 'activity';
  onApplyFilter: (filters: TaskFilters) => void;
}

export function SavedFilters({ workspaceId, entityType, onApplyFilter }: SavedFiltersProps) {
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newFilterName, setNewFilterName] = useState('');
  const [newFilterDescription, setNewFilterDescription] = useState('');

  useEffect(() => {
    loadSavedFilters();
  }, [workspaceId, entityType]);

  const loadSavedFilters = async () => {
    try {
      const params = new URLSearchParams({
        entityType,
        ...(workspaceId && { workspaceId }),
      });
      const response = await fetch(`/api/saved-filters?${params}`);
      const data = await response.json();
      setSavedFilters(data);
    } catch (error) {
      console.error('Failed to load saved filters:', error);
    }
  };

  const handleSaveCurrentFilters = async (currentFilters: TaskFilters) => {
    if (!newFilterName.trim()) return;

    try {
      const response = await fetch('/api/saved-filters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newFilterName,
          description: newFilterDescription,
          entityType,
          filters: currentFilters,
          workspaceId,
          isPublic: false,
        }),
      });

      if (response.ok) {
        await loadSavedFilters();
        setIsCreating(false);
        setNewFilterName('');
        setNewFilterDescription('');
      }
    } catch (error) {
      console.error('Failed to save filter:', error);
    }
  };

  const handleDeleteFilter = async (id: string) => {
    try {
      await fetch(`/api/saved-filters/${id}`, { method: 'DELETE' });
      await loadSavedFilters();
    } catch (error) {
      console.error('Failed to delete filter:', error);
    }
  };

  const handleUpdateFilter = async (id: string, updates: Partial<SavedFilter>) => {
    try {
      await fetch(`/api/saved-filters/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      await loadSavedFilters();
      setEditingId(null);
    } catch (error) {
      console.error('Failed to update filter:', error);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium text-gray-700">Saved Filters</h4>
        <button
          onClick={() => setIsCreating(true)}
          className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
        >
          <Plus className="w-4 h-4" />
          New
        </button>
      </div>

      {/* Create New Filter Form */}
      {isCreating && (
        <div className="p-3 border rounded-lg bg-gray-50">
          <input
            type="text"
            placeholder="Filter name"
            value={newFilterName}
            onChange={(e) => setNewFilterName(e.target.value)}
            className="w-full px-3 py-2 mb-2 text-sm border rounded"
          />
          <input
            type="text"
            placeholder="Description (optional)"
            value={newFilterDescription}
            onChange={(e) => setNewFilterDescription(e.target.value)}
            className="w-full px-3 py-2 mb-2 text-sm border rounded"
          />
          <div className="flex gap-2">
            <button
              onClick={() => {
                // This would need to receive current filters from parent
                // handleSaveCurrentFilters(currentFilters);
                setIsCreating(false);
              }}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Save
            </button>
            <button
              onClick={() => {
                setIsCreating(false);
                setNewFilterName('');
                setNewFilterDescription('');
              }}
              className="px-3 py-1 text-sm border rounded hover:bg-gray-100"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Saved Filters List */}
      <div className="space-y-1">
        {savedFilters.map((filter) => (
          <div
            key={filter.id}
            className="group flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg"
          >
            {editingId === filter.id ? (
              <div className="flex-1">
                <input
                  type="text"
                  defaultValue={filter.name}
                  onBlur={(e) => {
                    if (e.target.value !== filter.name) {
                      handleUpdateFilter(filter.id, { name: e.target.value });
                    }
                  }}
                  className="w-full px-2 py-1 text-sm border rounded"
                />
              </div>
            ) : (
              <button
                onClick={() => onApplyFilter(filter.filters)}
                className="flex-1 text-left"
              >
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm font-medium">{filter.name}</span>
                  {filter.isPublic && (
                    <span className="px-1.5 py-0.5 text-xs bg-blue-100 text-blue-700 rounded">
                      Public
                    </span>
                  )}
                </div>
                {filter.description && (
                  <p className="text-xs text-gray-500 ml-6">{filter.description}</p>
                )}
              </button>
            )}

            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {editingId === filter.id ? (
                <>
                  <button
                    onClick={() => setEditingId(null)}
                    className="p-1 text-green-600 hover:bg-green-50 rounded"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setEditingId(filter.id)}
                    className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteFilter(filter.id)}
                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>
        ))}

        {savedFilters.length === 0 && !isCreating && (
          <p className="text-sm text-gray-500 text-center py-4">
            No saved filters yet
          </p>
        )}
      </div>
    </div>
  );
}

// Hook to save filters from parent component
export function useSaveFilter() {
  const [isSaving, setIsSaving] = useState(false);

  const saveFilter = async (
    name: string,
    description: string,
    entityType: string,
    filters: TaskFilters,
    workspaceId?: string
  ) => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/saved-filters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          entityType,
          filters,
          workspaceId,
          isPublic: false,
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('Failed to save filter:', error);
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return { saveFilter, isSaving };
}
