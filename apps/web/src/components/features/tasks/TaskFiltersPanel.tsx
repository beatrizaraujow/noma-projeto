'use client';

import React, { useState } from 'react';
import { Filter, X, Save, ChevronDown } from 'lucide-react';

export interface TaskFilters {
  status?: string[];
  priority?: string[];
  assigneeIds?: string[];
  dueDateFrom?: string;
  dueDateTo?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface TaskFiltersProps {
  filters: TaskFilters;
  onChange: (filters: TaskFilters) => void;
  onSave?: () => void;
  users?: Array<{ id: string; name: string; avatar?: string }>;
}

const STATUS_OPTIONS = [
  { value: 'TODO', label: 'To Do', color: 'bg-gray-200' },
  { value: 'IN_PROGRESS', label: 'In Progress', color: 'bg-blue-200' },
  { value: 'IN_REVIEW', label: 'In Review', color: 'bg-yellow-200' },
  { value: 'DONE', label: 'Done', color: 'bg-green-200' },
];

const PRIORITY_OPTIONS = [
  { value: 'LOW', label: 'Low', color: 'bg-gray-200' },
  { value: 'MEDIUM', label: 'Medium', color: 'bg-blue-200' },
  { value: 'HIGH', label: 'High', color: 'bg-orange-200' },
  { value: 'URGENT', label: 'Urgent', color: 'bg-red-200' },
];

const SORT_OPTIONS = [
  { value: 'updatedAt', label: 'Last Updated' },
  { value: 'createdAt', label: 'Created Date' },
  { value: 'dueDate', label: 'Due Date' },
  { value: 'priority', label: 'Priority' },
  { value: 'title', label: 'Title' },
];

export function TaskFiltersPanel({ filters, onChange, onSave, users = [] }: TaskFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  const activeFilterCount = [
    filters.status?.length || 0,
    filters.priority?.length || 0,
    filters.assigneeIds?.length || 0,
    filters.dueDateFrom ? 1 : 0,
    filters.dueDateTo ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  const toggleArrayFilter = (key: keyof TaskFilters, value: string) => {
    const current = (filters[key] as string[]) || [];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    onChange({ ...filters, [key]: updated.length > 0 ? updated : undefined });
  };

  const clearAllFilters = () => {
    onChange({
      search: filters.search, // Keep search
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
    });
  };

  return (
    <div className="relative">
      {/* Filter Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
      >
        <Filter className="w-4 h-4" />
        <span>Filters</span>
        {activeFilterCount > 0 && (
          <span className="px-2 py-0.5 text-xs bg-blue-600 text-white rounded-full">
            {activeFilterCount}
          </span>
        )}
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Filter Panel */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-96 bg-white border rounded-lg shadow-lg z-50">
          <div className="p-4 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Filters</h3>
              <div className="flex items-center gap-2">
                {onSave && (
                  <button
                    onClick={onSave}
                    className="flex items-center gap-1 px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded"
                  >
                    <Save className="w-4 h-4" />
                    Save
                  </button>
                )}
                {activeFilterCount > 0 && (
                  <button
                    onClick={clearAllFilters}
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    Clear all
                  </button>
                )}
                <button onClick={() => setIsOpen(false)}>
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block mb-2 text-sm font-medium">Status</label>
              <div className="flex flex-wrap gap-2">
                {STATUS_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => toggleArrayFilter('status', option.value)}
                    className={`px-3 py-1.5 text-sm rounded-lg border ${
                      filters.status?.includes(option.value)
                        ? `${option.color} border-gray-400`
                        : 'bg-white hover:bg-gray-50'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Priority Filter */}
            <div>
              <label className="block mb-2 text-sm font-medium">Priority</label>
              <div className="flex flex-wrap gap-2">
                {PRIORITY_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => toggleArrayFilter('priority', option.value)}
                    className={`px-3 py-1.5 text-sm rounded-lg border ${
                      filters.priority?.includes(option.value)
                        ? `${option.color} border-gray-400`
                        : 'bg-white hover:bg-gray-50'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Assignee Filter */}
            {users.length > 0 && (
              <div>
                <label className="block mb-2 text-sm font-medium">Assignee</label>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {users.map((user) => (
                    <label
                      key={user.id}
                      className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={filters.assigneeIds?.includes(user.id)}
                        onChange={() => toggleArrayFilter('assigneeIds', user.id)}
                        className="rounded"
                      />
                      {user.avatar && (
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-6 h-6 rounded-full"
                        />
                      )}
                      <span className="text-sm">{user.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Due Date Filter */}
            <div>
              <label className="block mb-2 text-sm font-medium">Due Date</label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block mb-1 text-xs text-gray-600">From</label>
                  <input
                    type="date"
                    value={filters.dueDateFrom || ''}
                    onChange={(e) =>
                      onChange({ ...filters, dueDateFrom: e.target.value || undefined })
                    }
                    className="w-full px-3 py-2 text-sm border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-xs text-gray-600">To</label>
                  <input
                    type="date"
                    value={filters.dueDateTo || ''}
                    onChange={(e) =>
                      onChange({ ...filters, dueDateTo: e.target.value || undefined })
                    }
                    className="w-full px-3 py-2 text-sm border rounded-lg"
                  />
                </div>
              </div>
            </div>

            {/* Sort Options */}
            <div>
              <label className="block mb-2 text-sm font-medium">Sort By</label>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={filters.sortBy || 'updatedAt'}
                  onChange={(e) => onChange({ ...filters, sortBy: e.target.value })}
                  className="px-3 py-2 text-sm border rounded-lg"
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <select
                  value={filters.sortOrder || 'desc'}
                  onChange={(e) =>
                    onChange({ ...filters, sortOrder: e.target.value as 'asc' | 'desc' })
                  }
                  className="px-3 py-2 text-sm border rounded-lg"
                >
                  <option value="desc">Descending</option>
                  <option value="asc">Ascending</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
