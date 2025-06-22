'use client';

import { AnalysisProgress } from '@/lib/types';
import { Loader2 } from 'lucide-react';

interface ProgressIndicatorProps {
  progress: AnalysisProgress;
}

export default function ProgressIndicator({ progress }: ProgressIndicatorProps) {
  const getStageLabel = (stage: AnalysisProgress['stage']) => {
    switch (stage) {
      case 'fetching':
        return 'ページを取得中';
      case 'parsing':
        return 'HTMLを解析中';
      case 'analyzing':
        return 'コンテンツを分析中';
      case 'generating':
        return '結果を生成中';
      default:
        return '処理中';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 text-blue-600 animate-spin mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {getStageLabel(progress.stage)}
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            {progress.currentTask}
          </p>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress.percentage}%` }}
            />
          </div>
          <p className="text-sm text-gray-500">
            {progress.percentage}% 完了
          </p>
        </div>
      </div>
    </div>
  );
}