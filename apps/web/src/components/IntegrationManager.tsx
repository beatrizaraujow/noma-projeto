'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@nexora/ui/components/button';
import { Card } from '@nexora/ui/components/card';
import { Input } from '@nexora/ui/components/input';
import { Label } from '@nexora/ui/components/label';
import {
  MessageSquare,
  Mail,
  Calendar,
  Plus,
  Trash2,
  Power,
  PowerOff,
  TestTube,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface Integration {
  id: string;
  type: 
    | 'slack' 
    | 'discord' 
    | 'email' 
    | 'google_calendar' 
    | 'outlook_calendar'
    | 'github'
    | 'figma'
    | 'google_drive'
    | 'dropbox'
    | 'zapier'
    | 'make'
    | 'custom_webhook';
  name: string;
  description?: string;
  active: boolean;
  config: any;
  createdAt: string;
  _count?: {
    logs: number;
  };
}

interface IntegrationLog {
  id: string;
  action: string;
  status: 'success' | 'error' | 'pending';
  message?: string;
  createdAt: string;
}

interface IntegrationManagerProps {
  workspaceId: string;
  token: string;
}

const INTEGRATION_TYPES = [
  { value: 'slack', label: 'Slack', icon: '💬', color: 'bg-purple-100 text-purple-700' },
  { value: 'discord', label: 'Discord', icon: '🎮', color: 'bg-indigo-100 text-indigo-700' },
  { value: 'email', label: 'Email', icon: '📧', color: 'bg-blue-100 text-blue-700' },
  { value: 'google_calendar', label: 'Google Calendar', icon: '📅', color: 'bg-red-100 text-red-700' },
  { value: 'outlook_calendar', label: 'Outlook Calendar', icon: '📆', color: 'bg-blue-100 text-blue-700' },
  { value: 'github', label: 'GitHub', icon: '⚙️', color: 'bg-gray-100 text-gray-700' },
  { value: 'figma', label: 'Figma', icon: '🎨', color: 'bg-pink-100 text-pink-700' },
  { value: 'google_drive', label: 'Google Drive', icon: '📁', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'dropbox', label: 'Dropbox', icon: '📦', color: 'bg-blue-100 text-blue-700' },
  { value: 'zapier', label: 'Zapier', icon: '⚡', color: 'bg-orange-100 text-orange-700' },
  { value: 'make', label: 'Make.com', icon: '🔧', color: 'bg-purple-100 text-purple-700' },
  { value: 'custom_webhook', label: 'Custom Webhook', icon: '🔗', color: 'bg-green-100 text-green-700' },
];

export default function IntegrationManager({ workspaceId, token }: IntegrationManagerProps) {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [logs, setLogs] = useState<Record<string, IntegrationLog[]>>({});
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedType, setSelectedType] = useState<string>('');
  const [formData, setFormData] = useState<any>({
    name: '',
    description: '',
    config: {},
  });
  const [testing, setTesting] = useState<string | null>(null);

  useEffect(() => {
    fetchIntegrations();
  }, [workspaceId]);

  const fetchIntegrations = async () => {
    try {
      const response = await axios.get(`${API_URL}/integrations`, {
        params: { workspaceId },
        headers: { Authorization: `Bearer ${token}` },
      });
      setIntegrations(response.data);
    } catch (error) {
      console.error('Failed to fetch integrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async (integrationId: string) => {
    try {
      const response = await axios.get(`${API_URL}/integrations/${integrationId}/logs`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { limit: 10 },
      });
      setLogs((prev) => ({ ...prev, [integrationId]: response.data }));
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    }
  };

  const createIntegration = async () => {
    try {
      await axios.post(
        `${API_URL}/integrations`,
        {
          workspaceId,
          type: selectedType,
          name: formData.name,
          description: formData.description,
          config: formData.config,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setShowForm(false);
      setFormData({ name: '', description: '', config: {} });
      setSelectedType('');
      fetchIntegrations();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to create integration');
    }
  };

  const deleteIntegration = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta integração?')) return;

    try {
      await axios.delete(`${API_URL}/integrations/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchIntegrations();
    } catch (error) {
      alert('Failed to delete integration');
    }
  };

  const toggleIntegration = async (id: string, active: boolean) => {
    try {
      await axios.put(
        `${API_URL}/integrations/${id}`,
        { active: !active },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchIntegrations();
    } catch (error) {
      alert('Failed to toggle integration');
    }
  };

  const testIntegration = async (id: string, type: string) => {
    setTesting(id);
    try {
      await axios.post(
        `${API_URL}/integrations/${id}/test`,
        { message: 'Test message from NOMA' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Test successful! Check your integration.');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Test failed');
    } finally {
      setTesting(null);
    }
  };

  const renderConfigFields = () => {
    const type = selectedType;

    switch (type) {
      case 'slack':
        return (
          <div className="space-y-4">
            <div>
              <Label>Webhook URL</Label>
              <Input
                value={formData.config.webhookUrl || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    config: { ...formData.config, webhookUrl: e.target.value },
                  })
                }
                placeholder="https://hooks.slack.com/services/..."
              />
              <p className="text-xs text-gray-500 mt-1">
                Create a webhook at: https://api.slack.com/messaging/webhooks
              </p>
            </div>
            <div>
              <Label>Default Channel (opcional)</Label>
              <Input
                value={formData.config.channel || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    config: { ...formData.config, channel: e.target.value },
                  })
                }
                placeholder="#general"
              />
            </div>
          </div>
        );

      case 'discord':
        return (
          <div className="space-y-4">
            <div>
              <Label>Webhook URL</Label>
              <Input
                value={formData.config.webhookUrl || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    config: { ...formData.config, webhookUrl: e.target.value },
                  })
                }
                placeholder="https://discord.com/api/webhooks/..."
              />
              <p className="text-xs text-gray-500 mt-1">
                Create a webhook in Discord Server Settings → Integrations
              </p>
            </div>
            <div>
              <Label>Bot Username (opcional)</Label>
              <Input
                value={formData.config.username || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    config: { ...formData.config, username: e.target.value },
                  })
                }
                placeholder="NOMA Bot"
              />
            </div>
          </div>
        );

      case 'email':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>IMAP Host</Label>
                <Input
                  value={formData.config.host || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      config: { ...formData.config, host: e.target.value },
                    })
                  }
                  placeholder="imap.gmail.com"
                />
              </div>
              <div>
                <Label>IMAP Port</Label>
                <Input
                  type="number"
                  value={formData.config.port || 993}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      config: { ...formData.config, port: parseInt(e.target.value) },
                    })
                  }
                />
              </div>
            </div>
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={formData.config.user || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    config: { ...formData.config, user: e.target.value },
                  })
                }
                placeholder="your-email@gmail.com"
              />
            </div>
            <div>
              <Label>Password / App Password</Label>
              <Input
                type="password"
                value={formData.config.password || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    config: { ...formData.config, password: e.target.value },
                  })
                }
                placeholder="••••••••"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.config.secure ?? true}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    config: { ...formData.config, secure: e.target.checked },
                  })
                }
              />
              <Label>Use SSL/TLS</Label>
            </div>
          </div>
        );

      case 'google_calendar':
      case 'outlook_calendar':
        return (
          <div className="space-y-4">
            <div className="p-4 bg-yellow-50 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>OAuth Setup Required:</strong>
                <br />
                1. Create OAuth app in {type === 'google_calendar' ? 'Google' : 'Microsoft'} Console
                <br />
                2. Add redirect URI: {window.location.origin}/integrations/oauth/callback
                <br />
                3. Get authorization code and exchange for refresh token
              </p>
            </div>
            <div>
              <Label>Client ID</Label>
              <Input
                value={formData.config.clientId || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    config: { ...formData.config, clientId: e.target.value },
                  })
                }
                placeholder="Your OAuth Client ID"
              />
            </div>
            <div>
              <Label>Client Secret</Label>
              <Input
                type="password"
                value={formData.config.clientSecret || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    config: { ...formData.config, clientSecret: e.target.value },
                  })
                }
                placeholder="Your OAuth Client Secret"
              />
            </div>
            <div>
              <Label>Refresh Token</Label>
              <Input
                value={formData.config.refreshToken || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    config: { ...formData.config, refreshToken: e.target.value },
                  })
                }
                placeholder="Your OAuth Refresh Token"
              />
            </div>
          </div>
        );

      case 'github':
        return (
          <div className="space-y-4">
            <div>
              <Label>Personal Access Token</Label>
              <Input
                type="password"
                value={formData.config.token || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    config: { ...formData.config, token: e.target.value },
                  })
                }
                placeholder="ghp_..."
              />
              <p className="text-xs text-gray-500 mt-1">
                Create token at: https://github.com/settings/tokens
              </p>
            </div>
            <div>
              <Label>Repositories (comma separated)</Label>
              <Input
                value={formData.config.repositories?.join(', ') || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    config: { 
                      ...formData.config, 
                      repositories: e.target.value.split(',').map(r => r.trim()) 
                    },
                  })
                }
                placeholder="owner/repo1, owner/repo2"
              />
            </div>
            <div>
              <Label>Webhook Secret (opcional)</Label>
              <Input
                type="password"
                value={formData.config.webhookSecret || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    config: { ...formData.config, webhookSecret: e.target.value },
                  })
                }
                placeholder="Secret for webhook verification"
              />
            </div>
          </div>
        );

      case 'figma':
        return (
          <div className="space-y-4">
            <div>
              <Label>Access Token</Label>
              <Input
                type="password"
                value={formData.config.accessToken || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    config: { ...formData.config, accessToken: e.target.value },
                  })
                }
                placeholder="figd_..."
              />
              <p className="text-xs text-gray-500 mt-1">
                Generate token at: https://www.figma.com/developers/api#access-tokens
              </p>
            </div>
            <div>
              <Label>Webhook Secret (opcional)</Label>
              <Input
                type="password"
                value={formData.config.webhookSecret || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    config: { ...formData.config, webhookSecret: e.target.value },
                  })
                }
                placeholder="Secret for webhook verification"
              />
            </div>
          </div>
        );

      case 'google_drive':
        return (
          <div className="space-y-4">
            <div>
              <Label>Access Token</Label>
              <Input
                type="password"
                value={formData.config.accessToken || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    config: { ...formData.config, accessToken: e.target.value },
                  })
                }
                placeholder="ya29..."
              />
              <p className="text-xs text-gray-500 mt-1">
                OAuth access token from Google Drive API
              </p>
            </div>
            <div>
              <Label>Refresh Token (opcional)</Label>
              <Input
                type="password"
                value={formData.config.refreshToken || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    config: { ...formData.config, refreshToken: e.target.value },
                  })
                }
                placeholder="Refresh token for auto-renewal"
              />
            </div>
          </div>
        );

      case 'dropbox':
        return (
          <div className="space-y-4">
            <div>
              <Label>Access Token</Label>
              <Input
                type="password"
                value={formData.config.accessToken || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    config: { ...formData.config, accessToken: e.target.value },
                  })
                }
                placeholder="sl..."
              />
              <p className="text-xs text-gray-500 mt-1">
                Generate at: https://www.dropbox.com/developers/apps
              </p>
            </div>
            <div>
              <Label>Refresh Token (opcional)</Label>
              <Input
                type="password"
                value={formData.config.refreshToken || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    config: { ...formData.config, refreshToken: e.target.value },
                  })
                }
                placeholder="Refresh token for auto-renewal"
              />
            </div>
          </div>
        );

      case 'zapier':
      case 'make':
      case 'custom_webhook':
        return (
          <div className="space-y-4">
            <div>
              <Label>Events (comma separated)</Label>
              <Input
                value={formData.config.events?.join(', ') || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    config: { 
                      ...formData.config, 
                      events: e.target.value.split(',').map(e => e.trim()) 
                    },
                  })
                }
                placeholder="task.created, task.updated, comment.added"
              />
              <p className="text-xs text-gray-500 mt-1">
                Events that will trigger this webhook
              </p>
            </div>
            <div>
              <Label>Webhook Secret (opcional)</Label>
              <Input
                type="password"
                value={formData.config.secret || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    config: { ...formData.config, secret: e.target.value },
                  })
                }
                placeholder="Secret for HMAC signature verification"
              />
            </div>
            <div className="p-4 bg-blue-50 rounded-md">
              <p className="text-sm text-blue-800">
                <strong>Webhook URL:</strong> Será gerado automaticamente após criar a integração
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const getIntegrationIcon = (type: string) => {
    const integration = INTEGRATION_TYPES.find((i) => i.value === type);
    return integration?.icon || '🔌';
  };

  const getIntegrationColor = (type: string) => {
    const integration = INTEGRATION_TYPES.find((i) => i.value === type);
    return integration?.color || 'bg-gray-100 text-gray-700';
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <MessageSquare className="w-6 h-6" />
            Integrações
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Conecte o NOMA com suas ferramentas favoritas
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-2" />
          Nova Integração
        </Button>
      </div>

      {showForm && (
        <Card className="p-6 mb-6 bg-gray-50">
          <h3 className="font-semibold mb-4">Criar Nova Integração</h3>

          <div className="space-y-4">
            <div>
              <Label>Tipo de Integração</Label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="">Selecione...</option>
                {INTEGRATION_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.icon} {type.label}
                  </option>
                ))}
              </select>
            </div>

            {selectedType && (
              <>
                <div>
                  <Label>Nome</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Slack do Time de Dev"
                  />
                </div>

                <div>
                  <Label>Descrição (opcional)</Label>
                  <Input
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Para que serve esta integração?"
                  />
                </div>

                {renderConfigFields()}

                <div className="flex gap-2">
                  <Button onClick={createIntegration} className="flex-1">
                    Criar Integração
                  </Button>
                  <Button
                    onClick={() => {
                      setShowForm(false);
                      setSelectedType('');
                      setFormData({ name: '', description: '', config: {} });
                    }}
                    variant="outline"
                  >
                    Cancelar
                  </Button>
                </div>
              </>
            )}
          </div>
        </Card>
      )}

      {integrations.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p>Nenhuma integração configurada</p>
          <p className="text-sm mt-2">Clique em "Nova Integração" para começar</p>
        </div>
      ) : (
        <div className="space-y-4">
          {integrations.map((integration) => (
            <Card key={integration.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div
                    className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl ${getIntegrationColor(
                      integration.type
                    )}`}
                  >
                    {getIntegrationIcon(integration.type)}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{integration.name}</h3>
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          integration.active
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {integration.active ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>

                    {integration.description && (
                      <p className="text-sm text-gray-600 mt-1">{integration.description}</p>
                    )}

                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span>
                        Tipo: {INTEGRATION_TYPES.find((t) => t.value === integration.type)?.label}
                      </span>
                      <span>
                        Logs: {integration._count?.logs || 0}
                      </span>
                      <span>
                        Criado: {new Date(integration.createdAt).toLocaleDateString('pt-BR')}
                      </span>
                    </div>

                    {logs[integration.id] && logs[integration.id].length > 0 && (
                      <div className="mt-3 space-y-1">
                        <p className="text-xs font-semibold text-gray-700">Logs recentes:</p>
                        {logs[integration.id].slice(0, 3).map((log) => (
                          <div
                            key={log.id}
                            className="text-xs flex items-center gap-2 text-gray-600"
                          >
                            {log.status === 'success' && <CheckCircle className="w-3 h-3 text-green-600" />}
                            {log.status === 'error' && <XCircle className="w-3 h-3 text-red-600" />}
                            {log.status === 'pending' && <Clock className="w-3 h-3 text-yellow-600" />}
                            <span>{log.action}</span>
                            {log.message && <span className="text-gray-500">- {log.message}</span>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => testIntegration(integration.id, integration.type)}
                    disabled={testing === integration.id}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    title="Testar integração"
                  >
                    {testing === integration.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <TestTube className="w-4 h-4" />
                    )}
                  </button>

                  <button
                    onClick={() => fetchLogs(integration.id)}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                    title="Ver logs"
                  >
                    <Clock className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => toggleIntegration(integration.id, integration.active)}
                    className={`p-2 rounded transition-colors ${
                      integration.active
                        ? 'text-green-600 hover:bg-green-50'
                        : 'text-gray-400 hover:bg-gray-100'
                    }`}
                    title={integration.active ? 'Desativar' : 'Ativar'}
                  >
                    {integration.active ? (
                      <Power className="w-4 h-4" />
                    ) : (
                      <PowerOff className="w-4 h-4" />
                    )}
                  </button>

                  <button
                    onClick={() => deleteIntegration(integration.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded transition-colors"
                    title="Excluir"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold mb-2 text-blue-900">💡 Dicas de Integração:</h3>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li><strong>Slack:</strong> Configure notificações automáticas para tarefas e comentários</li>
          <li><strong>Discord:</strong> Mantenha seu servidor atualizado com mudanças de projeto</li>
          <li><strong>Email:</strong> Crie tarefas enviando emails para o projeto</li>
          <li><strong>Calendar:</strong> Sincronize tarefas com prazos no seu calendário</li>
        </ul>
      </div>
    </Card>
  );
}
