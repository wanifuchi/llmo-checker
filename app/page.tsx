'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import UrlInput from '@/components/UrlInput';
import ProgressIndicator from '@/components/ProgressIndicator';
import ScoreDashboard from '@/components/ScoreDashboard';
import DetailedAnalysis from '@/components/DetailedAnalysis';
import SuggestionsList from '@/components/SuggestionsList';
import { AnalysisResult, AnalysisProgress } from '@/lib/types';

export default function Home() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState<AnalysisProgress | null>(null);
  const [results, setResults] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async (url: string) => {
    setIsAnalyzing(true);
    setError(null);
    setResults(null);
    setProgress({
      stage: 'fetching',
      percentage: 0,
      currentTask: 'URLにアクセスしています...'
    });

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        throw new Error('解析に失敗しました');
      }

      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '不明なエラーが発生しました');
    } finally {
      setIsAnalyzing(false);
      setProgress(null);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      <UrlInput onAnalyze={handleAnalyze} isAnalyzing={isAnalyzing} />
      
      {isAnalyzing && progress && (
        <ProgressIndicator progress={progress} />
      )}
      
      {error && (
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">エラー: {error}</p>
          </div>
        </div>
      )}
      
      {results && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* 基本情報 */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-2xl font-bold mb-4">解析結果</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <span className="font-medium">URL:</span> {results.url}
              </div>
              <div>
                <span className="font-medium">解析日時:</span> {new Date(results.timestamp).toLocaleString('ja-JP')}
              </div>
            </div>
          </div>
          
          {/* スコアダッシュボード */}
          <ScoreDashboard result={results} />
          
          {/* 詳細解析結果 */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">詳細解析結果</h2>
            <DetailedAnalysis result={results} />
          </div>
          
          {/* 改善提案 */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">改善提案</h2>
            <SuggestionsList suggestions={results.suggestions} />
          </div>
        </div>
      )}
    </main>
  );
}