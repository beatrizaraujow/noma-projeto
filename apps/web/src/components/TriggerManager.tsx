'use client';

import React, { useState } from 'react';
import axios from 'axios';
import { Button } from '@nexora/ui/components/button';
import { Card } from '@nexora/ui/components/card';
import { Input } from '@nexora/ui/components/input';
import { Zap, Plus, Edit2, Trash2, Power, PowerOff } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface Trigger {
  id: string;
  name: string;
  enabled: boolean;
  event: string;
  conditions: any;
  actions: any[];
}

interface TriggerManagerProps {
  workspaceId: string;
  projectId?: string;
  token: string;
}

export default function TriggerManager({
  workspaceId,
  projectId,
  token,
}: TriggerManagerProps) {
  const [triggers, setTriggers] = useState<Trigger[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTrigger, setEditingTrigger] = useState<Trigger | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    event: 'task_moved',
    enabled: true,
    conditionField: 'status',
    conditionOperator: 'changed_to',
    conditionValue: '',
    actionType: 'update_field',
    actionField: 'priority',
    actionValue: '',
  });

  const loadTriggers = async () => {
    try {
      const response = await axios.get(`${API_URL}/automation/triggers`, {
        params: { workspaceId, projectId },
        headers: { Authorization: `Bearer ${token}` },
      });
      setTriggers(response.data);
    } catch (error) {
      console.error('Error loading triggers:', error);
    }
  };

  React.useEffect(() => {
    loadTriggers();
  }, [workspaceId, projectId]);

  const handleCreateTrigger = async () => {
    try {
      await axios.post(
        `${API_URL}/automation/triggers`,
        {
          workspaceId,
          projectId,
          name: formData.name,
          enabled: formData.enabled,
          event: formData.event,
          conditions: {
            field: formData.conditionField,
            operator: formData.conditionOperator,
            value: formData.conditionValue,
          },
          actions: [
            {
              type: formData.actionType,
              config: {
                field: formData.actionField,
                value: formData.actionValue,
              },
            },
          ],
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      await loadTriggers();
      setShowCreateForm(false);
      resetForm();
    } catch (error) {
      console.error('Error creating trigger:', error);
    }
  };

  const handleToggleTrigger = async (triggerId: string, enabled: boolean) => {
    try {
      await axios.put(
        `${API_URL}/automation/triggers/${triggerId}`,
        { enabled: !enabled },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await loadTriggers();
    } catch (error) {
      console.error('Error toggling trigger:', error);
    }
  };

  const handleDeleteTrigger = async (triggerId: string) => {
    if (!confirm('Delete this trigger?')) return;

    try {
      await axios.delete(`${API_URL}/automation/triggers/${triggerId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await loadTriggers();
    } catch (error) {
      console.error('Error deleting trigger:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      event: 'task_moved',
      enabled: true,
      conditionField: 'status',
      conditionOperator: 'changed_to',
      conditionValue: '',
      actionType: 'update_field',
      actionField: 'priority',
      actionValue: '',
    });
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-500" />
          <h3 className="text-lg font-semibold">Automation Triggers</h3>
        </div>
        <Button onClick={() => setShowCreateForm(!showCreateForm)} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          New Trigger
        </Button>
      </div>

      {showCreateForm && (
        <Card className="p-4 mb-6 bg-gray-50">
          <h4 className="font-semibold mb-4">Create Trigger</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <Input
                value={formData.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g., Auto-prioritize urgent tasks"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Event</label>
                <select
                  value={formData.event}
                  onChange={(e) =>
                    setFormData({ ...formData, event: e.target.value })
                  }
                  className="w-full p-2 border rounded"
                >
                  <option value="task_created">Task Created</option>
                  <option value="task_updated">Task Updated</option>
                  <option value="task_moved">Task Moved</option>
                  <option value="task_completed">Task Completed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Condition Field
                </label>
                <select
                  value={formData.conditionField}
                  onChange={(e) =>
                    setFormData({ ...formData, conditionField: e.target.value })
                  }
                  className="w-full p-2 border rounded"
                >
                  <option value="status">Status</option>
                  <option value="priority">Priority</option>
                  <option value="title">Title</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Condition
                </label>
                <select
                  value={formData.conditionOperator}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      conditionOperator: e.target.value,
                    })
                  }
                  className="w-full p-2 border rounded"
                >
                  <option value="equals">Equals</option>
                  <option value="contains">Contains</option>
                  <option value="changed_to">Changed To</option>
                  <option value="changed_from">Changed From</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Value</label>
                <Input
                  value={formData.conditionValue}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData({ ...formData, conditionValue: e.target.value })
                  }
                  placeholder="e.g., done, urgent"
                />
              </div>
            </div>

            <div className="border-t pt-4">
              <h5 className="font-medium mb-3">Action</h5>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Type</label>
                  <select
                    value={formData.actionType}
                    onChange={(e) =>
                      setFormData({ ...formData, actionType: e.target.value })
                    }
                    className="w-full p-2 border rounded"
                  >
                    <option value="update_field">Update Field</option>
                    <option value="assign_user">Assign User</option>
                    <option value="add_comment">Add Comment</option>
                    <option value="create_task">Create Task</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Field/Value
                  </label>
                  <Input
                    value={formData.actionValue}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData({ ...formData, actionValue: e.target.value })
                    }
                    placeholder="e.g., high, user-id"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleCreateTrigger}>Create Trigger</Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowCreateForm(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}

      <div className="space-y-3">
        {triggers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Zap className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p>No triggers yet. Create one to automate your workflow!</p>
          </div>
        ) : (
          triggers.map((trigger) => (
            <Card
              key={trigger.id}
              className={`p-4 ${
                trigger.enabled ? 'border-l-4 border-l-green-500' : 'opacity-60'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-medium">{trigger.name}</h4>
                    <span
                      className={`px-2 py-0.5 rounded text-xs ${
                        trigger.enabled
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {trigger.enabled ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    When <span className="font-medium">{trigger.event}</span>{' '}
                    {trigger.conditions.field && (
                      <>
                        and {trigger.conditions.field}{' '}
                        {trigger.conditions.operator} "
                        {trigger.conditions.value}"
                      </>
                    )}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    → {trigger.actions.length} action(s)
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      handleToggleTrigger(trigger.id, trigger.enabled)
                    }
                  >
                    {trigger.enabled ? (
                      <Power className="w-4 h-4 text-green-600" />
                    ) : (
                      <PowerOff className="w-4 h-4 text-gray-400" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteTrigger(trigger.id)}
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </Card>
  );
}
