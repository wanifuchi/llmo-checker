'use client';

import { useState } from 'react';
import { Plus, X, Search, Sparkles } from 'lucide-react';
import { suggestCompetitorsSync } from '@/lib/analyzers/competitor-utils';
import AutoCompetitorDiscovery from './AutoCompetitorDiscovery';

interface CompetitorInputProps {
  onCompetitorsChange: (competitors: string[]) => void;
  targetUrl?: string;
  industry?: string;
}

export default function CompetitorInput({ onCompetitorsChange, targetUrl, industry }: CompetitorInputProps) {
  const [competitors, setCompetitors] = useState<string[]>([]);
  const [newCompetitor, setNewCompetitor] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const addCompetitor = () => {
    if (newCompetitor.trim() && !competitors.includes(newCompetitor.trim())) {
      const updatedCompetitors = [...competitors, newCompetitor.trim()];
      setCompetitors(updatedCompetitors);
      onCompetitorsChange(updatedCompetitors);
      setNewCompetitor('');
    }
  };

  const removeCompetitor = (index: number) => {
    const updatedCompetitors = competitors.filter((_, i) => i !== index);
    setCompetitors(updatedCompetitors);
    onCompetitorsChange(updatedCompetitors);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addCompetitor();
    }
  };

  const addSuggestedCompetitor = (url: string) => {
    if (!competitors.includes(url)) {
      const updatedCompetitors = [...competitors, url];
      setCompetitors(updatedCompetitors);
      onCompetitorsChange(updatedCompetitors);
    }
  };

  const getSuggestions = () => {
    if (!industry) return [];
    return suggestCompetitorsSync(targetUrl || '', industry).filter(url => !competitors.includes(url));
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center mb-4">
        <Search className="h-6 w-6 text-blue-600 mr-2" />
        <h3 className="text-xl font-semibold text-gray-900">競合サイト設定</h3>
      </div>

      <div className="space-y-4">
        {/* 競合URL入力 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            競合サイトURL
          </label>
          <div className="flex gap-2">
            <input
              type="url"
              value={newCompetitor}
              onChange={(e) => setNewCompetitor(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="https://example.com"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={addCompetitor}
              disabled={!newCompetitor.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            最大5サイトまで設定可能です
          </p>
        </div>

        {/* 追加された競合サイト一覧 */}
        {competitors.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              設定済み競合サイト ({competitors.length}/5)
            </label>
            <div className="space-y-2">
              {competitors.map((competitor, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                  <span className="text-sm text-gray-700">{competitor}</span>
                  <button
                    onClick={() => removeCompetitor(index)}
                    className="p-1 text-red-500 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI競合発見機能 */}
        <AutoCompetitorDiscovery
          targetUrl={targetUrl || ''}
          industry={industry || 'other'}
          onCompetitorsFound={(discoveredCompetitors) => {
            // 発見された競合を既存リストに追加（重複除去）
            const newCompetitors = discoveredCompetitors.filter(url => !competitors.includes(url));
            const updatedCompetitors = [...competitors, ...newCompetitors].slice(0, 5);
            setCompetitors(updatedCompetitors);
            onCompetitorsChange(updatedCompetitors);
          }}
          disabled={competitors.length >= 5}
        />

        {/* 推奨競合サイト */}
        {industry && getSuggestions().length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                {industry === 'funeral' && '葬儀業界推奨サイト'}
                {industry === 'ending' && 'エンディング業界推奨サイト'}
                {industry === 'cemetery' && '霊園・墓石業界推奨サイト'}
                {industry === 'buddhist' && '仏壇・仏具業界推奨サイト'}
                {!['funeral', 'ending', 'cemetery', 'buddhist'].includes(industry) && '業界別推奨サイト'}
              </label>
              <button
                onClick={() => setShowSuggestions(!showSuggestions)}
                className="flex items-center text-xs text-gray-600 hover:text-gray-800"
              >
                <Sparkles className="h-3 w-3 mr-1" />
                {industry === 'other' ? '汎用リスト' : '業界特化リスト'}
              </button>
            </div>
            
            {showSuggestions && (
              <div className="space-y-2">
                {getSuggestions().slice(0, 3).map((suggestion, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md border border-gray-200">
                    <div>
                      <span className="text-sm font-medium text-gray-800">{suggestion}</span>
                      <div className="text-xs text-gray-600">
                        {industry}業界の代表的サイト
                      </div>
                    </div>
                    <button
                      onClick={() => addSuggestedCompetitor(suggestion)}
                      disabled={competitors.length >= 5}
                      className="px-3 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      追加
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 使用上の注意 */}
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <div className="flex items-start">
            <div className="text-yellow-600 mr-2">⚠️</div>
            <div className="text-sm text-yellow-800">
              <div className="font-medium mb-1">競合分析の注意事項</div>
              <ul className="list-disc list-inside space-y-1">
                <li>競合サイトの解析には数分かかる場合があります</li>
                <li>アクセスできないサイトは分析対象から除外されます</li>
                <li>同業界の主要サイトを選択することで、より有用な分析結果が得られます</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}