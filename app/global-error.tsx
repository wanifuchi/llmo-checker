'use client';

import { AlertTriangle, Home, RefreshCw } from 'lucide-react';
import { useEffect } from 'react';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    // グローバルエラーログを記録
    console.error('Global application error:', error);
  }, [error]);

  return (
    <html lang="ja">
      <body>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-red-50 flex items-center justify-center">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto bg-white/80 backdrop-blur-sm shadow-xl rounded-lg border-0">
              <div className="text-center p-8">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-red-500 to-pink-600 shadow-2xl">
                  <AlertTriangle className="h-10 w-10 text-white" />
                </div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  重大なエラーが発生しました
                </h1>
                <p className="text-lg text-gray-600 mb-8">
                  申し訳ございません。アプリケーションで重大なエラーが発生しました。
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={reset}
                    className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-lg font-medium hover:from-red-600 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl"
                  >
                    <RefreshCw className="h-4 w-4" />
                    <span>アプリケーションを再起動</span>
                  </button>
                  <a 
                    href="/"
                    className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
                  >
                    <Home className="h-4 w-4" />
                    <span>ホームに戻る</span>
                  </a>
                </div>
                {process.env.NODE_ENV === 'development' && (
                  <details className="mt-6 text-left">
                    <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                      エラー詳細（開発環境のみ）
                    </summary>
                    <pre className="mt-2 p-4 bg-gray-100 rounded text-xs text-gray-800 overflow-auto">
                      {error.message}
                    </pre>
                  </details>
                )}
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}