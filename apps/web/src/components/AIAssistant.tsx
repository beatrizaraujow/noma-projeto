'use client';

import { useState } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2, Calendar, Tag, FileText, Lightbulb } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface AIAssistantProps {
  token: string;
  onSuggestionApply?: (data: any) => void;
}

interface TaskSuggestion {
  type: 'title' | 'dueDate' | 'description' | 'categorization';
  data: any;
}

export default function AIAssistant({ token, onSuggestionApply }: AIAssistantProps) {
  const [loading, setLoading] = useState(false);
  const [aiEnabled, setAiEnabled] = useState<boolean | null>(null);
  const [suggestions, setSuggestions] = useState<TaskSuggestion[]>([]);
  const [error, setError] = useState<string | null>(null);

  const checkAIStatus = async () => {
    try {
      const response = await axios.get(`${API_URL}/ai/status`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAiEnabled(response.data.enabled);
      if (!response.data.enabled) {
        setError(response.data.message);
      }
    } catch (err: any) {
      console.error('Error checking AI status:', err);
      setAiEnabled(false);
      setError('AI features unavailable');
    }
  };

  const suggestTitle = async (context: string, projectName?: string): Promise<string[] | null> => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.post(
        `${API_URL}/ai/suggest-title`,
        { context, projectName },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuggestions([
        {
          type: 'title',
          data: response.data.suggestions,
        },
      ]);

      return response.data.suggestions;
    } catch (err: any) {
      console.error('Error suggesting titles:', err);
      setError(err.response?.data?.message || 'Failed to generate suggestions');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const predictDueDate = async (
    taskTitle: string,
    taskDescription?: string,
    projectContext?: string
  ) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.post(
        `${API_URL}/ai/predict-due-date`,
        { taskTitle, taskDescription, projectContext },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuggestions([
        {
          type: 'dueDate',
          data: response.data,
        },
      ]);

      return response.data;
    } catch (err: any) {
      console.error('Error predicting due date:', err);
      setError(err.response?.data?.message || 'Failed to predict due date');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const enhanceDescription = async (title: string, currentDescription?: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.post(
        `${API_URL}/ai/enhance-description`,
        { title, currentDescription },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuggestions([
        {
          type: 'description',
          data: response.data,
        },
      ]);

      return response.data;
    } catch (err: any) {
      console.error('Error enhancing description:', err);
      setError(err.response?.data?.message || 'Failed to enhance description');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const categorizeTask = async (title: string, description?: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.post(
        `${API_URL}/ai/categorize-task`,
        { title, description },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuggestions([
        {
          type: 'categorization',
          data: response.data,
        },
      ]);

      return response.data;
    } catch (err: any) {
      console.error('Error categorizing task:', err);
      setError(err.response?.data?.message || 'Failed to categorize task');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const analyzeComplexity = async (title: string, description?: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.post(
        `${API_URL}/ai/analyze-complexity`,
        { title, description },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      return response.data;
    } catch (err: any) {
      console.error('Error analyzing complexity:', err);
      setError(err.response?.data?.message || 'Failed to analyze complexity');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    aiEnabled,
    suggestions,
    error,
    checkAIStatus,
    suggestTitle,
    predictDueDate,
    enhanceDescription,
    categorizeTask,
    analyzeComplexity,
  };
}

// Standalone AI suggestion button component
export function AIButton({
  onClick,
  loading,
  disabled,
  label = 'AI Assist',
  icon: Icon = Sparkles,
}: {
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
  label?: string;
  icon?: any;
}) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={onClick}
      disabled={disabled || loading}
      className="gap-2"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Icon className="h-4 w-4" />
      )}
      {label}
    </Button>
  );
}

// Title suggestions component
export function AITitleSuggestions({
  suggestions,
  onSelect,
}: {
  suggestions: string[];
  onSelect: (title: string) => void;
}) {
  if (suggestions.length === 0) return null;

  return (
    <div className="mt-2 space-y-2">
      <p className="text-sm font-medium text-gray-700">AI Suggestions:</p>
      <div className="space-y-1">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            type="button"
            onClick={() => onSelect(suggestion)}
            className="w-full text-left px-3 py-2 text-sm bg-blue-50 hover:bg-blue-100 rounded border border-blue-200 transition-colors"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}

// Due date prediction display
export function DueDatePrediction({
  prediction,
  onApply,
}: {
  prediction: {
    suggestedDate: string;
    confidence: number;
    reasoning: string;
  };
  onApply: (date: Date) => void;
}) {
  return (
    <div className="mt-2 p-3 bg-purple-50 border border-purple-200 rounded">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-900">
              Suggested Due Date
            </span>
          </div>
          <p className="text-sm text-gray-700">
            {new Date(prediction.suggestedDate).toLocaleDateString()}
          </p>
          <p className="text-xs text-gray-600 mt-1">{prediction.reasoning}</p>
          <p className="text-xs text-gray-500 mt-1">
            Confidence: {prediction.confidence}%
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          onClick={() => onApply(new Date(prediction.suggestedDate))}
        >
          Apply
        </Button>
      </div>
    </div>
  );
}

// Description enhancement display
export function DescriptionEnhancement({
  enhancement,
  onApply,
}: {
  enhancement: {
    enhancedDescription: string;
    suggestedSteps: string[];
    tags: string[];
  };
  onApply: (description: string) => void;
}) {
  return (
    <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded space-y-3">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <FileText className="h-4 w-4 text-green-600" />
          <span className="text-sm font-medium text-green-900">
            Enhanced Description
          </span>
        </div>
        <p className="text-sm text-gray-700">{enhancement.enhancedDescription}</p>
      </div>

      {enhancement.suggestedSteps.length > 0 && (
        <div>
          <p className="text-sm font-medium text-gray-700 mb-1">Suggested Steps:</p>
          <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
            {enhancement.suggestedSteps.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ol>
        </div>
      )}

      {enhancement.tags.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Tag className="h-3 w-3 text-gray-600" />
            <span className="text-xs font-medium text-gray-700">Suggested Tags:</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {enhancement.tags.map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      <Button
        type="button"
        size="sm"
        onClick={() => onApply(enhancement.enhancedDescription)}
        className="w-full"
      >
        Apply Enhancement
      </Button>
    </div>
  );
}

// Categorization display
export function TaskCategorization({
  categorization,
  onApply,
}: {
  categorization: {
    category: string;
    priority: string;
    tags: string[];
    confidence: number;
  };
  onApply: (data: { category: string; priority: string; tags: string[] }) => void;
}) {
  return (
    <div className="mt-2 p-3 bg-orange-50 border border-orange-200 rounded">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-orange-600" />
          <span className="text-sm font-medium text-orange-900">AI Categorization</span>
        </div>
        <span className="text-xs text-gray-500">{categorization.confidence}% confidence</span>
      </div>

      <div className="space-y-2 text-sm">
        <div>
          <span className="font-medium text-gray-700">Category: </span>
          <span className="text-gray-600">{categorization.category}</span>
        </div>
        <div>
          <span className="font-medium text-gray-700">Priority: </span>
          <span
            className={`px-2 py-0.5 rounded text-xs ${
              categorization.priority === 'URGENT'
                ? 'bg-red-100 text-red-700'
                : categorization.priority === 'HIGH'
                ? 'bg-orange-100 text-orange-700'
                : categorization.priority === 'MEDIUM'
                ? 'bg-yellow-100 text-yellow-700'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            {categorization.priority}
          </span>
        </div>
        {categorization.tags.length > 0 && (
          <div>
            <span className="font-medium text-gray-700">Tags: </span>
            <div className="flex flex-wrap gap-1 mt-1">
              {categorization.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <Button
        type="button"
        size="sm"
        onClick={() => onApply(categorization)}
        className="w-full mt-3"
      >
        Apply Suggestions
      </Button>
    </div>
  );
}
