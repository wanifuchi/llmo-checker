'use client';

import { useState } from 'react';
import { Search, Sparkles, RefreshCw, Target } from 'lucide-react';
import { findCompetitorsByKeywords } from '@/lib/analyzers/external-apis';

interface AutoCompetitorDiscoveryProps {
  targetUrl: string;
  industry: string;
  onCompetitorsFound: (competitors: string[]) => void;
  disabled?: boolean;
}

export default function AutoCompetitorDiscovery({
  targetUrl,
  industry,
  onCompetitorsFound,
  disabled = false
}: AutoCompetitorDiscoveryProps) {
  const [isSearching, setIsSearching] = useState(false);
  const [discoveredCompetitors, setDiscoveredCompetitors] = useState<string[]>([]);
  const [lastSearchTime, setLastSearchTime] = useState<Date | null>(null);

  const handleAutoDiscovery = async () => {
    if (!targetUrl || isSearching) return;

    setIsSearching(true);
    try {
      const competitors = await findCompetitorsByKeywords(targetUrl, industry);
      setDiscoveredCompetitors(competitors);
      setLastSearchTime(new Date());
      
      if (competitors.length > 0) {
        onCompetitorsFound(competitors);
      }
    } catch (error) {
      console.error('自動競合発見エラー:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const canSearch = !disabled && !isSearching && targetUrl;
  const hasRecent = lastSearchTime && (Date.now() - lastSearchTime.getTime()) < 300000; // 5分以内

  return (
    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <div className="p-2 bg-purple-500 rounded-full mr-3">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div>
            <h4 className="font-medium text-purple-900">AI競合発見</h4>
            <p className="text-sm text-purple-700">
              自動的に業界の競合サイトを発見します
            </p>
          </div>
        </div>
        
        <button
          onClick={handleAutoDiscovery}
          disabled={!canSearch}
          className={`px-4 py-2 rounded-lg font-medium text-sm flex items-center transition-all ${
            canSearch
              ? 'bg-purple-600 text-white hover:bg-purple-700 shadow-md hover:shadow-lg'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isSearching ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              検索中...
            </>
          ) : (
            <>
              <Search className="h-4 w-4 mr-2" />
              競合を発見
            </>
          )}
        </button>
      </div>

      {/* 検索ステータス */}
      {hasRecent && !isSearching && (
        <div className="text-sm text-purple-600 mb-3">
          ✅ {lastSearchTime.toLocaleTimeString()}に検索完了
          {discoveredCompetitors.length > 0 && ` - ${discoveredCompetitors.length}サイト発見`}
        </div>
      )}

      {/* 発見された競合サイト */}
      {discoveredCompetitors.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm font-medium text-purple-800">
            発見された競合サイト ({discoveredCompetitors.length}件)
          </div>
          <div className="space-y-1">
            {discoveredCompetitors.slice(0, 3).map((competitor, index) => (
              <div key={index} className="flex items-center p-2 bg-white rounded border border-purple-200">
                <Target className="h-3 w-3 text-purple-500 mr-2" />
                <span className="text-sm text-gray-700 flex-1">{competitor}</span>
                <span className="text-xs text-purple-600 font-medium">
                  {industry}業界
                </span>
              </div>
            ))}
            {discoveredCompetitors.length > 3 && (
              <div className="text-xs text-purple-600 text-center py-1">
                他 {discoveredCompetitors.length - 3} サイト
              </div>
            )}
          </div>
        </div>
      )}

      {/* 使用方法の説明 */}
      <div className="mt-3 p-2 bg-purple-100 rounded text-xs text-purple-700">
        <div className="font-medium mb-1">💡 使用方法</div>
        <ul className="list-disc list-inside space-y-1">
          <li>業界キーワードで検索結果から競合を自動抽出</li>
          <li>発見した競合は自動的に競合リストに追加されます</li>
          <li>外部API制限により、5分間隔での実行を推奨</li>
        </ul>
      </div>

      {/* エラー状態 */}
      {!targetUrl && (
        <div className="mt-2 p-2 bg-yellow-100 border border-yellow-300 rounded text-sm text-yellow-800">
          ⚠️ 競合発見には、まずメインサイトの解析が必要です
        </div>
      )}
    </div>
  );
}