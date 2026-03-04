'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@nexora/ui/components/button';
import { Card } from '@nexora/ui/components/card';
import { Input } from '@nexora/ui/components/input';
import { UserPlus, Plus, Trash2, Users, ArrowRight } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface AutoAssignRule {
  id: string;
  name: string;
  enabled: boolean;
  priority: number;
  conditions: any;
  assignTo: any;
}

interface AutoAssignRulesProps {
  workspaceId: string;
  projectId?: string;
  token: string;
}

export default function AutoAssignRules({
  workspaceId,
  projectId,
  token,
}: AutoAssignRulesProps) {
  const [rules, setRules] = useState<AutoAssignRule[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    enabled: true,
    priority: 1,
    taskTitle: '',
    taskPriority: '',
    keywords: '',
    assignType: 'specific_user',
    userIds: '',
  });

  useEffect(() => {
    loadRules();
  }, [workspaceId, projectId]);

  const loadRules = async () => {
    try {
      const response = await axios.get(`${API_URL}/automation/auto-assign-rules`, {
        params: { workspaceId, projectId },
        headers: { Authorization: `Bearer ${token}` },
      });
      setRules(response.data);
    } catch (error) {
      console.error('Error loading rules:', error);
    }
  };

  const handleCreate = async () => {
    try {
      await axios.post(
        `${API_URL}/automation/auto-assign-rules`,
        {
          workspaceId,
          projectId,
          name: formData.name,
          enabled: formData.enabled,
          priority: formData.priority,
          conditions: {
            taskTitle: formData.taskTitle || undefined,
            taskPriority: formData.taskPriority || undefined,
            keywords: formData.keywords
              ? formData.keywords.split(',').map((k) => k.trim())
              : undefined,
          },
          assignTo: {
            type: formData.assignType,
            userIds: formData.userIds
              ? formData.userIds.split(',').map((id) => id.trim())
              : undefined,
          },
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      await loadRules();
      setShowCreateForm(false);
      resetForm();
    } catch (error) {
      console.error('Error creating rule:', error);
    }
  };

  const handleDelete = async (ruleId: string) => {
    if (!confirm('Delete this rule?')) return;

    try {
      await axios.delete(`${API_URL}/automation/auto-assign-rules/${ruleId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await loadRules();
    } catch (error) {
      console.error('Error deleting rule:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      enabled: true,
      priority: 1,
      taskTitle: '',
      taskPriority: '',
      keywords: '',
      assignType: 'specific_user',
      userIds: '',
    });
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <UserPlus className="w-5 h-5 text-green-500" />
          <h3 className="text-lg font-semibold">Auto-Assign Rules</h3>
        </div>
        <Button onClick={() => setShowCreateForm(!showCreateForm)} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          New Rule
        </Button>
      </div>

      {showCreateForm && (
        <Card className="p-4 mb-6 bg-gray-50">
          <h4 className="font-semibold mb-4">Create Auto-Assign Rule</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Rule Name</label>
              <Input
                value={formData.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g., Assign bugs to QA team"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Priority (1-10)</label>
              <Input
                type="number"
                min="1"
                max="10"
                value={formData.priority}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData({ ...formData, priority: parseInt(e.target.value) })
                }
              />
              <p className="text-xs text-gray-500 mt-1">
                Higher priority rules are evaluated first
              </p>
            </div>

            <div className="border-t pt-4">
              <h5 className="font-medium mb-3">Conditions</h5>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Task Title Contains
                  </label>
                  <Input
                    value={formData.taskTitle}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData({ ...formData, taskTitle: e.target.value })
                    }
                    placeholder="e.g., bug, urgent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Task Priority
                  </label>
                  <select
                    value={formData.taskPriority}
                    onChange={(e) =>
                      setFormData({ ...formData, taskPriority: e.target.value })
                    }
                    className="w-full p-2 border rounded"
                  >
                    <option value="">Any</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Keywords (comma-separated)
                  </label>
                  <Input
                    value={formData.keywords}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData({ ...formData, keywords: e.target.value })
                    }
                    placeholder="e.g., bug, critical, frontend"
                  />
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h5 className="font-medium mb-3">Assignment</h5>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Assignment Type
                  </label>
                  <select
                    value={formData.assignType}
                    onChange={(e) =>
                      setFormData({ ...formData, assignType: e.target.value })
                    }
                    className="w-full p-2 border rounded"
                  >
                    <option value="specific_user">Specific User</option>
                    <option value="round_robin">Round Robin</option>
                    <option value="least_busy">Least Busy</option>
                    <option value="random">Random</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    User IDs (comma-separated)
                  </label>
                  <Input
                    value={formData.userIds}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData({ ...formData, userIds: e.target.value })
                    }
                    placeholder="user-id-1, user-id-2, user-id-3"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleCreate}>Create Rule</Button>
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
        {rules.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p>No auto-assign rules yet. Create one to automatically assign tasks!</p>
          </div>
        ) : (
          rules
            .sort((a, b) => b.priority - a.priority)
            .map((rule) => (
              <Card
                key={rule.id}
                className={`p-4 ${
                  rule.enabled ? 'border-l-4 border-l-green-500' : 'opacity-60'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium">{rule.name}</h4>
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                        Priority: {rule.priority}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-xs ${
                          rule.enabled
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {rule.enabled ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span>
                        {Object.keys(rule.conditions).length} condition(s)
                      </span>
                      <ArrowRight className="w-4 h-4" />
                      <span className="font-medium">{rule.assignTo.type}</span>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(rule.id)}
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </div>
              </Card>
            ))
        )}
      </div>
    </Card>
  );
}
