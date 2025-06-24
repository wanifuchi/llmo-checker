'use client';

import { useState, useEffect } from 'react';
import { Settings, CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';
import { getApiDiagnostics, getConfigSummary } from '@/lib/config/external-apis';

export default function ApiStatusPanel() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [diagnostics, setDiagnostics] = useState<any>(null);
  const [summary, setSummary] = useState<any>(null);

  useEffect(() => {
    // クライアントサイドでのみ設定を読み込み
    const diag = getApiDiagnostics();
    const sum = getConfigSummary();
    setDiagnostics(diag);
    setSummary(sum);
  }, []);

  if (!diagnostics || !summary) {
    return null; // ローディング中は何も表示しない
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'enabled':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'disabled':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'enabled':
        return 'border-green-200 bg-green-50';
      case 'disabled':
        return 'border-red-200 bg-red-50';
      default:
        return 'border-yellow-200 bg-yellow-50';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow border">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center">
          <Settings className="h-5 w-5 text-gray-600 mr-3" />
          <div className="text-left">
            <h3 className="font-medium text-gray-900">外部API統合状況</h3>
            <p className="text-sm text-gray-600">
              {summary.enabledApis}/{summary.totalApis} APIs有効
              {summary.warnings.length > 0 && (
                <span className="ml-2 text-yellow-600">
                  ({summary.warnings.length}件の注意)
                </span>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {summary.enabledApis === summary.totalApis ? (
            <CheckCircle className="h-5 w-5 text-green-500" />
          ) : summary.enabledApis > 0 ? (
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
          ) : (
            <XCircle className="h-5 w-5 text-red-500" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="border-t p-4 space-y-4">
          {/* API別の状況 */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">API別の状況</h4>
            
            {/* SerpAPI */}
            <div className={`p-3 rounded border ${getStatusColor(diagnostics.serpApi.status)}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  {getStatusIcon(diagnostics.serpApi.status)}
                  <span className="ml-2 font-medium">SerpAPI</span>
                  <span className="ml-2 text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                    競合発見
                  </span>
                </div>
                {diagnostics.serpApi.status === 'enabled' && (
                  <span className="text-xs text-green-700 font-medium">月100回無料</span>
                )}
              </div>
              <p className="text-sm text-gray-700">{diagnostics.serpApi.message}</p>
            </div>

            {/* Lighthouse */}
            <div className={`p-3 rounded border ${getStatusColor(diagnostics.lighthouse.status)}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  {getStatusIcon(diagnostics.lighthouse.status)}
                  <span className="ml-2 font-medium">Lighthouse</span>
                  <span className="ml-2 text-xs px-2 py-1 bg-green-100 text-green-800 rounded">
                    無料
                  </span>
                </div>
                <span className="text-xs text-green-700 font-medium">パフォーマンス分析</span>
              </div>
              <p className="text-sm text-gray-700">{diagnostics.lighthouse.message}</p>
            </div>

            {/* Google PageSpeed */}
            <div className={`p-3 rounded border ${getStatusColor(diagnostics.googlePageSpeed.status)}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  {getStatusIcon(diagnostics.googlePageSpeed.status)}
                  <span className="ml-2 font-medium">PageSpeed Insights</span>
                  <span className="ml-2 text-xs px-2 py-1 bg-green-100 text-green-800 rounded">
                    無料
                  </span>
                </div>
                <span className="text-xs text-green-700 font-medium">技術分析</span>
              </div>
              <p className="text-sm text-gray-700">{diagnostics.googlePageSpeed.message}</p>
            </div>
          </div>

          {/* 警告とアドバイス */}
          {summary.warnings.length > 0 && (
            <div className="border-t pt-4">
              <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                <AlertTriangle className="h-4 w-4 text-yellow-500 mr-2" />
                設定の推奨事項
              </h4>
              <ul className="space-y-1">
                {summary.warnings.map((warning: string, index: number) => (
                  <li key={index} className="text-sm text-yellow-800 flex items-start">
                    <span className="text-yellow-500 mr-2">•</span>
                    {warning}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 設定方法の案内 */}
          <div className="border-t pt-4">
            <h4 className="font-medium text-gray-900 mb-2 flex items-center">
              <Info className="h-4 w-4 text-blue-500 mr-2" />
              設定方法
            </h4>
            <div className="text-sm text-gray-700 space-y-2">
              <div>
                <strong>SerpAPI設定:</strong>
                <ol className="list-decimal list-inside ml-2 space-y-1">
                  <li><a href="https://serpapi.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">SerpAPI</a>でアカウント作成</li>
                  <li>APIキーを取得</li>
                  <li><code className="bg-gray-100 px-1 rounded">SERP_API_KEY</code>を環境変数に設定</li>
                </ol>
              </div>
              <div className="text-xs text-gray-600">
                💡 SerpAPIなしでも基本機能は利用可能です。自動競合発見機能のみ制限されます。
              </div>
            </div>
          </div>

          {/* 利用効果 */}
          <div className="border-t pt-4">
            <h4 className="font-medium text-gray-900 mb-2">外部API統合の効果</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                <span>技術スコア精度向上 (70%+)</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                <span>自動競合発見機能</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                <span>パフォーマンス詳細分析</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                <span>改善提案の高精度化</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}