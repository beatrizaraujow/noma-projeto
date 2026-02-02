'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@nexora/ui/components/button';
import { Card } from '@nexora/ui/components/card';
import { Input } from '@nexora/ui/components/input';
import { Repeat, Plus, Trash2, Calendar, Clock } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface RecurringTask {
  id: string;
  title: string;
  description?: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number;
  enabled: boolean;
  startDate: Date;
  endDate?: Date;
}

interface RecurringTasksProps {
  projectId: string;
  token: string;
}

export default function RecurringTasks({ projectId, token }: RecurringTasksProps) {
  const [tasks, setTasks] = useState<RecurringTask[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    frequency: 'weekly' as const,
    interval: 1,
    dayOfWeek: 1,
    startDate: new Date().toISOString().split('T')[0],
    priority: 'medium',
    status: 'todo',
  });

  useEffect(() => {
    loadRecurringTasks();
  }, [projectId]);

  const loadRecurringTasks = async () => {
    try {
      const response = await axios.get(`${API_URL}/automation/recurring-tasks`, {
        params: { projectId },
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(response.data);
    } catch (error) {
      console.error('Error loading recurring tasks:', error);
    }
  };

  const handleCreate = async () => {
    try {
      await axios.post(
        `${API_URL}/automation/recurring-tasks`,
        {
          projectId,
          title: formData.title,
          description: formData.description,
          frequency: formData.frequency,
          interval: formData.interval,
          dayOfWeek: formData.dayOfWeek,
          startDate: new Date(formData.startDate),
          enabled: true,
          taskTemplate: {
            priority: formData.priority,
            status: formData.status,
          },
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      await loadRecurringTasks();
      setShowCreateForm(false);
      resetForm();
    } catch (error) {
      console.error('Error creating recurring task:', error);
    }
  };

  const handleDelete = async (taskId: string) => {
    if (!confirm('Delete this recurring task?')) return;

    try {
      await axios.delete(`${API_URL}/automation/recurring-tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await loadRecurringTasks();
    } catch (error) {
      console.error('Error deleting recurring task:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      frequency: 'weekly',
      interval: 1,
      dayOfWeek: 1,
      startDate: new Date().toISOString().split('T')[0],
      priority: 'medium',
      status: 'todo',
    });
  };

  const getFrequencyLabel = (frequency: string, interval: number) => {
    const labels = {
      daily: interval === 1 ? 'Daily' : `Every ${interval} days`,
      weekly: interval === 1 ? 'Weekly' : `Every ${interval} weeks`,
      monthly: interval === 1 ? 'Monthly' : `Every ${interval} months`,
      yearly: interval === 1 ? 'Yearly' : `Every ${interval} years`,
    };
    return labels[frequency as keyof typeof labels];
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Repeat className="w-5 h-5 text-blue-500" />
          <h3 className="text-lg font-semibold">Recurring Tasks</h3>
        </div>
        <Button onClick={() => setShowCreateForm(!showCreateForm)} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          New Recurring Task
        </Button>
      </div>

      {showCreateForm && (
        <Card className="p-4 mb-6 bg-gray-50">
          <h4 className="font-semibold mb-4">Create Recurring Task</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Task Title</label>
              <Input
                value={formData.title}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="e.g., Weekly team standup"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Task description..."
                className="w-full p-2 border rounded min-h-[80px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Frequency</label>
                <select
                  value={formData.frequency}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      frequency: e.target.value as any,
                    })
                  }
                  className="w-full p-2 border rounded"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Interval</label>
                <Input
                  type="number"
                  min="1"
                  value={formData.interval}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData({ ...formData, interval: parseInt(e.target.value) })
                  }
                />
              </div>
            </div>

            {formData.frequency === 'weekly' && (
              <div>
                <label className="block text-sm font-medium mb-1">Day of Week</label>
                <select
                  value={formData.dayOfWeek}
                  onChange={(e) =>
                    setFormData({ ...formData, dayOfWeek: parseInt(e.target.value) })
                  }
                  className="w-full p-2 border rounded"
                >
                  <option value="0">Sunday</option>
                  <option value="1">Monday</option>
                  <option value="2">Tuesday</option>
                  <option value="3">Wednesday</option>
                  <option value="4">Thursday</option>
                  <option value="5">Friday</option>
                  <option value="6">Saturday</option>
                </select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) =>
                    setFormData({ ...formData, priority: e.target.value })
                  }
                  className="w-full p-2 border rounded"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Start Date</label>
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData({ ...formData, startDate: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleCreate}>Create</Button>
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
        {tasks.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Repeat className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p>No recurring tasks yet. Create one to automate task creation!</p>
          </div>
        ) : (
          tasks.map((task) => (
            <Card
              key={task.id}
              className={`p-4 ${
                task.enabled ? 'border-l-4 border-l-blue-500' : 'opacity-60'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium mb-1">{task.title}</h4>
                  {task.description && (
                    <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                  )}
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {getFrequencyLabel(task.frequency, task.interval)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Starts: {new Date(task.startDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(task.id)}
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
