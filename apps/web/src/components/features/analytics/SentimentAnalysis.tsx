'use client';

import React, { useState } from 'react';
import axios from 'axios';
import { Button } from '@nexora/ui/components/button';
import { Card } from '@nexora/ui/components/card';
import { Smile, Meh, Frown, Loader2, MessageSquare } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface SentimentData {
  sentiment: 'positive' | 'neutral' | 'negative';
  score: number;
  emotions: string[];
  concerns: string[];
}

interface SentimentAnalysisProps {
  text?: string;
  context?: string;
  token: string;
  onAnalysisComplete?: (analysis: SentimentData) => void;
}

export default function SentimentAnalysis({
  text: initialText = '',
  context,
  token,
  onAnalysisComplete,
}: SentimentAnalysisProps) {
  const [text, setText] = useState(initialText);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<SentimentData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const analyzeSentiment = async () => {
    if (!text.trim()) {
      setError('Please enter text to analyze');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await axios.post(
        `${API_URL}/ai/analyze-sentiment`,
        { text, context },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setAnalysis(response.data);
      if (onAnalysisComplete) {
        onAnalysisComplete(response.data);
      }
    } catch (err: any) {
      console.error('Error analyzing sentiment:', err);
      setError(err.response?.data?.message || 'Failed to analyze sentiment');
    } finally {
      setLoading(false);
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return <Smile className="w-8 h-8 text-green-500" />;
      case 'negative':
        return <Frown className="w-8 h-8 text-red-500" />;
      default:
        return <Meh className="w-8 h-8 text-gray-500" />;
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'bg-green-50 border-green-200';
      case 'negative':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getScoreColor = (score: number) => {
    if (score > 0.3) return 'text-green-700';
    if (score < -0.3) return 'text-red-700';
    return 'text-gray-700';
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="w-5 h-5 text-purple-500" />
        <h3 className="text-lg font-semibold">Sentiment Analysis</h3>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Text to Analyze
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter text to analyze sentiment (e.g., a comment, message, or feedback)..."
            className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
          />
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <Button
          onClick={analyzeSentiment}
          disabled={loading || !text.trim()}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            'Analyze Sentiment'
          )}
        </Button>

        {analysis && (
          <div className="mt-6 space-y-4">
            {/* Overall Sentiment */}
            <div
              className={`p-6 rounded-lg border-2 ${getSentimentColor(
                analysis.sentiment
              )}`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {getSentimentIcon(analysis.sentiment)}
                  <div>
                    <div className="text-lg font-semibold capitalize">
                      {analysis.sentiment}
                    </div>
                    <div className={`text-2xl font-bold ${getScoreColor(analysis.score)}`}>
                      {analysis.score > 0 ? '+' : ''}
                      {analysis.score.toFixed(2)}
                    </div>
                  </div>
                </div>
                <div className="text-right text-sm text-gray-600">
                  <div>Score Range:</div>
                  <div className="font-mono">-1.0 to +1.0</div>
                </div>
              </div>

              {/* Score Bar */}
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    analysis.score > 0 ? 'bg-green-500' : 'bg-red-500'
                  }`}
                  style={{
                    width: `${Math.abs(analysis.score) * 50}%`,
                    marginLeft: analysis.score > 0 ? '50%' : `${50 - Math.abs(analysis.score) * 50}%`,
                  }}
                />
              </div>
            </div>

            {/* Emotions */}
            {analysis.emotions.length > 0 && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">
                  Detected Emotions
                </h4>
                <div className="flex flex-wrap gap-2">
                  {analysis.emotions.map((emotion, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                    >
                      {emotion}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Concerns */}
            {analysis.concerns.length > 0 && (
              <div className="p-4 bg-yellow-50 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">
                  Identified Concerns
                </h4>
                <ul className="space-y-1">
                  {analysis.concerns.map((concern, idx) => (
                    <li
                      key={idx}
                      className="text-sm text-gray-700 flex items-start gap-2"
                    >
                      <span className="text-yellow-600 mt-1">⚠</span>
                      <span>{concern}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
