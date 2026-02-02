'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@nexora/ui/components/button';
import { Card } from '@nexora/ui/components/card';
import { FileText, Rocket, Megaphone, Target, Plus } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface ProjectTemplate {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  category?: string;
  tasks: any[];
}

interface ProjectTemplatesProps {
  workspaceId: string;
  token: string;
  onApplyTemplate?: (templateId: string, projectId: string) => void;
}

export default function ProjectTemplates({
  workspaceId,
  token,
  onApplyTemplate,
}: ProjectTemplatesProps) {
  const [templates, setTemplates] = useState<ProjectTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ProjectTemplate | null>(null);
  const [projectId, setProjectId] = useState('');

  useEffect(() => {
    loadTemplates();
  }, [workspaceId]);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/automation/templates`, {
        params: { workspaceId },
        headers: { Authorization: `Bearer ${token}` },
      });
      setTemplates(response.data);
    } catch (error) {
      console.error('Error loading templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyTemplate = async () => {
    if (!selectedTemplate || !projectId) {
      alert('Please select a template and enter a project ID');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(
        `${API_URL}/automation/templates/${selectedTemplate.id}/apply`,
        { projectId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert(`Template applied! ${response.data.tasksCreated} tasks created.`);
      
      if (onApplyTemplate) {
        onApplyTemplate(selectedTemplate.id, projectId);
      }

      setSelectedTemplate(null);
      setProjectId('');
    } catch (error: any) {
      console.error('Error applying template:', error);
      alert(error.response?.data?.message || 'Failed to apply template');
    } finally {
      setLoading(false);
    }
  };

  const getIconComponent = (icon: string) => {
    switch (icon) {
      case '🚀':
        return <Rocket className="w-8 h-8 text-blue-500" />;
      case '📢':
        return <Megaphone className="w-8 h-8 text-purple-500" />;
      case '🎯':
        return <Target className="w-8 h-8 text-green-500" />;
      default:
        return <FileText className="w-8 h-8 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-500" />
          <h3 className="text-lg font-semibold">Project Templates</h3>
        </div>
      </div>

      {selectedTemplate && (
        <Card className="p-6 bg-blue-50 border-blue-200">
          <h4 className="font-semibold mb-4">Apply Template: {selectedTemplate.name}</h4>
          <p className="text-sm text-gray-600 mb-4">
            This will create {selectedTemplate.tasks.length} tasks in your project.
          </p>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Project ID</label>
            <input
              type="text"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              placeholder="Enter project ID..."
              className="w-full p-2 border rounded"
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={handleApplyTemplate} disabled={loading}>
              {loading ? 'Applying...' : 'Apply Template'}
            </Button>
            <Button variant="outline" onClick={() => setSelectedTemplate(null)}>
              Cancel
            </Button>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => (
          <Card
            key={template.id}
            className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => setSelectedTemplate(template)}
          >
            <div className="flex items-start gap-4">
              <div>{getIconComponent(template.icon || '')}</div>
              <div className="flex-1">
                <h4 className="font-semibold mb-1">{template.name}</h4>
                <p className="text-sm text-gray-600 mb-3">
                  {template.description}
                </p>
                {template.category && (
                  <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                    {template.category}
                  </span>
                )}
                <div className="mt-3 text-sm text-gray-500">
                  {template.tasks.length} tasks included
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {templates.length === 0 && !loading && (
        <Card className="p-12 text-center">
          <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h4 className="font-semibold text-gray-700 mb-2">No Templates Available</h4>
          <p className="text-gray-500">
            Project templates will appear here once created.
          </p>
        </Card>
      )}
    </div>
  );
}
