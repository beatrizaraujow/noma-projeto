'use client';

import { useState } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Download, FileText, FileSpreadsheet, Loader2 } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface DashboardExportProps {
  workspaceId: string;
  token: string;
}

export default function DashboardExport({ workspaceId, token }: DashboardExportProps) {
  const [exporting, setExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<'csv' | 'json' | null>(null);

  const handleExport = async (format: 'csv' | 'json') => {
    try {
      setExporting(true);
      setExportFormat(format);

      const response = await axios.get(
        `${API_URL}/analytics/workspaces/${workspaceId}/export`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { format },
          responseType: format === 'csv' ? 'blob' : 'json',
        }
      );

      if (format === 'csv') {
        // Handle CSV download
        const blob = new Blob([response.data], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `dashboard-export-${Date.now()}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      } else {
        // Handle JSON download
        const dataStr = JSON.stringify(response.data, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `dashboard-export-${Date.now()}.json`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      }
    } catch (err: any) {
      console.error('Error exporting dashboard:', err);
      alert('Failed to export dashboard: ' + (err.response?.data?.message || err.message));
    } finally {
      setExporting(false);
      setExportFormat(null);
    }
  };

  const handleExportPDF = async () => {
    try {
      setExporting(true);
      setExportFormat('json');

      // Get the data
      const response = await axios.get(
        `${API_URL}/analytics/workspaces/${workspaceId}/export`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Generate PDF using browser's print functionality
      const data = response.data;
      
      // Create a new window with formatted content
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        alert('Please allow popups to export PDF');
        return;
      }

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Dashboard Export - ${data.workspace.name}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #333; border-bottom: 2px solid #4F46E5; padding-bottom: 10px; }
            h2 { color: #4F46E5; margin-top: 30px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { padding: 12px; text-align: left; border: 1px solid #ddd; }
            th { background-color: #4F46E5; color: white; }
            tr:nth-child(even) { background-color: #f9f9f9; }
            .metric { display: inline-block; margin: 10px 20px 10px 0; }
            .metric-label { font-weight: bold; color: #666; }
            .metric-value { font-size: 24px; color: #4F46E5; font-weight: bold; }
            @media print {
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          <h1>Dashboard Export - ${data.workspace.name}</h1>
          <p><strong>Export Date:</strong> ${new Date(data.exportDate).toLocaleString()}</p>

          <h2>Overview Metrics</h2>
          <div class="metric">
            <div class="metric-label">Total Projects</div>
            <div class="metric-value">${data.dashboard.overview.totalProjects}</div>
          </div>
          <div class="metric">
            <div class="metric-label">Total Tasks</div>
            <div class="metric-value">${data.dashboard.overview.totalTasks}</div>
          </div>
          <div class="metric">
            <div class="metric-label">Total Members</div>
            <div class="metric-value">${data.dashboard.overview.totalMembers}</div>
          </div>
          <div class="metric">
            <div class="metric-label">Completed Tasks</div>
            <div class="metric-value">${data.dashboard.overview.completedTasks}</div>
          </div>
          <div class="metric">
            <div class="metric-label">Overdue Tasks</div>
            <div class="metric-value">${data.dashboard.overview.overdueTasks}</div>
          </div>
          <div class="metric">
            <div class="metric-label">Completion Rate</div>
            <div class="metric-value">${data.dashboard.overview.completionRate}%</div>
          </div>

          <h2>Project Progress</h2>
          <table>
            <thead>
              <tr>
                <th>Project</th>
                <th>Total Tasks</th>
                <th>Completed</th>
                <th>In Progress</th>
                <th>Todo</th>
                <th>Overdue</th>
                <th>Completion Rate</th>
              </tr>
            </thead>
            <tbody>
              ${data.projectProgress.map((project: any) => `
                <tr>
                  <td>${project.projectName}</td>
                  <td>${project.totalTasks}</td>
                  <td>${project.completedTasks}</td>
                  <td>${project.inProgressTasks}</td>
                  <td>${project.todoTasks}</td>
                  <td>${project.overdueTasks}</td>
                  <td>${project.completionRate}%</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <h2>Team Productivity</h2>
          <table>
            <thead>
              <tr>
                <th>Team Member</th>
                <th>Assigned Tasks</th>
                <th>Completed Tasks</th>
                <th>Completion Rate</th>
                <th>Activities</th>
                <th>Comments</th>
              </tr>
            </thead>
            <tbody>
              ${data.teamProductivity.memberMetrics.map((member: any) => `
                <tr>
                  <td>${member.user.name}</td>
                  <td>${member.assignedTasks}</td>
                  <td>${member.completedTasks}</td>
                  <td>${member.completionRate}%</td>
                  <td>${member.activitiesCount}</td>
                  <td>${member.commentsCount}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <h2>Task Distribution</h2>
          <h3>By Status</h3>
          <table>
            <thead>
              <tr>
                <th>Status</th>
                <th>Count</th>
              </tr>
            </thead>
            <tbody>
              ${data.taskDistribution.byStatus.map((item: any) => `
                <tr>
                  <td>${item.status}</td>
                  <td>${item.count}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <h3>By Priority</h3>
          <table>
            <thead>
              <tr>
                <th>Priority</th>
                <th>Count</th>
              </tr>
            </thead>
            <tbody>
              ${data.taskDistribution.byPriority.map((item: any) => `
                <tr>
                  <td>${item.priority}</td>
                  <td>${item.count}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
        </html>
      `;

      printWindow.document.write(htmlContent);
      printWindow.document.close();
    } catch (err: any) {
      console.error('Error exporting PDF:', err);
      alert('Failed to export PDF: ' + (err.response?.data?.message || err.message));
    } finally {
      setExporting(false);
      setExportFormat(null);
    }
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Export Dashboard</h3>
      <p className="text-sm text-gray-600 mb-4">
        Export your dashboard data in various formats for reporting and analysis.
      </p>
      <div className="flex flex-wrap gap-3">
        <Button
          onClick={() => handleExport('csv')}
          disabled={exporting}
          className="flex items-center gap-2"
        >
          {exporting && exportFormat === 'csv' ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <FileSpreadsheet className="h-4 w-4" />
          )}
          Export CSV
        </Button>

        <Button
          onClick={() => handleExport('json')}
          disabled={exporting}
          variant="outline"
          className="flex items-center gap-2"
        >
          {exporting && exportFormat === 'json' ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <FileText className="h-4 w-4" />
          )}
          Export JSON
        </Button>

        <Button
          onClick={handleExportPDF}
          disabled={exporting}
          variant="outline"
          className="flex items-center gap-2"
        >
          {exporting && exportFormat === null ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          Export PDF
        </Button>
      </div>
    </Card>
  );
}
