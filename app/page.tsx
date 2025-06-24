'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import UrlInput from '@/components/UrlInput';
import ProgressIndicator from '@/components/ProgressIndicator';
import ScoreDashboard from '@/components/ScoreDashboard';
import DetailedAnalysis from '@/components/DetailedAnalysis';
import SuggestionsList from '@/components/SuggestionsList';
import HistoryPanel from '@/components/HistoryPanel';
import ExportMenu from '@/components/ExportMenu';
import BatchAnalysis from '@/components/BatchAnalysis';
import CacheInfo from '@/components/CacheInfo';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AnalysisResult, AnalysisProgress, CompetitiveAnalysis } from '@/lib/types';
import { Calendar, Globe, AlertCircle, Users } from 'lucide-react';
import { addToHistory, HistoryItem } from '@/lib/utils/history';
import { getCachedAnalysis, setCachedAnalysis, isCached, getCacheTimeRemainingFormatted } from '@/lib/utils/cache';
import CompetitorInput from '@/components/CompetitorInput';
import CompetitiveAnalysisComponent from '@/components/CompetitiveAnalysis';
import ApiStatusPanel from '@/components/ApiStatusPanel';

export default function Home() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState<AnalysisProgress | null>(null);
  const [results, setResults] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedUrl, setSelectedUrl] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'single' | 'batch' | 'competitive'>('single');
  const [competitiveAnalysis, setCompetitiveAnalysis] = useState<CompetitiveAnalysis | null>(null);
  const [competitorUrls, setCompetitorUrls] = useState<string[]>([]);
  const [isCompetitiveAnalyzing, setIsCompetitiveAnalyzing] = useState(false);

  const handleAnalyze = async (url: string, forceRefresh: boolean = false) => {
    setIsAnalyzing(true);
    setError(null);
    setResults(null);
    
    // キャッシュチェック（強制更新でない場合）
    if (!forceRefresh) {
      const cachedResult = getCachedAnalysis(url);
      if (cachedResult) {
        console.log('キャッシュから結果を取得:', url);
        setResults({
          ...cachedResult,
          fromCache: true,
          cacheTimeRemaining: getCacheTimeRemainingFormatted(url)
        } as any);
        setIsAnalyzing(false);
        return;
      }
    }
    
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
        body: JSON.stringify({ 
          url, 
          bypassCache: forceRefresh 
        }),
      });

      if (!response.ok) {
        throw new Error('解析に失敗しました');
      }

      const data = await response.json();
      setResults(data);
      
      // キャッシュに保存（フォールバックデータでない場合のみ）
      if (!data.isFallbackData) {
        setCachedAnalysis(url, data);
      }
      
      // 履歴に保存
      addToHistory(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '不明なエラーが発生しました');
    } finally {
      setIsAnalyzing(false);
      setProgress(null);
    }
  };

  const handleCompetitiveAnalysis = async () => {
    if (!results || competitorUrls.length === 0) {
      setError('競合分析を実行するには、まずメイン解析を実行し、競合URLを設定してください。');
      return;
    }

    setIsCompetitiveAnalyzing(true);
    setError(null);
    setCompetitiveAnalysis(null);

    try {
      const response = await fetch('/api/competitive-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          targetUrl: results.url,
          targetAnalysis: results,
          competitorUrls
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '競合分析に失敗しました');
      }

      const data = await response.json();
      setCompetitiveAnalysis(data.analysis);
      
      // 競合分析完了後、競合比較タブに自動切り替え
      setTimeout(() => {
        setActiveTab('competitive');
      }, 500);

    } catch (err) {
      console.error('競合分析エラー:', err);
      setError(err instanceof Error ? err.message : '競合分析の処理中にエラーが発生しました');
    } finally {
      setIsCompetitiveAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <Header />
      
      {/* Hero and Input Section */}
      {activeTab === 'single' ? (
        <UrlInput 
          onAnalyze={handleAnalyze} 
          isAnalyzing={isAnalyzing} 
          initialUrl={selectedUrl}
        />
      ) : activeTab === 'batch' ? (
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 py-24">
          <div className="container relative mx-auto px-4">
            <div className="mx-auto max-w-4xl">
              <div className="mb-12 text-center animate-fade-in">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600 shadow-2xl">
                  <Globe className="h-10 w-10 text-white" />
                </div>
                <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground md:text-6xl">
                  一括解析で
                  <span className="gradient-text"> 効率化</span>
                </h1>
                <p className="mx-auto max-w-2xl text-lg text-muted-foreground md:text-xl">
                  複数のURLをまとめて解析し、
                  <br className="hidden md:block" />
                  比較レポートを生成します。
                </p>
              </div>
              <BatchAnalysis onAnalysisComplete={(results) => {
                // 一括解析の結果を履歴に保存
                results.forEach(result => addToHistory(result));
              }} />
            </div>
          </div>
        </div>
      ) : (
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-orange-50 to-red-50 py-24">
          <div className="container relative mx-auto px-4">
            <div className="mx-auto max-w-4xl">
              <div className="mb-12 text-center animate-fade-in">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-orange-500 to-red-600 shadow-2xl">
                  <Users className="h-10 w-10 text-white" />
                </div>
                <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground md:text-6xl">
                  競合比較で
                  <span className="gradient-text"> 優位性発見</span>
                </h1>
                <p className="mx-auto max-w-2xl text-lg text-muted-foreground md:text-xl">
                  競合サイトとの比較分析で、
                  <br className="hidden md:block" />
                  改善ポイントを明確化します。
                </p>
              </div>
              {results ? (
                <div className="space-y-6">
                  <CompetitorInput 
                    onCompetitorsChange={setCompetitorUrls}
                    targetUrl={results.url}
                    industry="other"
                  />
                  {competitorUrls.length > 0 && (
                    <div className="text-center">
                      <button
                        onClick={handleCompetitiveAnalysis}
                        disabled={isCompetitiveAnalyzing}
                        className="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg font-medium hover:from-orange-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                        {isCompetitiveAnalyzing ? '競合分析中...' : '競合分析を実行'}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center p-8 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="text-yellow-600 mb-2">⚠️</div>
                  <p className="text-yellow-800 font-medium">競合分析を実行するには、まず「単発解析」タブでメイン解析を実行してください。</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Tab Navigation */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-center">
          <div className="inline-flex rounded-lg border border-muted p-1 bg-muted/50">
            <button
              onClick={() => setActiveTab('single')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === 'single'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              単発解析
            </button>
            <button
              onClick={() => setActiveTab('batch')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === 'batch'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              一括解析
            </button>
            <button
              onClick={() => setActiveTab('competitive')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === 'competitive'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              競合比較
            </button>
          </div>
        </div>
      </div>
      
      {/* Progress Indicator */}
      {isAnalyzing && progress && activeTab === 'single' && (
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
      
      {/* Competitive Analysis Results */}
      {competitiveAnalysis && activeTab === 'competitive' && (
        <div className="container mx-auto px-4 py-12">
          <CompetitiveAnalysisComponent 
            analysis={competitiveAnalysis} 
            targetAnalysis={results}
          />
        </div>
      )}
      
      {/* Results Section */}
      {results && activeTab === 'single' && (
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
                  <CacheInfo 
                    fromCache={(results as any).fromCache}
                    cacheHit={(results as any).cacheHit}
                    cacheTimeRemaining={(results as any).cacheTimeRemaining}
                  />
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
          
          {/* Export Section */}
          <section className="space-y-6">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold text-foreground">
                解析結果のエクスポート
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                詳細なレポートをダウンロードして、チームと共有しましょう
              </p>
            </div>
            <div className="max-w-2xl mx-auto">
              <ExportMenu result={results} />
            </div>
          </section>
        </div>
      )}
      
      {/* History Panel and API Status */}
      {!isAnalyzing && !results && activeTab === 'single' && (
        <div className="container mx-auto px-4 py-8 space-y-8">
          {/* API状態パネル */}
          <div className="max-w-4xl mx-auto">
            <ApiStatusPanel />
          </div>
          
          {/* 履歴パネル */}
          <HistoryPanel 
            onSelectUrl={(url) => {
              setSelectedUrl(url);
              // URLを設定した後、自動的に解析を開始
              handleAnalyze(url);
            }}
            onSelectHistory={(item: HistoryItem) => {
              if (item.result) {
                setResults(item.result);
              } else {
                setSelectedUrl(item.url);
                handleAnalyze(item.url);
              }
            }}
          />
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