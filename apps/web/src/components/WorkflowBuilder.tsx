'use client';

import React, { useState, useCallback } from 'react';
import axios from 'axios';
import { Button } from '@nexora/ui/components/button';
import { Card } from '@nexora/ui/components/card';
import { Input } from '@nexora/ui/components/input';
import { Label } from '@nexora/ui/components/label';
import {
  Workflow,
  Plus,
  Trash2,
  Play,
  Save,
  GitBranch,
  Clock,
  Webhook,
  Bell,
  Zap,
  Loader2,
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface WorkflowBuilderProps {
  workspaceId: string;
  token: string;
  onSave?: (workflow: any) => void;
}

interface WorkflowStep {
  id: string;
  name: string;
  type: string;
  config: any;
  position: number;
  parentId?: string | null;
  nextStepId?: string | null;
}

export default function WorkflowBuilder({
  workspaceId,
  token,
  onSave,
}: WorkflowBuilderProps) {
  const [loading, setLoading] = useState(false);
  const [workflow, setWorkflow] = useState({
    name: '',
    description: '',
    icon: 'Zap',
    color: '#3b82f6',
    trigger: { type: 'manual' },
  });
  const [steps, setSteps] = useState<WorkflowStep[]>([]);
  const [selectedStep, setSelectedStep] = useState<WorkflowStep | null>(null);

  const stepTypes = [
    { value: 'action', label: 'Action', icon: Zap },
    { value: 'condition', label: 'Condition', icon: GitBranch },
    { value: 'loop', label: 'Loop', icon: Clock },
    { value: 'webhook', label: 'Webhook', icon: Webhook },
    { value: 'notification', label: 'Notification', icon: Bell },
    { value: 'delay', label: 'Delay', icon: Clock },
  ];

  const addStep = useCallback((type: string) => {
    const newStep: WorkflowStep = {
      id: `step_${Date.now()}`,
      name: `New ${type}`,
      type,
      config: getDefaultConfig(type),
      position: steps.length,
      parentId: null,
      nextStepId: null,
    };
    setSteps([...steps, newStep]);
    setSelectedStep(newStep);
  }, [steps]);

  const getDefaultConfig = (type: string): any => {
    switch (type) {
      case 'action':
        return { actionType: 'create_task', title: '', description: '' };
      case 'condition':
        return { operator: 'equals', left: '', right: '' };
      case 'loop':
        return { items: [], variableName: 'item' };
      case 'webhook':
        return { url: '', method: 'POST', headers: {}, body: {} };
      case 'notification':
        return { title: '', message: '', userId: '' };
      case 'delay':
        return { duration: 1000 };
      default:
        return {};
    }
  };

  const updateStep = useCallback((stepId: string, updates: Partial<WorkflowStep>) => {
    setSteps(steps.map((s) => (s.id === stepId ? { ...s, ...updates } : s)));
    if (selectedStep?.id === stepId) {
      setSelectedStep({ ...selectedStep, ...updates });
    }
  }, [steps, selectedStep]);

  const deleteStep = useCallback((stepId: string) => {
    setSteps(steps.filter((s) => s.id !== stepId));
    if (selectedStep?.id === stepId) {
      setSelectedStep(null);
    }
  }, [steps, selectedStep]);

  const handleSave = async () => {
    if (!workflow.name) {
      alert('Please enter a workflow name');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(
        `${API_URL}/workflows`,
        {
          workspaceId,
          ...workflow,
          steps: steps.map((s) => ({ ...s, id: undefined })),
          createdBy: 'current-user-id', // Replace with actual user ID
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      alert('Workflow saved successfully!');
      onSave?.(response.data);
    } catch (error: any) {
      alert(error?.response?.data?.message || 'Error saving workflow');
    } finally {
      setLoading(false);
    }
  };

  const handleTest = async () => {
    try {
      setLoading(true);
      alert('Test execution not yet implemented');
    } catch (error: any) {
      alert(error?.response?.data?.message || 'Error testing workflow');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Workflow className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold">Workflow Builder</h2>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleTest} disabled={loading}>
              <Play className="w-4 h-4 mr-2" />
              Test
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save Workflow
            </Button>
          </div>
        </div>

        {/* Workflow Settings */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Workflow Name</Label>
            <Input
              value={workflow.name}
              onChange={(e) => setWorkflow({ ...workflow, name: e.target.value })}
              placeholder="e.g., Onboard New Tasks"
            />
          </div>
          <div>
            <Label>Description</Label>
            <Input
              value={workflow.description}
              onChange={(e) => setWorkflow({ ...workflow, description: e.target.value })}
              placeholder="What does this workflow do?"
            />
          </div>
          <div>
            <Label>Trigger Type</Label>
            <select
              value={workflow.trigger.type}
              onChange={(e) =>
                setWorkflow({
                  ...workflow,
                  trigger: { ...workflow.trigger, type: e.target.value },
                })
              }
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="manual">Manual</option>
              <option value="webhook">Webhook</option>
              <option value="scheduled">Scheduled</option>
              <option value="event">Event</option>
            </select>
          </div>
          <div>
            <Label>Color</Label>
            <input
              type="color"
              value={workflow.color}
              onChange={(e) => setWorkflow({ ...workflow, color: e.target.value })}
              className="w-full h-10 border rounded-md"
            />
          </div>
        </div>
      </Card>

      {/* Canvas */}
      <div className="grid grid-cols-12 gap-6">
        {/* Steps Palette */}
        <Card className="col-span-3 p-4">
          <h3 className="font-semibold mb-4">Add Steps</h3>
          <div className="space-y-2">
            {stepTypes.map((type) => (
              <Button
                key={type.value}
                variant="outline"
                className="w-full justify-start"
                onClick={() => addStep(type.value)}
              >
                <type.icon className="w-4 h-4 mr-2" />
                {type.label}
              </Button>
            ))}
          </div>
        </Card>

        {/* Workflow Canvas */}
        <Card className="col-span-6 p-6 min-h-[600px]">
          <h3 className="font-semibold mb-4">Workflow Steps</h3>
          {steps.length === 0 ? (
            <div className="flex items-center justify-center h-[500px] text-gray-400">
              <div className="text-center">
                <Workflow className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <p>No steps yet. Add steps from the left panel.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {steps.map((step, index) => {
                const StepIcon = stepTypes.find((t) => t.value === step.type)?.icon || Zap;
                return (
                  <div
                    key={step.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedStep?.id === step.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedStep(step)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <StepIcon className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium">{step.name}</div>
                          <div className="text-sm text-gray-500 capitalize">{step.type}</div>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteStep(step.id);
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Step Configuration */}
        <Card className="col-span-3 p-4">
          <h3 className="font-semibold mb-4">Step Configuration</h3>
          {selectedStep ? (
            <div className="space-y-4">
              <div>
                <Label>Step Name</Label>
                <Input
                  value={selectedStep.name}
                  onChange={(e) => updateStep(selectedStep.id, { name: e.target.value })}
                />
              </div>

              <div>
                <Label>Type</Label>
                <Input value={selectedStep.type} disabled className="bg-gray-50" />
              </div>

              {/* Action Config */}
              {selectedStep.type === 'action' && (
                <>
                  <div>
                    <Label>Action Type</Label>
                    <select
                      value={selectedStep.config.actionType}
                      onChange={(e) =>
                        updateStep(selectedStep.id, {
                          config: { ...selectedStep.config, actionType: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 border rounded-md"
                    >
                      <option value="create_task">Create Task</option>
                      <option value="update_task">Update Task</option>
                      <option value="delete_task">Delete Task</option>
                      <option value="set_variable">Set Variable</option>
                    </select>
                  </div>
                  <div>
                    <Label>Title</Label>
                    <Input
                      value={selectedStep.config.title || ''}
                      onChange={(e) =>
                        updateStep(selectedStep.id, {
                          config: { ...selectedStep.config, title: e.target.value },
                        })
                      }
                      placeholder="Use {{variables}}"
                    />
                  </div>
                </>
              )}

              {/* Condition Config */}
              {selectedStep.type === 'condition' && (
                <>
                  <div>
                    <Label>Left Value</Label>
                    <Input
                      value={selectedStep.config.left}
                      onChange={(e) =>
                        updateStep(selectedStep.id, {
                          config: { ...selectedStep.config, left: e.target.value },
                        })
                      }
                      placeholder="{{variable}}"
                    />
                  </div>
                  <div>
                    <Label>Operator</Label>
                    <select
                      value={selectedStep.config.operator}
                      onChange={(e) =>
                        updateStep(selectedStep.id, {
                          config: { ...selectedStep.config, operator: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 border rounded-md"
                    >
                      <option value="equals">Equals</option>
                      <option value="not_equals">Not Equals</option>
                      <option value="greater_than">Greater Than</option>
                      <option value="less_than">Less Than</option>
                      <option value="contains">Contains</option>
                      <option value="not_contains">Not Contains</option>
                    </select>
                  </div>
                  <div>
                    <Label>Right Value</Label>
                    <Input
                      value={selectedStep.config.right}
                      onChange={(e) =>
                        updateStep(selectedStep.id, {
                          config: { ...selectedStep.config, right: e.target.value },
                        })
                      }
                      placeholder="Value to compare"
                    />
                  </div>
                </>
              )}

              {/* Webhook Config */}
              {selectedStep.type === 'webhook' && (
                <>
                  <div>
                    <Label>URL</Label>
                    <Input
                      value={selectedStep.config.url}
                      onChange={(e) =>
                        updateStep(selectedStep.id, {
                          config: { ...selectedStep.config, url: e.target.value },
                        })
                      }
                      placeholder="https://api.example.com/endpoint"
                    />
                  </div>
                  <div>
                    <Label>Method</Label>
                    <select
                      value={selectedStep.config.method}
                      onChange={(e) =>
                        updateStep(selectedStep.id, {
                          config: { ...selectedStep.config, method: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 border rounded-md"
                    >
                      <option value="GET">GET</option>
                      <option value="POST">POST</option>
                      <option value="PUT">PUT</option>
                      <option value="DELETE">DELETE</option>
                    </select>
                  </div>
                </>
              )}

              {/* Delay Config */}
              {selectedStep.type === 'delay' && (
                <div>
                  <Label>Duration (ms)</Label>
                  <Input
                    type="number"
                    value={selectedStep.config.duration}
                    onChange={(e) =>
                      updateStep(selectedStep.id, {
                        config: { ...selectedStep.config, duration: parseInt(e.target.value) },
                      })
                    }
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-gray-400 py-8">
              <p>Select a step to configure</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
