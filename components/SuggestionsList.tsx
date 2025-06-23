'use client';

import { useState } from 'react';
import { Suggestion } from '@/lib/types';
import { ChevronDown, ChevronUp, Copy, CheckCircle } from 'lucide-react';

interface SuggestionsListProps {
  suggestions: Suggestion[];
}

export default function SuggestionsList({ suggestions }: SuggestionsListProps) {
  const [expandedSuggestions, setExpandedSuggestions] = useState<Set<string>>(new Set());
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedSuggestions);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedSuggestions(newExpanded);
  };

  const copyToClipboard = async (code: string, id: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(id);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      console.error('コピーに失敗しました:', err);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high':
        return '高';
      case 'medium':
        return '中';
      case 'low':
        return '低';
      default:
        return priority;
    }
  };

  // 優先度でソート
  const sortedSuggestions = [...suggestions].sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority as keyof typeof priorityOrder] - priorityOrder[a.priority as keyof typeof priorityOrder];
  });

  if (suggestions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center text-green-600">
          <CheckCircle className="h-12 w-12 mx-auto mb-2" />
          <h3 className="text-lg font-semibold">素晴らしい結果です！</h3>
          <p className="text-gray-600">現在のところ改善提案はありません。</p>
        </div>
      </div>
    );
  }

  // 優先度別にグループ化
  const highPriority = sortedSuggestions.filter(s => s.priority === 'high');
  const mediumPriority = sortedSuggestions.filter(s => s.priority === 'medium');
  const lowPriority = sortedSuggestions.filter(s => s.priority === 'low');

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          💡 改善提案 ({suggestions.length}件)
        </h3>
        <p className="text-sm text-gray-600">
          以下の改善を実施することで、AIクローラーによるコンテンツ理解が向上します。
        </p>
      </div>
      
      <div className="space-y-6">
        {highPriority.length > 0 && (
          <div>
            <h4 className="flex items-center text-lg font-medium text-red-700 mb-3">
              <span className="inline-block w-2 h-2 bg-red-500 rounded-full mr-2"></span>
              重要度：高 ({highPriority.length}件)
            </h4>
            <div className="space-y-3">
              {highPriority.map((suggestion) => renderSuggestion(suggestion))}
            </div>
          </div>
        )}
        
        {mediumPriority.length > 0 && (
          <div>
            <h4 className="flex items-center text-lg font-medium text-yellow-700 mb-3">
              <span className="inline-block w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
              重要度：中 ({mediumPriority.length}件)
            </h4>
            <div className="space-y-3">
              {mediumPriority.map((suggestion) => renderSuggestion(suggestion))}
            </div>
          </div>
        )}
        
        {lowPriority.length > 0 && (
          <div>
            <h4 className="flex items-center text-lg font-medium text-green-700 mb-3">
              <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              重要度：低 ({lowPriority.length}件)
            </h4>
            <div className="space-y-3">
              {lowPriority.map((suggestion) => renderSuggestion(suggestion))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  function renderSuggestion(suggestion: Suggestion) {
    const isExpanded = expandedSuggestions.has(suggestion.id);
    
    return (
      <div key={suggestion.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center mb-2">
              <span className="text-sm font-medium text-gray-500">
                🏷️ {suggestion.category}
              </span>
            </div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              {suggestion.title}
            </h4>
            <p className="text-gray-600 mb-3">
              {suggestion.description}
            </p>
            <div className="flex items-center text-sm">
              <span className="text-gray-500 mr-2">⚡ 効果:</span>
              <span className="text-gray-700">
                {suggestion.priority === 'high' && 'AIのコンテンツ認識精度が大幅に向上'}
                {suggestion.priority === 'medium' && 'AIのコンテンツ理解が向上'}
                {suggestion.priority === 'low' && '細かい最適化による品質向上'}
              </span>
            </div>
          </div>
          
          <button
            onClick={() => toggleExpanded(suggestion.id)}
            className="ml-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label={isExpanded ? '閉じる' : '詳細を見る'}
          >
            {isExpanded ? (
              <ChevronUp className="h-5 w-5" />
            ) : (
              <ChevronDown className="h-5 w-5" />
            )}
          </button>
        </div>
        
        {isExpanded && (
          <div className="mt-4 pt-4 border-t">
            <div className="bg-blue-50 p-4 rounded-lg mb-4">
              <h5 className="font-medium text-blue-900 mb-2">🔧 実装方法</h5>
              <p className="text-gray-700">
                {suggestion.implementation}
              </p>
            </div>
            
            {suggestion.codeExample && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-medium text-gray-900">📝 コード例</h5>
                  <button
                    onClick={() => copyToClipboard(suggestion.codeExample!, suggestion.id)}
                    className="flex items-center px-3 py-1.5 text-sm text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                  >
                    {copiedCode === suggestion.id ? (
                      <CheckCircle className="h-4 w-4 mr-1" />
                    ) : (
                      <Copy className="h-4 w-4 mr-1" />
                    )}
                    {copiedCode === suggestion.id ? 'コピー済み' : 'コピー'}
                  </button>
                </div>
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
                  <code>{suggestion.codeExample}</code>
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
}