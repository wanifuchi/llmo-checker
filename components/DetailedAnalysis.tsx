'use client';

import { AnalysisResult } from '@/lib/types';
import { CheckCircle, XCircle, AlertTriangle, FileText, Code, Search, Users } from 'lucide-react';

interface DetailedAnalysisProps {
  result: AnalysisResult;
}

export default function DetailedAnalysis({ result }: DetailedAnalysisProps) {
  const StatusIcon = ({ status }: { status: 'success' | 'error' | 'warning' }) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* llms.txt解析結果 */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <FileText className="h-6 w-6 text-blue-600 mr-2" />
          <h3 className="text-xl font-semibold text-gray-900">llms.txt解析</h3>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center">
            <StatusIcon status={result.details.llmsTxt.exists ? 'success' : 'error'} />
            <span className="ml-2 text-gray-700">
              {result.details.llmsTxt.exists ? 'llms.txtファイルが存在します' : 'llms.txtファイルが見つかりません'}
            </span>
          </div>
          
          {result.details.llmsTxt.exists && (
            <>
              <div className="flex items-center">
                <StatusIcon status={result.details.llmsTxt.syntax.valid ? 'success' : 'error'} />
                <span className="ml-2 text-gray-700">
                  {result.details.llmsTxt.syntax.valid ? '構文は正しいです' : '構文エラーがあります'}
                </span>
              </div>
              
              {result.details.llmsTxt.syntax.errors.length > 0 && (
                <div className="ml-7 text-sm text-red-600">
                  <ul className="list-disc list-inside">
                    {result.details.llmsTxt.syntax.errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div className="ml-7 text-sm text-gray-600">
                <p>Allowディレクティブ: {result.details.llmsTxt.content.allowed.length}個</p>
                <p>Disallowディレクティブ: {result.details.llmsTxt.content.disallowed.length}個</p>
                <p>サイトマップ: {result.details.llmsTxt.content.sitemaps.length}個</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* 構造化データ解析結果 */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <Code className="h-6 w-6 text-green-600 mr-2" />
          <h3 className="text-xl font-semibold text-gray-900">構造化データ解析</h3>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center">
            <StatusIcon status={result.details.structuredData.jsonLdCount > 0 ? 'success' : 'warning'} />
            <span className="ml-2 text-gray-700">
              JSON-LDスキーマ: {result.details.structuredData.jsonLdCount}個
            </span>
          </div>
          
          {result.details.structuredData.schemas.length > 0 && (
            <div className="ml-7">
              <h4 className="font-medium text-gray-900 mb-2">検出されたスキーマ:</h4>
              <div className="space-y-2">
                {result.details.structuredData.schemas.map((schema, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded">
                    <div>
                      <span className="font-medium">{schema.type}</span>
                      <StatusIcon status={schema.validation.valid ? 'success' : 'error'} />
                    </div>
                    {!schema.validation.valid && (
                      <div className="text-sm text-red-600">
                        不足フィールド: {schema.validation.missingRequired.join(', ')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {result.details.structuredData.errors.length > 0 && (
            <div className="ml-7 text-sm text-red-600">
              <h4 className="font-medium mb-1">エラー:</h4>
              <ul className="list-disc list-inside">
                {result.details.structuredData.errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* コンテンツ構造解析結果 */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <Search className="h-6 w-6 text-purple-600 mr-2" />
          <h3 className="text-xl font-semibold text-gray-900">コンテンツ構造解析</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">見出し構造</h4>
            <div className="flex items-center mb-2">
              <StatusIcon status={result.details.content.headingStructure.valid ? 'success' : 'warning'} />
              <span className="ml-2 text-gray-700">
                {result.details.content.headingStructure.valid ? '適切な構造' : '改善が必要'}
              </span>
            </div>
            {result.details.content.headingStructure.issues.length > 0 && (
              <ul className="text-sm text-gray-600 ml-7 list-disc list-inside">
                {result.details.content.headingStructure.issues.map((issue, index) => (
                  <li key={index}>{issue}</li>
                ))}
              </ul>
            )}
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-2">セマンティックHTML</h4>
            <div className="text-gray-700">
              <p>スコア: {result.details.content.semanticHtml.score}/20</p>
              <p className="text-sm text-gray-600">
                使用されている要素: {result.details.content.semanticHtml.elements.join(', ')}
              </p>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-2">コンテンツ要素</h4>
            <div className="text-gray-700 space-y-1">
              <div className="flex items-center">
                <StatusIcon status={result.details.content.faqDetected ? 'success' : 'warning'} />
                <span className="ml-2">FAQセクション</span>
              </div>
              <div className="flex items-center">
                <StatusIcon status={result.details.content.listElements > 0 ? 'success' : 'warning'} />
                <span className="ml-2">リスト要素: {result.details.content.listElements}個</span>
              </div>
              <div className="flex items-center">
                <StatusIcon status={result.details.content.summarySection ? 'success' : 'warning'} />
                <span className="ml-2">まとめセクション</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* E-E-A-T解析結果 */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <Users className="h-6 w-6 text-orange-600 mr-2" />
          <h3 className="text-xl font-semibold text-gray-900">E-E-A-T評価</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">著者情報</h4>
            <div className="flex items-center mb-1">
              <StatusIcon status={result.details.eeat.authorInfo.exists ? 'success' : 'warning'} />
              <span className="ml-2 text-gray-700">
                {result.details.eeat.authorInfo.exists ? '著者情報あり' : '著者情報なし'}
              </span>
            </div>
            {result.details.eeat.authorInfo.exists && (
              <div className="flex items-center ml-7">
                <StatusIcon status={result.details.eeat.authorInfo.complete ? 'success' : 'warning'} />
                <span className="ml-2 text-sm text-gray-600">
                  {result.details.eeat.authorInfo.complete ? '詳細情報あり' : '詳細情報不足'}
                </span>
              </div>
            )}
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-2">組織情報</h4>
            <div className="flex items-center mb-1">
              <StatusIcon status={result.details.eeat.organizationInfo.exists ? 'success' : 'warning'} />
              <span className="ml-2 text-gray-700">
                {result.details.eeat.organizationInfo.exists ? '組織情報あり' : '組織情報なし'}
              </span>
            </div>
            {result.details.eeat.organizationInfo.exists && (
              <div className="flex items-center ml-7">
                <StatusIcon status={result.details.eeat.organizationInfo.complete ? 'success' : 'warning'} />
                <span className="ml-2 text-sm text-gray-600">
                  {result.details.eeat.organizationInfo.complete ? '連絡先情報あり' : '連絡先情報不足'}
                </span>
              </div>
            )}
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-2">更新情報</h4>
            <div className="flex items-center">
              <StatusIcon status={result.details.eeat.lastUpdated ? 'success' : 'warning'} />
              <span className="ml-2 text-gray-700">
                {result.details.eeat.lastUpdated || '更新日情報なし'}
              </span>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-2">信頼シグナル</h4>
            <div className="text-gray-700">
              {result.details.eeat.trustSignals.length > 0 ? (
                <ul className="text-sm list-disc list-inside">
                  {result.details.eeat.trustSignals.map((signal, index) => (
                    <li key={index}>{signal}</li>
                  ))}
                </ul>
              ) : (
                <span className="text-gray-500">信頼シグナルなし</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}