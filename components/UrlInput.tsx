'use client';

import { useState } from 'react';
import { Globe } from 'lucide-react';

interface UrlInputProps {
  onAnalyze: (url: string) => void;
  isAnalyzing?: boolean;
}

export default function UrlInput({ onAnalyze, isAnalyzing = false }: UrlInputProps) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  const validateUrl = (url: string): boolean => {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!url.trim()) {
      setError('URLを入力してください');
      return;
    }

    if (!validateUrl(url)) {
      setError('正しいURL形式で入力してください');
      return;
    }

    onAnalyze(url);
  };

  return (
    <div className="bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            ウェブサイトのLLMO最適化状況をチェック
          </h2>
          <p className="text-lg text-gray-600">
            URLを入力して、AIクローラーへの最適化状況を分析しましょう
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex space-x-2">
            <div className="flex-1 relative">
              <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isAnalyzing}
              />
            </div>
            <button
              type="submit"
              disabled={isAnalyzing}
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isAnalyzing ? '解析中...' : '解析開始'}
            </button>
          </div>
          {error && (
            <p className="text-red-600 text-sm mt-2">{error}</p>
          )}
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          例：https://example.com、https://www.company.jp
        </div>
      </div>
    </div>
  );
}