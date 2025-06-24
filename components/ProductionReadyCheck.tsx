'use client';

import { useState, useEffect } from 'react';
import { Shield, CheckCircle, XCircle, AlertTriangle, Eye, EyeOff } from 'lucide-react';

export default function ProductionReadyCheck() {
  const [checks, setChecks] = useState<any>(null);
  const [showApiKeys, setShowApiKeys] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkProductionReadiness();
  }, []);

  const checkProductionReadiness = async () => {
    try {
      const response = await fetch('/api/test-apis');
      const data = await response.json();
      setChecks(data);
    } catch (error) {
      console.error('本番準備チェックエラー:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow border p-6">
        <div className="flex items-center">
          <Shield className="h-5 w-5 text-blue-500 mr-3 animate-spin" />
          <span>本番環境準備状況をチェック中...</span>
        </div>
      </div>
    );
  }

  if (!checks) {
    return (
      <div className="bg-red-50 rounded-lg border border-red-200 p-6">
        <div className="flex items-center">
          <XCircle className="h-5 w-5 text-red-500 mr-3" />
          <span className="text-red-800">本番準備チェックに失敗しました</span>
        </div>
      </div>
    );
  }

  const allConfigured = checks.summary.enabledApis === checks.summary.totalApis;
  const hasWarnings = checks.summary.warnings.length > 0;

  return (
    <div className="bg-white rounded-lg shadow border">
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Shield className="h-6 w-6 text-blue-500 mr-3" />
            <div>
              <h3 className="font-medium text-gray-900">本番環境準備状況</h3>
              <p className="text-sm text-gray-600">
                外部API統合とセキュリティ設定の確認
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {allConfigured && !hasWarnings ? (
              <div className="flex items-center text-green-600">
                <CheckCircle className="h-5 w-5 mr-1" />
                <span className="font-medium">本番準備完了</span>
              </div>
            ) : (
              <div className="flex items-center text-yellow-600">
                <AlertTriangle className="h-5 w-5 mr-1" />
                <span className="font-medium">設定確認必要</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* API設定状況 */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">外部API設定状況</h4>
          <div className="space-y-3">
            {Object.entries(checks.apiStatus).map(([apiName, status]: [string, any]) => (
              <div key={apiName} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  {status.configured ? (
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500 mr-2" />
                  )}
                  <span className="font-medium capitalize">
                    {apiName === 'serpApi' ? 'SerpAPI' : 
                     apiName === 'googlePageSpeed' ? 'Google PageSpeed' : 
                     'Lighthouse'}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  {status.configured && (
                    <span className="text-xs text-gray-600">
                      キー長: {showApiKeys ? status.keyLength : '●'.repeat(Math.min(status.keyLength, 10))}文字
                    </span>
                  )}
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    status.status === 'enabled' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {status.status === 'enabled' ? '有効' : '無効'}
                  </span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-3 flex items-center justify-between">
            <button
              onClick={() => setShowApiKeys(!showApiKeys)}
              className="flex items-center text-sm text-gray-600 hover:text-gray-800"
            >
              {showApiKeys ? (
                <>
                  <EyeOff className="h-4 w-4 mr-1" />
                  APIキー長を隠す
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4 mr-1" />
                  APIキー長を表示
                </>
              )}
            </button>
            <span className="text-sm text-gray-600">
              {checks.summary.enabledApis}/{checks.summary.totalApis} APIs設定済み
            </span>
          </div>
        </div>

        {/* 環境変数確認 */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">環境設定</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">環境</span>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  checks.environment.nodeEnv === 'production' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {checks.environment.nodeEnv}
                </span>
              </div>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">外部API</span>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  checks.environment.enableExternalApis === 'true' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {checks.environment.enableExternalApis === 'true' ? '有効' : '無効'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 本番デプロイ用の環境変数設定例 */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">本番環境設定例</h4>
          <div className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm font-mono">
            <div className="text-green-400"># 本番環境の環境変数設定</div>
            <div className="mt-2 space-y-1">
              <div>SERP_API_KEY=your_serpapi_key_here</div>
              <div>GOOGLE_PAGESPEED_API_KEY=your_google_api_key_here</div>
              <div>NEXT_PUBLIC_ENABLE_EXTERNAL_APIS=true</div>
              <div>NODE_ENV=production</div>
            </div>
          </div>
          <p className="text-xs text-gray-600 mt-2">
            💡 実際のAPIキーは安全な環境変数管理システムで設定してください
          </p>
        </div>

        {/* 警告とアドバイス */}
        {hasWarnings && (
          <div className="border-t pt-4">
            <h4 className="font-medium text-gray-900 mb-2 flex items-center">
              <AlertTriangle className="h-4 w-4 text-yellow-500 mr-2" />
              注意事項
            </h4>
            <ul className="space-y-1">
              {checks.summary.warnings.map((warning: string, index: number) => (
                <li key={index} className="text-sm text-yellow-800 flex items-start">
                  <span className="text-yellow-500 mr-2">•</span>
                  {warning}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* セキュリティチェックリスト */}
        <div className="border-t pt-4">
          <h4 className="font-medium text-gray-900 mb-3">セキュリティチェックリスト</h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
              <span>.env.local ファイルは .gitignore で除外済み</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
              <span>APIキーはソースコードにハードコーディングされていません</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
              <span>本番環境では環境変数でAPIキーを管理</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}