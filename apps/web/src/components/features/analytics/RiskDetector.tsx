'use client';

import React, { useState } from 'react';
import axios from 'axios';
import { Button } from '@nexora/ui/components/button';
import { Card } from '@nexora/ui/components/card';
import { AlertTriangle, Shield, TrendingUp, Loader2, AlertCircle } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface Risk {
  type: 'delay' | 'blocker' | 'resource' | 'technical';
  severity: 'low' | 'medium' | 'high';
  description: string;
  mitigation: string;
}

interface RiskDetectionData {
  risks: Risk[];
  overallRiskScore: number;
  recommendations: string[];
}

interface RiskDetectorProps {
  projectName: string;
  tasks: {
    title: string;
    status: string;
    priority?: string;
    dueDate?: string;
    assignee?: string;
  }[];
  activities?: string[];
  comments?: string[];
  token: string;
}

export default function RiskDetector({
  projectName,
  tasks,
  activities,
  comments,
  token,
}: RiskDetectorProps) {
  const [loading, setLoading] = useState(false);
  const [riskData, setRiskData] = useState<RiskDetectionData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const detectRisks = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.post(
        `${API_URL}/ai/detect-risks`,
        {
          name: projectName,
          tasks,
          activities,
          comments,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setRiskData(response.data);
    } catch (err: any) {
      console.error('Error detecting risks:', err);
      setError(err.response?.data?.message || 'Failed to detect risks');
    } finally {
      setLoading(false);
    }
  };

  const getRiskTypeIcon = (type: string) => {
    switch (type) {
      case 'delay':
        return '⏰';
      case 'blocker':
        return '🚧';
      case 'resource':
        return '👥';
      case 'technical':
        return '⚙️';
      default:
        return '⚠️';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-700 border-red-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      default:
        return 'bg-blue-100 text-blue-700 border-blue-300';
    }
  };

  const getRiskScoreColor = (score: number) => {
    if (score >= 70) return 'text-red-700';
    if (score >= 40) return 'text-yellow-700';
    return 'text-green-700';
  };

  const getRiskScoreBg = (score: number) => {
    if (score >= 70) return 'bg-red-100';
    if (score >= 40) return 'bg-yellow-100';
    return 'bg-green-100';
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-purple-500" />
          <h3 className="text-lg font-semibold">AI Risk Detection</h3>
        </div>
        <Button
          onClick={detectRisks}
          disabled={loading}
          variant="outline"
          size="sm"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <AlertTriangle className="w-4 h-4 mr-2" />
              Detect Risks
            </>
          )}
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {riskData && (
        <div className="space-y-6">
          {/* Overall Risk Score */}
          <div
            className={`p-6 rounded-lg ${getRiskScoreBg(
              riskData.overallRiskScore
            )}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-600 mb-1">
                  Overall Risk Score
                </div>
                <div
                  className={`text-4xl font-bold ${getRiskScoreColor(
                    riskData.overallRiskScore
                  )}`}
                >
                  {riskData.overallRiskScore}/100
                </div>
              </div>
              <div className="text-right">
                <TrendingUp
                  className={`w-12 h-12 ${getRiskScoreColor(
                    riskData.overallRiskScore
                  )}`}
                />
              </div>
            </div>
            <div className="mt-3 w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${
                  riskData.overallRiskScore >= 70
                    ? 'bg-red-500'
                    : riskData.overallRiskScore >= 40
                    ? 'bg-yellow-500'
                    : 'bg-green-500'
                }`}
                style={{ width: `${riskData.overallRiskScore}%` }}
              />
            </div>
          </div>

          {/* Detected Risks */}
          {riskData.risks.length > 0 ? (
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Detected Risks ({riskData.risks.length})
              </h4>
              <div className="space-y-3">
                {riskData.risks.map((risk, idx) => (
                  <Card
                    key={idx}
                    className={`p-4 border-2 ${getSeverityColor(risk.severity)}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">
                          {getRiskTypeIcon(risk.type)}
                        </span>
                        <div>
                          <div className="font-medium capitalize">
                            {risk.type} Risk
                          </div>
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-xs font-medium capitalize ${getSeverityColor(
                              risk.severity
                            )}`}
                          >
                            {risk.severity} severity
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 mb-3">
                      {risk.description}
                    </p>
                    <div className="p-3 bg-white rounded border border-gray-200">
                      <div className="text-xs font-semibold text-gray-600 mb-1">
                        💡 Mitigation Strategy:
                      </div>
                      <p className="text-sm text-gray-700">{risk.mitigation}</p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-green-600 bg-green-50 rounded-lg">
              <Shield className="w-12 h-12 mx-auto mb-2" />
              <p className="font-medium">No significant risks detected!</p>
              <p className="text-sm text-gray-600 mt-1">
                Your project appears to be on track
              </p>
            </div>
          )}

          {/* Recommendations */}
          {riskData.recommendations.length > 0 && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">
                AI Recommendations
              </h4>
              <ul className="space-y-2">
                {riskData.recommendations.map((rec, idx) => (
                  <li
                    key={idx}
                    className="text-sm text-gray-700 flex items-start gap-2"
                  >
                    <span className="text-blue-500 mt-1">→</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {!riskData && !loading && !error && (
        <div className="text-center py-8 text-gray-500">
          <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p>
            Click "Detect Risks" to analyze this project for potential delays and
            blockers
          </p>
        </div>
      )}
    </Card>
  );
}
