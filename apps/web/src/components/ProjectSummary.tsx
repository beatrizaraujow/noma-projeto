'use client';

import React, { useState } from 'react';
import axios from 'axios';
import { Button } from '@nexora/ui/components/button';
import { Card } from '@nexora/ui/components/card';
import { Sparkles, TrendingUp, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface ProjectSummaryData {
  overview: string;
  progress: string;
  keyMetrics: {
    totalTasks: number;
    completedTasks: number;
    activeTasks: number;
  };
  insights: string[];
  recommendations: string[];
}

interface ProjectSummaryProps {
  projectId: string;
  projectName: string;
  projectDescription?: string;
  tasks: { title: string; status: string; priority?: string }[];
  token: string;
}

export default function ProjectSummary({
  projectId,
  projectName,
  projectDescription,
  tasks,
  token,
}: ProjectSummaryProps) {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<ProjectSummaryData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateSummary = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.post(
        `${API_URL}/ai/summarize-project`,
        {
          name: projectName,
          description: projectDescription,
          tasks: tasks.map(t => ({
            title: t.title,
            status: t.status,
            priority: t.priority,
          })),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSummary(response.data);
    } catch (err: any) {
      console.error('Error generating summary:', err);
      setError(err.response?.data?.message || 'Failed to generate project summary');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-500" />
          <h3 className="text-lg font-semibold">AI Project Summary</h3>
        </div>
        <Button
          onClick={generateSummary}
          disabled={loading}
          variant="outline"
          size="sm"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Summary
            </>
          )}
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {summary && (
        <div className="space-y-6">
          {/* Overview */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Overview</h4>
            <p className="text-gray-700">{summary.overview}</p>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-700">
                {summary.keyMetrics.totalTasks}
              </div>
              <div className="text-sm text-blue-600">Total Tasks</div>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-700">
                {summary.keyMetrics.completedTasks}
              </div>
              <div className="text-sm text-green-600">Completed</div>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-700">
                {summary.keyMetrics.activeTasks}
              </div>
              <div className="text-sm text-purple-600">Active</div>
            </div>
          </div>

          {/* Progress */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Progress Analysis
            </h4>
            <p className="text-gray-700">{summary.progress}</p>
          </div>

          {/* Insights */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Key Insights
            </h4>
            <ul className="space-y-2">
              {summary.insights.map((insight, idx) => (
                <li key={idx} className="flex items-start gap-2 text-gray-700">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>{insight}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Recommendations */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Recommendations
            </h4>
            <ul className="space-y-2">
              {summary.recommendations.map((rec, idx) => (
                <li key={idx} className="flex items-start gap-2 text-gray-700">
                  <span className="text-green-500 mt-1">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {!summary && !loading && !error && (
        <div className="text-center py-8 text-gray-500">
          <Sparkles className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p>Click "Generate Summary" to get AI-powered insights about this project</p>
        </div>
      )}
    </Card>
  );
}
