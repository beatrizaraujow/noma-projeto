'use client';

import React, { useState } from 'react';
import { Button } from '@nexora/ui/components/button';
import { Card } from '@nexora/ui/components/card';
import { Input } from '@nexora/ui/components/input';
import { Label } from '@nexora/ui/components/label';
import { Clock, Calendar, Plus } from 'lucide-react';

interface ScheduledAutomationsProps {
  workspaceId: string;
  token: string;
}

export default function ScheduledAutomations({ workspaceId, token }: ScheduledAutomationsProps) {
  const [schedule, setSchedule] = useState({
    type: 'cron',
    expression: '0 9 * * *', // 9 AM every day
    timezone: 'UTC',
  });

  const presets = [
    { label: 'Every hour', value: '0 * * * *' },
    { label: 'Every day at 9 AM', value: '0 9 * * *' },
    { label: 'Every Monday at 10 AM', value: '0 10 * * 1' },
    { label: 'First day of month', value: '0 0 1 * *' },
    { label: 'Every 15 minutes', value: '*/15 * * * *' },
  ];

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Clock className="w-6 h-6 text-orange-600" />
        <h2 className="text-2xl font-bold">Scheduled Automations</h2>
      </div>

      <div className="space-y-6">
        <div>
          <Label>Schedule Type</Label>
          <select
            value={schedule.type}
            onChange={(e) => setSchedule({ ...schedule, type: e.target.value })}
            className="w-full px-3 py-2 border rounded-md"
          >
            <option value="cron">Cron Expression</option>
            <option value="interval">Interval</option>
            <option value="specific">Specific Date/Time</option>
          </select>
        </div>

        {schedule.type === 'cron' && (
          <>
            <div>
              <Label>Cron Expression</Label>
              <Input
                value={schedule.expression}
                onChange={(e) => setSchedule({ ...schedule, expression: e.target.value })}
                placeholder="0 9 * * *"
                className="font-mono"
              />
              <p className="text-xs text-gray-500 mt-1">
                Format: minute hour day month day-of-week
              </p>
            </div>

            <div>
              <Label>Presets</Label>
              <div className="grid grid-cols-2 gap-2">
                {presets.map((preset) => (
                  <Button
                    key={preset.value}
                    variant="outline"
                    size="sm"
                    onClick={() => setSchedule({ ...schedule, expression: preset.value })}
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
            </div>
          </>
        )}

        {schedule.type === 'interval' && (
          <div>
            <Label>Interval (minutes)</Label>
            <Input type="number" placeholder="60" />
          </div>
        )}

        {schedule.type === 'specific' && (
          <div>
            <Label>Date & Time</Label>
            <Input type="datetime-local" />
          </div>
        )}

        <div>
          <Label>Timezone</Label>
          <select
            value={schedule.timezone}
            onChange={(e) => setSchedule({ ...schedule, timezone: e.target.value })}
            className="w-full px-3 py-2 border rounded-md"
          >
            <option value="UTC">UTC</option>
            <option value="America/New_York">America/New_York</option>
            <option value="America/Los_Angeles">America/Los_Angeles</option>
            <option value="Europe/London">Europe/London</option>
            <option value="Asia/Tokyo">Asia/Tokyo</option>
          </select>
        </div>

        <div className="p-4 bg-yellow-50 rounded-lg">
          <h3 className="font-semibold mb-2 text-yellow-900">Note:</h3>
          <p className="text-sm text-yellow-800">
            Scheduled automations require @nestjs/schedule package to be installed on the backend.
            Install it with: <code className="bg-yellow-100 px-2 py-1 rounded">pnpm add @nestjs/schedule</code>
          </p>
        </div>

        <Button className="w-full">
          <Calendar className="w-4 h-4 mr-2" />
          Save Schedule
        </Button>
      </div>
    </Card>
  );
}
