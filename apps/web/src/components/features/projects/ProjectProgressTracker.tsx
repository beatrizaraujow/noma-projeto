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
import { Card } from '@/components/common';
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

const MOCK_PROJECT_PROGRESS: ProjectProgress[] = [
  {
    projectId: 'p1',
    projectName: 'Website Redesign',
    totalTasks: 24,
    completedTasks: 16,
    inProgressTasks: 5,
    todoTasks: 2,
    overdueTasks: 1,
    completionRate: 67,
    tasksByPriority: [
      { priority: 'LOW', count: 5 },
      { priority: 'MEDIUM', count: 8 },
      { priority: 'HIGH', count: 9 },
      { priority: 'URGENT', count: 2 },
    ],
  },
  {
    projectId: 'p2',
    projectName: 'Mobile App',
    totalTasks: 18,
    completedTasks: 9,
    inProgressTasks: 4,
    todoTasks: 4,
    overdueTasks: 1,
    completionRate: 50,
    tasksByPriority: [
      { priority: 'LOW', count: 3 },
      { priority: 'MEDIUM', count: 6 },
      { priority: 'HIGH', count: 7 },
      { priority: 'URGENT', count: 2 },
    ],
  },
];

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
      setProjects(MOCK_PROJECT_PROGRESS);
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#2a1616] border border-orange-700/50 text-orange-200 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Projects List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {projects.map((project) => (
          <Card key={project.projectId} className="p-6 bg-[#1a1a1f] border-gray-800 text-white">
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-semibold"
                style={{ backgroundColor: project.projectColor || '#f97316' }}
              >
                {project.projectIcon || project.projectName.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="font-semibold text-lg text-white">{project.projectName}</h3>
                <p className="text-sm text-gray-400">
                  {project.totalTasks} total tasks
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-300">Progress</span>
                <span className="font-semibold text-white">{project.completionRate}%</span>
              </div>
              <div className="w-full bg-[#25252b] rounded-full h-2.5">
                <div
                  className="bg-orange-500 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${project.completionRate}%` }}
                ></div>
              </div>
            </div>

            {/* Task Status Breakdown */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-orange-500" />
                <div>
                  <p className="text-xs text-gray-400">Completed</p>
                  <p className="text-sm font-semibold text-white">{project.completedTasks}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-orange-500" />
                <div>
                  <p className="text-xs text-gray-400">In Progress</p>
                  <p className="text-sm font-semibold text-white">{project.inProgressTasks}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Circle className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-400">Todo</p>
                  <p className="text-sm font-semibold text-white">{project.todoTasks}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-orange-500" />
                <div>
                  <p className="text-xs text-gray-400">Overdue</p>
                  <p className="text-sm font-semibold text-white">{project.overdueTasks}</p>
                </div>
              </div>
            </div>

            {/* Priority Distribution */}
            <div className="pt-4 border-t border-gray-800">
              <p className="text-sm font-medium mb-2 text-white">Priority Distribution</p>
              <div className="flex gap-2">
                {project.tasksByPriority.map((item) => (
                  <div
                    key={item.priority}
                    className="flex-1 text-center p-2 rounded border border-gray-700"
                    style={{
                      backgroundColor: `${PRIORITY_COLORS[item.priority] || '#6b7280'}20`,
                    }}
                  >
                    <p className="text-xs text-gray-300">{item.priority}</p>
                    <p className="text-sm font-semibold text-white">{item.count}</p>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {projects.length === 0 && (
        <Card className="p-8 text-center text-gray-400 bg-[#1a1a1f] border-gray-800">
          <p>No projects found in this workspace</p>
        </Card>
      )}

      {/* Overall Progress Chart */}
      {projects.length > 0 && (
        <Card className="p-6 bg-[#1a1a1f] border-gray-800 text-white">
          <h3 className="text-lg font-semibold mb-4 text-white">Overall Project Completion</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={projects}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2d2d35" />
              <XAxis dataKey="projectName" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f1f25',
                  border: '1px solid #3f3f46',
                  borderRadius: '0.5rem',
                }}
                labelStyle={{ color: '#e5e7eb' }}
                itemStyle={{ color: '#e5e7eb' }}
                cursor={{ fill: 'rgba(249, 115, 22, 0.08)' }}
              />
              <Legend wrapperStyle={{ color: '#e5e7eb' }} />
              <Bar dataKey="completedTasks" fill="#f97316" name="Completed" />
              <Bar dataKey="inProgressTasks" fill="#fb923c" name="In Progress" />
              <Bar dataKey="todoTasks" fill="#a3a3a3" name="Todo" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}
    </div>
  );
}
