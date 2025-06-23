'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Trash2, 
  Play, 
  Pause, 
  Download,
  AlertTriangle,
  CheckCircle,
  Clock,
  Globe
} from 'lucide-react';
import { AnalysisResult } from '@/lib/types';
import { exportToCSV } from '@/lib/utils/export';

interface BatchAnalysisProps {
  onAnalysisComplete?: (results: AnalysisResult[]) => void;
}

interface BatchItem {
  id: string;
  url: string;
  status: 'pending' | 'analyzing' | 'completed' | 'error';
  result?: AnalysisResult;
  error?: string;
}

export default function BatchAnalysis({ onAnalysisComplete }: BatchAnalysisProps) {
  const [urls, setUrls] = useState<BatchItem[]>([]);
  const [newUrl, setNewUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const addUrl = () => {
    if (!newUrl.trim()) return;
    
    try {
      new URL(newUrl); // URL形式チェック
      const newItem: BatchItem = {
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
        url: newUrl.trim(),
        status: 'pending'
      };
      setUrls(prev => [...prev, newItem]);
      setNewUrl('');
    } catch {
      alert('正しいURL形式で入力してください');
    }
  };

  const removeUrl = (id: string) => {
    setUrls(prev => prev.filter(item => item.id !== id));
  };

  const clearAll = () => {
    if (confirm('すべてのURLを削除しますか？')) {
      setUrls([]);
      setCurrentIndex(0);
    }
  };

  const startBatchAnalysis = async () => {
    if (urls.length === 0) return;
    
    setIsAnalyzing(true);
    setCurrentIndex(0);

    const updatedUrls = [...urls];

    for (let i = 0; i < updatedUrls.length; i++) {
      setCurrentIndex(i);
      
      // 現在のアイテムを解析中に設定
      updatedUrls[i].status = 'analyzing';
      setUrls([...updatedUrls]);

      try {
        const response = await fetch('/api/analyze', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url: updatedUrls[i].url }),
        });

        if (!response.ok) {
          throw new Error('解析に失敗しました');
        }

        const result = await response.json();
        updatedUrls[i].result = result;
        updatedUrls[i].status = 'completed';
      } catch (error) {
        updatedUrls[i].error = error instanceof Error ? error.message : '不明なエラー';
        updatedUrls[i].status = 'error';
      }

      setUrls([...updatedUrls]);
      
      // 1秒間隔で解析（サーバー負荷軽減）
      if (i < updatedUrls.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    setIsAnalyzing(false);
    
    // 完了した結果をコールバック
    const completedResults = updatedUrls
      .filter(item => item.result)
      .map(item => item.result!);
    
    if (onAnalysisComplete && completedResults.length > 0) {
      onAnalysisComplete(completedResults);
    }
  };

  const stopAnalysis = () => {
    setIsAnalyzing(false);
  };

  const exportResults = () => {
    const completedResults = urls
      .filter(item => item.result)
      .map(item => item.result!);
    
    if (completedResults.length > 0) {
      exportToCSV(completedResults, `batch-analysis-${Date.now()}.csv`);
    }
  };

  const getStatusIcon = (status: BatchItem['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-gray-400" />;
      case 'analyzing':
        return <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: BatchItem['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">待機中</Badge>;
      case 'analyzing':
        return <Badge variant="default">解析中</Badge>;
      case 'completed':
        return <Badge variant="outline" className="border-green-500 text-green-700">完了</Badge>;
      case 'error':
        return <Badge variant="destructive">エラー</Badge>;
      default:
        return null;
    }
  };

  const completedCount = urls.filter(item => item.status === 'completed').length;
  const errorCount = urls.filter(item => item.status === 'error').length;

  return (
    <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl">一括解析</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              複数のURLを順次解析してレポートを生成
            </p>
          </div>
          {urls.length > 0 && (
            <div className="text-right text-sm text-muted-foreground">
              <div>総数: {urls.length}件</div>
              <div>完了: {completedCount}件 / エラー: {errorCount}件</div>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* URL追加フォーム */}
        <div className="flex space-x-2">
          <div className="flex-1">
            <input
              type="text"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addUrl()}
              placeholder="https://example.com"
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              disabled={isAnalyzing}
            />
          </div>
          <Button
            onClick={addUrl}
            disabled={isAnalyzing || !newUrl.trim()}
            size="sm"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* URLリスト */}
        {urls.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">解析対象URL ({urls.length}件)</h3>
              <div className="flex space-x-2">
                <Button
                  onClick={clearAll}
                  disabled={isAnalyzing}
                  variant="ghost"
                  size="sm"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  すべて削除
                </Button>
                {completedCount > 0 && (
                  <Button
                    onClick={exportResults}
                    variant="outline"
                    size="sm"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    結果をエクスポート
                  </Button>
                )}
              </div>
            </div>
            
            <div className="max-h-60 overflow-y-auto space-y-2 border rounded-lg p-2 bg-muted/20">
              {urls.map((item, index) => (
                <div
                  key={item.id}
                  className={`flex items-center justify-between p-3 rounded-lg border bg-background transition-all ${
                    isAnalyzing && index === currentIndex ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    {getStatusIcon(item.status)}
                    <Globe className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{new URL(item.url).hostname}</p>
                      <p className="text-xs text-muted-foreground truncate">{item.url}</p>
                      {item.error && (
                        <p className="text-xs text-red-600 mt-1">{item.error}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    {item.result && (
                      <Badge variant="outline" className="text-xs">
                        {item.result.scores.overall}/100
                      </Badge>
                    )}
                    {getStatusBadge(item.status)}
                    {!isAnalyzing && (
                      <Button
                        onClick={() => removeUrl(item.id)}
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 実行ボタン */}
        {urls.length > 0 && (
          <div className="flex justify-center">
            {!isAnalyzing ? (
              <Button
                onClick={startBatchAnalysis}
                size="lg"
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                <Play className="h-4 w-4 mr-2" />
                一括解析を開始 ({urls.filter(item => item.status === 'pending').length}件)
              </Button>
            ) : (
              <Button
                onClick={stopAnalysis}
                variant="destructive"
                size="lg"
              >
                <Pause className="h-4 w-4 mr-2" />
                解析を停止
              </Button>
            )}
          </div>
        )}

        {/* 進捗表示 */}
        {isAnalyzing && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>解析進捗</span>
              <span>{currentIndex + 1} / {urls.length}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / urls.length) * 100}%` }}
              />
            </div>
            <p className="text-sm text-muted-foreground text-center">
              現在解析中: {urls[currentIndex]?.url}
            </p>
          </div>
        )}

        {/* 使い方ガイド */}
        {urls.length === 0 && (
          <div className="text-center p-6 bg-muted/30 rounded-lg">
            <Globe className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <h3 className="font-medium mb-2">一括解析で効率的にチェック</h3>
            <p className="text-sm text-muted-foreground mb-4">
              複数のURLを登録して、まとめて解析できます
            </p>
            <ul className="text-xs text-muted-foreground text-left space-y-1 max-w-md mx-auto">
              <li>• 上の入力欄にURLを入力して追加</li>
              <li>• 一度に最大20件まで解析可能</li>
              <li>• 結果はCSVファイルでダウンロード</li>
              <li>• 解析は1件ずつ順次実行</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}