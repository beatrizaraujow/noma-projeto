'use client';

import React, { useState } from 'react';
import axios from 'axios';
import { Button } from '@nexora/ui/components/button';
import { Card } from '@nexora/ui/components/card';
import { CheckSquare, Loader2, AlertCircle } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface BulkActionsProps {
  selectedTaskIds: string[];
  token: string;
  onActionComplete?: () => void;
}

export default function BulkActions({
  selectedTaskIds,
  token,
  onActionComplete,
}: BulkActionsProps) {
  const [loading, setLoading] = useState(false);
  const [selectedAction, setSelectedAction] = useState('');
  const [actionData, setActionData] = useState<any>({});
  const [result, setResult] = useState<any>(null);

  const actions = [
    { value: 'update_status', label: 'Update Status', requiresInput: 'status' as const },
    { value: 'update_priority', label: 'Update Priority', requiresInput: 'priority' as const },
    { value: 'assign', label: 'Assign To', requiresInput: 'assigneeId' as const },
    { value: 'move_project', label: 'Move to Project', requiresInput: 'projectId' as const },
    { value: 'delete', label: 'Delete Tasks', requiresInput: null },
  ];

  const handleExecute = async () => {
    if (!selectedAction) {
      alert('Please select an action');
      return;
    }

    if (selectedTaskIds.length === 0) {
      alert('No tasks selected');
      return;
    }

    const action = actions.find((a) => a.value === selectedAction);
    if (action?.requiresInput && !actionData[action.requiresInput]) {
      alert(`Please provide ${action.requiresInput}`);
      return;
    }

    if (selectedAction === 'delete') {
      if (!confirm(`Delete ${selectedTaskIds.length} tasks? This cannot be undone.`)) {
        return;
      }
    }

    try {
      setLoading(true);
      setResult(null);

      const response = await axios.post(
        `${API_URL}/automation/bulk-actions`,
        {
          action: selectedAction,
          taskIds: selectedTaskIds,
          data: actionData,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setResult(response.data);

      if (onActionComplete) {
        onActionComplete();
      }

      // Reset form
      setSelectedAction('');
      setActionData({});
    } catch (error: any) {
      console.error('Error executing bulk action:', error);
      setResult({
        success: 0,
        failed: selectedTaskIds.length,
        errors: [error.response?.data?.message || 'Failed to execute action'],
      });
    } finally {
      setLoading(false);
    }
  };

  const renderInput = () => {
    const action = actions.find((a) => a.value === selectedAction);
    if (!action?.requiresInput) return null;

    switch (action.requiresInput) {
      case 'status':
        return (
          <select
            value={actionData.status || ''}
            onChange={(e) => setActionData({ status: e.target.value })}
            className="w-full p-2 border rounded"
          >
            <option value="">Select status...</option>
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="done">Done</option>
          </select>
        );

      case 'priority':
        return (
          <select
            value={actionData.priority || ''}
            onChange={(e) => setActionData({ priority: e.target.value })}
            className="w-full p-2 border rounded"
          >
            <option value="">Select priority...</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        );

      case 'assigneeId':
      case 'projectId':
        return (
          <input
            type="text"
            value={actionData[action.requiresInput] || ''}
            onChange={(e) =>
              setActionData({ [action.requiresInput]: e.target.value })
            }
            placeholder={`Enter ${action.requiresInput}...`}
            className="w-full p-2 border rounded"
          />
        );

      default:
        return null;
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <CheckSquare className="w-5 h-5 text-purple-500" />
        <h3 className="text-lg font-semibold">Bulk Actions</h3>
      </div>

      <div className="mb-4 p-3 bg-blue-50 rounded">
        <p className="text-sm text-blue-700">
          <strong>{selectedTaskIds.length}</strong> task(s) selected
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Action</label>
          <select
            value={selectedAction}
            onChange={(e) => {
              setSelectedAction(e.target.value);
              setActionData({});
            }}
            className="w-full p-2 border rounded"
          >
            <option value="">Select action...</option>
            {actions.map((action) => (
              <option key={action.value} value={action.value}>
                {action.label}
              </option>
            ))}
          </select>
        </div>

        {selectedAction && (
          <div>
            <label className="block text-sm font-medium mb-2">
              {actions.find((a) => a.value === selectedAction)?.requiresInput || 'Value'}
            </label>
            {renderInput()}
          </div>
        )}

        <Button
          onClick={handleExecute}
          disabled={loading || !selectedAction || selectedTaskIds.length === 0}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Executing...
            </>
          ) : (
            'Execute Action'
          )}
        </Button>

        {result && (
          <div
            className={`p-4 rounded ${
              result.failed > 0
                ? 'bg-red-50 border border-red-200'
                : 'bg-green-50 border border-green-200'
            }`}
          >
            <div className="flex items-start gap-2">
              <AlertCircle
                className={`w-5 h-5 mt-0.5 ${
                  result.failed > 0 ? 'text-red-600' : 'text-green-600'
                }`}
              />
              <div className="flex-1">
                <p className="font-medium text-sm">
                  {result.success > 0 && (
                    <span className="text-green-700">
                      ✓ {result.success} succeeded
                    </span>
                  )}
                  {result.failed > 0 && (
                    <span className="text-red-700 ml-3">
                      ✗ {result.failed} failed
                    </span>
                  )}
                </p>
                {result.errors && result.errors.length > 0 && (
                  <div className="mt-2 text-xs text-red-600">
                    {result.errors.map((error: string, idx: number) => (
                      <div key={idx}>• {error}</div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
