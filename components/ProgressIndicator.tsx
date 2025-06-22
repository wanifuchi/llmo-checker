'use client';

import { AnalysisProgress } from '@/lib/types';
import { Brain, Database, Search, Zap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface ProgressIndicatorProps {
  progress: AnalysisProgress;
}

export default function ProgressIndicator({ progress }: ProgressIndicatorProps) {
  const getStageInfo = (stage: AnalysisProgress['stage']) => {
    switch (stage) {
      case 'fetching':
        return {
          icon: Database,
          label: 'ページを取得中',
          description: 'ウェブサイトのコンテンツをダウンロードしています',
          color: 'text-blue-500'
        };
      case 'parsing':
        return {
          icon: Search,
          label: 'HTMLを解析中', 
          description: 'ページ構造と要素を詳細に分析しています',
          color: 'text-green-500'
        };
      case 'analyzing':
        return {
          icon: Brain,
          label: 'AI解析実行中',
          description: 'LLMO最適化度をAIアルゴリズムで評価中',
          color: 'text-purple-500'
        };
      case 'generating':
        return {
          icon: Zap,
          label: '結果を生成中',
          description: '改善提案とスコアレポートを作成しています',
          color: 'text-orange-500'
        };
      default:
        return {
          icon: Brain,
          label: '処理中',
          description: '解析を実行しています',
          color: 'text-gray-500'
        };
    }
  };

  const stageInfo = getStageInfo(progress.stage);
  const Icon = stageInfo.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <Card className="mx-4 w-full max-w-md animate-scale-in border-0 bg-white/95 shadow-2xl backdrop-blur-xl">
        <CardContent className="p-8">
          <div className="flex flex-col items-center space-y-6">
            {/* Animated Icon */}
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 opacity-20 blur-md animate-pulse"></div>
              <div className={`relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600 ${stageInfo.color}`}>
                <Icon className="h-8 w-8 text-white animate-pulse" />
              </div>
            </div>

            {/* Status Text */}
            <div className="text-center space-y-2">
              <h3 className="text-xl font-semibold text-foreground">
                {stageInfo.label}
              </h3>
              <p className="text-sm text-muted-foreground">
                {stageInfo.description}
              </p>
              <p className="text-xs text-muted-foreground font-mono">
                {progress.currentTask}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="w-full space-y-2">
              <Progress 
                value={progress.percentage} 
                className="h-3 bg-secondary"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>進捗状況</span>
                <span className="font-semibold">
                  {progress.percentage}% 完了
                </span>
              </div>
            </div>

            {/* Stage Indicators */}
            <div className="flex w-full justify-between">
              {['fetching', 'parsing', 'analyzing', 'generating'].map((stage, index) => {
                const isActive = stage === progress.stage;
                const isCompleted = ['fetching', 'parsing', 'analyzing', 'generating'].indexOf(progress.stage) > index;
                
                return (
                  <div
                    key={stage}
                    className={`h-2 w-2 rounded-full transition-all duration-300 ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 scale-150'
                        : isCompleted
                        ? 'bg-green-500'
                        : 'bg-secondary'
                    }`}
                  />
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}