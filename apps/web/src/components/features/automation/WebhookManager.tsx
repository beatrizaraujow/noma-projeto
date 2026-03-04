'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@nexora/ui/components/button';
import { Card } from '@nexora/ui/components/card';
import { Input } from '@nexora/ui/components/input';
import { Label } from '@nexora/ui/components/label';
import { Webhook, Copy, Trash2, Plus, ExternalLink, Loader2 } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface WebhookManagerProps {
  workspaceId: string;
  token: string;
}

export default function WebhookManager({ workspaceId, token }: WebhookManagerProps) {
  const [loading, setLoading] = useState(false);
  const [webhooks, setWebhooks] = useState<any[]>([]);
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newWebhook, setNewWebhook] = useState({
    name: '',
    workflowId: '',
  });

  useEffect(() => {
    loadData();
  }, [workspaceId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [webhooksRes, workflowsRes] = await Promise.all([
        axios.get(`${API_URL}/workflows/webhooks/workspace/${workspaceId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_URL}/workflows/workspace/${workspaceId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      setWebhooks(webhooksRes.data);
      setWorkflows(workflowsRes.data);
    } catch (error: any) {
      console.error('Error loading webhooks:', error);
    } finally {
      setLoading(false);
    }
  };

  const createWebhook = async () => {
    if (!newWebhook.name || !newWebhook.workflowId) {
      alert('Please fill all fields');
      return;
    }

    try {
      setLoading(true);
      await axios.post(
        `${API_URL}/workflows/webhooks`,
        {
          workspaceId,
          ...newWebhook,
          createdBy: 'current-user-id',
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setNewWebhook({ name: '', workflowId: '' });
      setShowCreate(false);
      await loadData();
      alert('Webhook created successfully!');
    } catch (error: any) {
      alert(error?.response?.data?.message || 'Error creating webhook');
    } finally {
      setLoading(false);
    }
  };

  const deleteWebhook = async (id: string) => {
    if (!confirm('Delete this webhook?')) return;

    try {
      await axios.delete(`${API_URL}/workflows/webhooks/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await loadData();
    } catch (error: any) {
      alert(error?.response?.data?.message || 'Error deleting webhook');
    }
  };

  const copyWebhookUrl = (url: string) => {
    navigator.clipboard.writeText(`${API_URL}/workflows/webhooks/${url}/trigger`);
    alert('Webhook URL copied to clipboard!');
  };

  const copySecret = (secret: string) => {
    navigator.clipboard.writeText(secret);
    alert('Secret copied to clipboard!');
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Webhook className="w-6 h-6 text-purple-600" />
          <h2 className="text-2xl font-bold">Webhook Triggers</h2>
        </div>
        <Button onClick={() => setShowCreate(!showCreate)}>
          <Plus className="w-4 h-4 mr-2" />
          New Webhook
        </Button>
      </div>

      {showCreate && (
        <Card className="p-4 mb-6 bg-gray-50">
          <h3 className="font-semibold mb-4">Create Webhook</h3>
          <div className="space-y-4">
            <div>
              <Label>Webhook Name</Label>
              <Input
                value={newWebhook.name}
                onChange={(e) => setNewWebhook({ ...newWebhook, name: e.target.value })}
                placeholder="e.g., GitHub Push Webhook"
              />
            </div>
            <div>
              <Label>Trigger Workflow</Label>
              <select
                value={newWebhook.workflowId}
                onChange={(e) => setNewWebhook({ ...newWebhook, workflowId: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="">Select workflow...</option>
                {workflows.map((wf) => (
                  <option key={wf.id} value={wf.id}>
                    {wf.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <Button onClick={createWebhook} disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Create
              </Button>
              <Button variant="outline" onClick={() => setShowCreate(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}

      {loading && webhooks.length === 0 ? (
        <div className="text-center py-12">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-400" />
        </div>
      ) : webhooks.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <Webhook className="w-16 h-16 mx-auto mb-4 opacity-20" />
          <p>No webhooks yet. Create one to trigger workflows via HTTP.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {webhooks.map((webhook) => (
            <Card key={webhook.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Webhook className="w-5 h-5 text-purple-600" />
                    <h3 className="font-semibold">{webhook.name}</h3>
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        webhook.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {webhook.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">URL:</span>
                      <code className="px-2 py-1 bg-gray-100 rounded text-xs flex-1">
                        {API_URL}/workflows/webhooks/{webhook.url}/trigger
                      </code>
                      <button
                        onClick={() => copyWebhookUrl(webhook.url)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">Secret:</span>
                      <code className="px-2 py-1 bg-gray-100 rounded text-xs">
                        {webhook.secret.substring(0, 20)}...
                      </code>
                      <button
                        onClick={() => copySecret(webhook.secret)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>Triggered {webhook.triggerCount} times</span>
                      {webhook.lastTriggered && (
                        <span>Last: {new Date(webhook.lastTriggered).toLocaleString()}</span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => deleteWebhook(webhook.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold mb-2 text-blue-900">How to use webhooks:</h3>
        <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
          <li>Copy the webhook URL</li>
          <li>Configure it in your external service (GitHub, GitLab, etc.)</li>
          <li>Use the secret for signature verification (optional)</li>
          <li>Send POST requests with JSON payload to trigger the workflow</li>
        </ol>
      </div>
    </Card>
  );
}
