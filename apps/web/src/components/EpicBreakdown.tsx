'use client';

import React, { useState } from 'react';
import axios from 'axios';
import { Button } from '@nexora/ui/components/button';
import { Card } from '@nexora/ui/components/card';
import { Input } from '@nexora/ui/components/input';
import { Sparkles, GitBranch, Loader2, Clock, AlertTriangle } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface Subtask {
  title: string;
  description: string;
  estimatedHours: number;
  dependencies: string[];
}

interface EpicBreakdownData {
  subtasks: Subtask[];
  timeline: string;
  risks: string[];
}

interface EpicBreakdownProps {
  token: string;
  projectContext?: string;
  onSubtasksGenerated?: (subtasks: Subtask[]) => void;
}

export default function EpicBreakdown({
  token,
  projectContext,
  onSubtasksGenerated,
}: EpicBreakdownProps) {
  const [epicTitle, setEpicTitle] = useState('');
  const [epicDescription, setEpicDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [breakdown, setBreakdown] = useState<EpicBreakdownData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const breakdownEpic = async () => {
    if (!epicTitle.trim()) {
      setError('Please enter an epic title');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await axios.post(
        `${API_URL}/ai/breakdown-epic`,
        {
          epicTitle,
          epicDescription,
          projectContext,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setBreakdown(response.data);
      if (onSubtasksGenerated && response.data.subtasks) {
        onSubtasksGenerated(response.data.subtasks);
      }
    } catch (err: any) {
      console.error('Error breaking down epic:', err);
      setError(err.response?.data?.message || 'Failed to break down epic');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <GitBranch className="w-5 h-5 text-purple-500" />
        <h3 className="text-lg font-semibold">Smart Epic Breakdown</h3>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Epic Title
          </label>
          <Input
            value={epicTitle}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEpicTitle(e.target.value)}
            placeholder="e.g., Implement user authentication system"
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Epic Description
          </label>
          <textarea
            value={epicDescription}
            onChange={(e) => setEpicDescription(e.target.value)}
            placeholder="Describe the epic in detail..."
            className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
          />
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <Button
          onClick={breakdownEpic}
          disabled={loading || !epicTitle.trim()}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Breaking Down...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Break Down Epic
            </>
          )}
        </Button>

        {breakdown && (
          <div className="mt-6 space-y-6">
            {/* Timeline */}
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Timeline
              </h4>
              <p className="text-gray-700">{breakdown.timeline}</p>
            </div>

            {/* Subtasks */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">
                Subtasks ({breakdown.subtasks.length})
              </h4>
              <div className="space-y-3">
                {breakdown.subtasks.map((subtask, idx) => (
                  <Card key={idx} className="p-4 border-l-4 border-purple-500">
                    <div className="flex items-start justify-between mb-2">
                      <h5 className="font-medium text-gray-900">
                        {idx + 1}. {subtask.title}
                      </h5>
                      <span className="px-2 py-1 bg-gray-100 rounded text-xs font-medium text-gray-700">
                        ~{subtask.estimatedHours}h
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {subtask.description}
                    </p>
                    {subtask.dependencies.length > 0 && (
                      <div className="text-xs text-gray-500">
                        <span className="font-medium">Dependencies:</span>{' '}
                        {subtask.dependencies.join(', ')}
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </div>

            {/* Risks */}
            {breakdown.risks.length > 0 && (
              <div className="p-4 bg-yellow-50 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-600" />
                  Potential Risks
                </h4>
                <ul className="space-y-1">
                  {breakdown.risks.map((risk, idx) => (
                    <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                      <span className="text-yellow-600 mt-1">•</span>
                      <span>{risk}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
