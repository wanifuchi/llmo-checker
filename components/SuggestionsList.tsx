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

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-6">
        改善提案 ({suggestions.length}件)
      </h3>
      
      <div className="space-y-4">
        {sortedSuggestions.map((suggestion) => {
          const isExpanded = expandedSuggestions.has(suggestion.id);
          
          return (
            <div key={suggestion.id} className="border rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(suggestion.priority)}`}>
                      優先度: {getPriorityLabel(suggestion.priority)}
                    </span>
                    <span className="ml-2 text-sm text-gray-500">
                      {suggestion.category}
                    </span>
                  </div>
                  <h4 className="text-lg font-medium text-gray-900 mb-1">
                    {suggestion.title}
                  </h4>
                  <p className="text-gray-600 mb-2">
                    {suggestion.description}
                  </p>
                </div>
                
                <button
                  onClick={() => toggleExpanded(suggestion.id)}
                  className="ml-4 p-1 text-gray-400 hover:text-gray-600"
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
                  <h5 className="font-medium text-gray-900 mb-2">実装方法:</h5>
                  <p className="text-gray-700 mb-4">
                    {suggestion.implementation}
                  </p>
                  
                  {suggestion.codeExample && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium text-gray-900">コード例:</h5>
                        <button
                          onClick={() => copyToClipboard(suggestion.codeExample!, suggestion.id)}
                          className="flex items-center px-3 py-1 text-sm text-blue-600 hover:text-blue-800 border border-blue-200 rounded hover:bg-blue-50"
                        >
                          {copiedCode === suggestion.id ? (
                            <CheckCircle className="h-4 w-4 mr-1" />
                          ) : (
                            <Copy className="h-4 w-4 mr-1" />
                          )}
                          {copiedCode === suggestion.id ? 'コピー済み' : 'コピー'}
                        </button>
                      </div>
                      <pre className="bg-gray-50 p-3 rounded text-sm overflow-x-auto">
                        <code>{suggestion.codeExample}</code>
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}