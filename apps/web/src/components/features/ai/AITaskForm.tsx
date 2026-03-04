'use client';

import { useState, useEffect } from 'react';
import { Button } from '@nexora/ui/components/button';
import { Input } from '@nexora/ui/components/input';
import { Label } from '@nexora/ui/components/label';
import { Card } from '@nexora/ui/components/card';
import AIAssistant, {
  AIButton,
  AITitleSuggestions,
  DueDatePrediction,
  DescriptionEnhancement,
  TaskCategorization,
} from './AIAssistant';
import { Sparkles, X } from 'lucide-react';

interface AITaskFormProps {
  token: string;
  projectName?: string;
  projectId?: string;
  onSubmit: (taskData: any) => void;
  onCancel: () => void;
}

export default function AITaskForm({
  token,
  projectName,
  projectId,
  onSubmit,
  onCancel,
}: AITaskFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
    dueDate: '',
    status: 'TODO',
  });

  const [showAISuggestions, setShowAISuggestions] = useState({
    title: false,
    dueDate: false,
    description: false,
    categorization: false,
  });

  const {
    loading,
    aiEnabled,
    suggestions,
    error,
    checkAIStatus,
    suggestTitle,
    predictDueDate,
    enhanceDescription,
    categorizeTask,
  } = AIAssistant({ token });

  const [titleSuggestions, setTitleSuggestions] = useState<string[]>([]);
  const [dueDatePrediction, setDueDatePrediction] = useState<any>(null);
  const [descriptionEnhancement, setDescriptionEnhancement] = useState<any>(null);
  const [categorization, setCategorization] = useState<any>(null);

  useEffect(() => {
    checkAIStatus();
  }, []);

  const handleTitleAIAssist = async () => {
    if (!formData.title) {
      alert('Please enter some text to get suggestions');
      return;
    }

    const titleSuggestions = await suggestTitle(formData.title, projectName);
    if (titleSuggestions && titleSuggestions.length > 0) {
      setFormData({ ...formData, title: titleSuggestions[0] });
    }
  };

  const handleDueDateAIAssist = async () => {
    if (!formData.title) {
      alert('Please enter a task title first');
      return;
    }

    const prediction = await predictDueDate(
      formData.title,
      formData.description,
      projectName
    );
    if (prediction) {
      setDueDatePrediction(prediction);
      setShowAISuggestions({ ...showAISuggestions, dueDate: true });
    }
  };

  const handleDescriptionAIAssist = async () => {
    if (!formData.title) {
      alert('Please enter a task title first');
      return;
    }

    const enhancement = await enhanceDescription(formData.title, formData.description);
    if (enhancement) {
      setDescriptionEnhancement(enhancement);
      setShowAISuggestions({ ...showAISuggestions, description: true });
    }
  };

  const handleCategorizeAIAssist = async () => {
    if (!formData.title) {
      alert('Please enter a task title first');
      return;
    }

    const result = await categorizeTask(formData.title, formData.description);
    if (result) {
      setCategorization(result);
      setShowAISuggestions({ ...showAISuggestions, categorization: true });
    }
  };

  const applyTitleSuggestion = (title: string) => {
    setFormData({ ...formData, title });
    setShowAISuggestions({ ...showAISuggestions, title: false });
  };

  const applyDueDatePrediction = (date: Date) => {
    setFormData({ ...formData, dueDate: date.toISOString().split('T')[0] });
    setShowAISuggestions({ ...showAISuggestions, dueDate: false });
  };

  const applyDescriptionEnhancement = (description: string) => {
    setFormData({ ...formData, description });
    setShowAISuggestions({ ...showAISuggestions, description: false });
  };

  const applyCategorization = (data: any) => {
    setFormData({ ...formData, priority: data.priority });
    setShowAISuggestions({ ...showAISuggestions, categorization: false });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ ...formData, projectId });
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Create New Task</h2>
        {aiEnabled && (
          <div className="flex items-center gap-2 text-sm text-blue-600">
            <Sparkles className="h-4 w-4" />
            <span>AI Assist Enabled</span>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title Field with AI */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label htmlFor="title">Task Title *</Label>
            {aiEnabled && (
              <AIButton
                onClick={handleTitleAIAssist}
                loading={loading}
                label="Suggest Title"
              />
            )}
          </div>
          <Input
            id="title"
            value={formData.title}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Enter task title..."
            required
          />
          {showAISuggestions.title && titleSuggestions.length > 0 && (
            <AITitleSuggestions
              suggestions={titleSuggestions}
              onSelect={applyTitleSuggestion}
            />
          )}
        </div>

        {/* Description Field with AI */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label htmlFor="description">Description</Label>
            {aiEnabled && formData.title && (
              <AIButton
                onClick={handleDescriptionAIAssist}
                loading={loading}
                label="Enhance Description"
              />
            )}
          </div>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Enter task description..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={4}
          />
          {showAISuggestions.description && descriptionEnhancement && (
            <DescriptionEnhancement
              enhancement={descriptionEnhancement}
              onApply={applyDescriptionEnhancement}
            />
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Priority Field with AI */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="priority">Priority</Label>
              {aiEnabled && formData.title && (
                <AIButton
                  onClick={handleCategorizeAIAssist}
                  loading={loading}
                  label="Auto-categorize"
                  icon={Sparkles}
                />
              )}
            </div>
            <select
              id="priority"
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>

          {/* Due Date Field with AI */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="dueDate">Due Date</Label>
              {aiEnabled && formData.title && (
                <AIButton
                  onClick={handleDueDateAIAssist}
                  loading={loading}
                  label="Predict Date"
                />
              )}
            </div>
            <Input
              id="dueDate"
              type="date"
              value={formData.dueDate}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, dueDate: e.target.value })}
            />
            {showAISuggestions.dueDate && dueDatePrediction && (
              <DueDatePrediction
                prediction={dueDatePrediction}
                onApply={applyDueDatePrediction}
              />
            )}
          </div>
        </div>

        {/* Status Field */}
        <div>
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="TODO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="DONE">Done</option>
          </select>
        </div>

        {/* AI Categorization Display */}
        {showAISuggestions.categorization && categorization && (
          <TaskCategorization
            categorization={categorization}
            onApply={applyCategorization}
          />
        )}

        {/* Form Actions */}
        <div className="flex gap-3 pt-4">
          <Button type="submit" className="flex-1">
            Create Task
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>

      {!aiEnabled && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
          <p className="font-medium">AI features are disabled</p>
          <p className="text-xs mt-1">
            Configure OPENAI_API_KEY in your environment to enable AI-powered task
            assistance.
          </p>
        </div>
      )}
    </Card>
  );
}
