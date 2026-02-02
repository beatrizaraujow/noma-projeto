'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Card } from '@/components/ui/card';
import { CheckCircle, Circle, Clock, AlertCircle } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface ProjectProgress {
  projectId: string;
  projectName: string;
  projectColor?: string;
  projectIcon?: string;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  todoTasks: number;
  overdueTasks: number;
  completionRate: number;
  tasksByPriority: Array<{
    priority: string;
    count: number;
  }>;
}

interface ProjectProgressTrackerProps {
  workspaceId: string;
  token: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
const PRIORITY_COLORS: Record<string, string> = {
  LOW: '#10b981',
  MEDIUM: '#f59e0b',
  HIGH: '#ef4444',
  URGENT: '#dc2626',
};

export default function ProjectProgressTracker({
  workspaceId,
  token,
}: ProjectProgressTrackerProps) {
  const [projects, setProjects] = useState<ProjectProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProjectProgress();
  }, [workspaceId]);

  const loadProjectProgress = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_URL}/analytics/workspaces/${workspaceId}/project-progress`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProjects(response.data);
      setError(null);
    } catch (err: any) {
      console.error('Error loading project progress:', err);
      setError(err.response?.data?.message || 'Failed to load project progress');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Projects List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {projects.map((project) => (
          <Card key={project.projectId} className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-semibold"
                style={{ backgroundColor: project.projectColor || '#6366f1' }}
              >
                {project.projectIcon || project.projectName.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="font-semibold text-lg">{project.projectName}</h3>
                <p className="text-sm text-gray-500">
                  {project.totalTasks} total tasks
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Progress</span>
                <span className="font-semibold">{project.completionRate}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-green-500 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${project.completionRate}%` }}
                ></div>
              </div>
            </div>

            {/* Task Status Breakdown */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <div>
                  <p className="text-xs text-gray-500">Completed</p>
                  <p className="text-sm font-semibold">{project.completedTasks}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="text-xs text-gray-500">In Progress</p>
                  <p className="text-sm font-semibold">{project.inProgressTasks}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Circle className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Todo</p>
                  <p className="text-sm font-semibold">{project.todoTasks}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <div>
                  <p className="text-xs text-gray-500">Overdue</p>
                  <p className="text-sm font-semibold">{project.overdueTasks}</p>
                </div>
              </div>
            </div>

            {/* Priority Distribution */}
            <div className="pt-4 border-t">
              <p className="text-sm font-medium mb-2">Priority Distribution</p>
              <div className="flex gap-2">
                {project.tasksByPriority.map((item) => (
                  <div
                    key={item.priority}
                    className="flex-1 text-center p-2 rounded"
                    style={{
                      backgroundColor: `${PRIORITY_COLORS[item.priority] || '#6b7280'}20`,
                    }}
                  >
                    <p className="text-xs text-gray-600">{item.priority}</p>
                    <p className="text-sm font-semibold">{item.count}</p>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {projects.length === 0 && (
        <Card className="p-8 text-center text-gray-500">
          <p>No projects found in this workspace</p>
        </Card>
      )}

      {/* Overall Progress Chart */}
      {projects.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Overall Project Completion</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={projects}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="projectName" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="completedTasks" fill="#10b981" name="Completed" />
              <Bar dataKey="inProgressTasks" fill="#3b82f6" name="In Progress" />
              <Bar dataKey="todoTasks" fill="#6b7280" name="Todo" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}
    </div>
  );
}
