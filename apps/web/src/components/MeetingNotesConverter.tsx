'use client';

import React, { useState } from 'react';
import axios from 'axios';
import { Button } from '@nexora/ui/components/button';
import { Card } from '@nexora/ui/components/card';
import { Sparkles, FileText, Loader2, CheckCircle } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface MeetingTask {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  assignee?: string;
  dueDate?: string;
}

interface MeetingNotesConverterProps {
  token: string;
  onTasksGenerated?: (tasks: MeetingTask[]) => void;
}

export default function MeetingNotesConverter({
  token,
  onTasksGenerated,
}: MeetingNotesConverterProps) {
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [tasks, setTasks] = useState<MeetingTask[]>([]);
  const [error, setError] = useState<string | null>(null);

  const convertNotes = async () => {
    if (!notes.trim()) {
      setError('Please enter meeting notes');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await axios.post(
        `${API_URL}/ai/meeting-to-tasks`,
        { meetingNotes: notes },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setTasks(response.data.tasks);
      if (onTasksGenerated) {
        onTasksGenerated(response.data.tasks);
      }
    } catch (err: any) {
      console.error('Error converting notes:', err);
      setError(err.response?.data?.message || 'Failed to convert meeting notes');
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-blue-100 text-blue-700';
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <FileText className="w-5 h-5 text-purple-500" />
        <h3 className="text-lg font-semibold">Meeting Notes → Tasks</h3>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Meeting Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Paste your meeting notes here...

Example:
- John will implement the login feature by Friday
- Sarah needs to review the API documentation
- We decided to use PostgreSQL for the database
- Design team will provide mockups by EOW"
            className="w-full h-48 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
          />
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <Button
          onClick={convertNotes}
          disabled={loading || !notes.trim()}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Converting...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Convert to Tasks
            </>
          )}
        </Button>

        {tasks.length > 0 && (
          <div className="mt-6">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Generated Tasks ({tasks.length})
            </h4>
            <div className="space-y-3">
              {tasks.map((task, idx) => (
                <Card key={idx} className="p-4 border-l-4 border-purple-500">
                  <div className="flex items-start justify-between mb-2">
                    <h5 className="font-medium text-gray-900">{task.title}</h5>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(
                        task.priority
                      )}`}
                    >
                      {task.priority}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    {task.assignee && (
                      <span>👤 {task.assignee}</span>
                    )}
                    {task.dueDate && (
                      <span>📅 {task.dueDate}</span>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
