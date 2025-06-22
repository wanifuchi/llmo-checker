'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import UrlInput from '@/components/UrlInput';
import ProgressIndicator from '@/components/ProgressIndicator';
import ScoreDashboard from '@/components/ScoreDashboard';
import DetailedAnalysis from '@/components/DetailedAnalysis';
import SuggestionsList from '@/components/SuggestionsList';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AnalysisResult, AnalysisProgress } from '@/lib/types';
import { Calendar, Globe, AlertCircle } from 'lucide-react';

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
      // プログレス更新のシミュレーション
      const progressSteps = [
        { stage: 'fetching' as const, percentage: 25, task: 'ウェブページを取得しています...' },
        { stage: 'parsing' as const, percentage: 50, task: 'HTMLコンテンツを解析しています...' },
        { stage: 'analyzing' as const, percentage: 75, task: 'LLMO最適化度を評価中...' },
        { stage: 'generating' as const, percentage: 100, task: '改善提案を生成しています...' }
      ];

      for (const step of progressSteps) {
        setProgress({
          stage: step.stage,
          percentage: step.percentage,
          currentTask: step.task
        });
        await new Promise(resolve => setTimeout(resolve, 800));
      }

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <Header />
      
      {/* Hero and Input Section */}
      <UrlInput onAnalyze={handleAnalyze} isAnalyzing={isAnalyzing} />
      
      {/* Progress Indicator */}
      {isAnalyzing && progress && (
        <ProgressIndicator progress={progress} />
      )}
      
      {/* Error Display */}
      {error && (
        <div className="container mx-auto px-4 py-6">
          <Card className="border-destructive/50 bg-destructive/5">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <AlertCircle className="h-5 w-5 text-destructive" />
                <div>
                  <h3 className="font-semibold text-destructive">解析エラー</h3>
                  <p className="text-sm text-destructive/80">{error}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Results Section */}
      {results && (
        <div className="container mx-auto px-4 py-12 space-y-12">
          {/* Analysis Header */}
          <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-xl">
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                <div>
                  <CardTitle className="text-2xl text-foreground mb-2">
                    解析結果レポート
                  </CardTitle>
                  <p className="text-muted-foreground">
                    AI時代に向けた包括的なウェブサイト最適化分析
                  </p>
                  {(results as any).isFallbackData && (
                    <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
                      ⚠️ サンプルデータを表示中（実解析エラー: {(results as any).fallbackReason}）
                    </div>
                  )}
                </div>
                <div className="flex flex-col space-y-2">
                  <Badge variant="outline" className="flex items-center space-x-2 px-3 py-1">
                    <Globe className="h-3 w-3" />
                    <span className="font-mono text-xs">{results.url}</span>
                  </Badge>
                  <Badge variant="outline" className="flex items-center space-x-2 px-3 py-1">
                    <Calendar className="h-3 w-3" />
                    <span className="text-xs">{new Date(results.timestamp).toLocaleString('ja-JP')}</span>
                  </Badge>
                </div>
              </div>
            </CardHeader>
          </Card>
          
          {/* Score Dashboard */}
          <section className="space-y-6">
            <ScoreDashboard result={results} />
          </section>
          
          {/* Detailed Analysis */}
          <section className="space-y-6">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold text-foreground">
                詳細解析結果
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                各項目の詳細な評価結果と検出された要素
              </p>
            </div>
            <DetailedAnalysis result={results} />
          </section>
          
          {/* Improvement Suggestions */}
          <section className="space-y-6">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold text-foreground">
                AI最適化のための改善提案
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                実装優先度とコードサンプル付きの具体的な改善案
              </p>
            </div>
            <SuggestionsList suggestions={results.suggestions} />
          </section>
        </div>
      )}
      
      {/* Footer */}
      <footer className="border-t bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-muted-foreground">
            <p className="text-sm">
              © 2024 LLMO Analyzer - 次世代AI最適化ツール
            </p>
            <p className="text-xs mt-2">
              Built with ♥ using Next.js, TypeScript, and shadcn/ui
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}