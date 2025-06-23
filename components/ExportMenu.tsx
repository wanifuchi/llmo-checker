'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Download, 
  FileText, 
  FileJson, 
  Printer,
  Share2,
  Check,
  Copy
} from 'lucide-react';
import { AnalysisResult } from '@/lib/types';
import { exportToJSON, exportToPDF } from '@/lib/utils/export';

interface ExportMenuProps {
  result: AnalysisResult;
  className?: string;
}

export default function ExportMenu({ result, className }: ExportMenuProps) {
  const [copied, setCopied] = useState(false);

  const handleExportJSON = () => {
    exportToJSON(result);
  };

  const handleExportPDF = () => {
    exportToPDF(result);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(result.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('リンクのコピーに失敗しました:', error);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${new URL(result.url).hostname}のLLMO解析結果`,
          text: `LLMOスコア: ${result.scores.overall}/100`,
          url: result.url,
        });
      } catch (error) {
        console.error('共有に失敗しました:', error);
      }
    } else {
      // フォールバック: リンクをコピー
      handleCopyLink();
    }
  };

  return (
    <Card className={`border-0 bg-white/80 backdrop-blur-sm shadow-lg ${className}`}>
      <CardContent className="p-6">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center space-x-2 mb-2">
            <Download className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-semibold text-foreground">解析結果をエクスポート</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* JSON エクスポート */}
            <Button
              onClick={handleExportJSON}
              variant="outline"
              className="flex items-center justify-start space-x-2 h-auto p-4"
            >
              <FileJson className="h-5 w-5 text-blue-600" />
              <div className="text-left">
                <div className="font-medium">JSONファイル</div>
                <div className="text-xs text-muted-foreground">
                  詳細データをダウンロード
                </div>
              </div>
            </Button>

            {/* PDF エクスポート */}
            <Button
              onClick={handleExportPDF}
              variant="outline"
              className="flex items-center justify-start space-x-2 h-auto p-4"
            >
              <FileText className="h-5 w-5 text-red-600" />
              <div className="text-left">
                <div className="font-medium">PDFレポート</div>
                <div className="text-xs text-muted-foreground">
                  印刷用レポートを生成
                </div>
              </div>
            </Button>

            {/* リンクコピー */}
            <Button
              onClick={handleCopyLink}
              variant="outline"
              className="flex items-center justify-start space-x-2 h-auto p-4"
            >
              {copied ? (
                <Check className="h-5 w-5 text-green-600" />
              ) : (
                <Copy className="h-5 w-5 text-gray-600" />
              )}
              <div className="text-left">
                <div className="font-medium">
                  {copied ? 'コピー済み' : 'リンクをコピー'}
                </div>
                <div className="text-xs text-muted-foreground">
                  URLをクリップボードに
                </div>
              </div>
            </Button>

            {/* 共有 */}
            <Button
              onClick={handleShare}
              variant="outline"
              className="flex items-center justify-start space-x-2 h-auto p-4"
            >
              <Share2 className="h-5 w-5 text-purple-600" />
              <div className="text-left">
                <div className="font-medium">共有</div>
                <div className="text-xs text-muted-foreground">
                  結果を他の人と共有
                </div>
              </div>
            </Button>
          </div>

          {/* 追加情報 */}
          <div className="mt-4 p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground">
            <div className="flex items-start space-x-2">
              <Printer className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">エクスポートについて</p>
                <ul className="mt-1 space-y-1 text-xs">
                  <li>• JSONファイルには解析データがすべて含まれます</li>
                  <li>• PDFレポートはブラウザの印刷機能を使用します</li>
                  <li>• 履歴からいつでも再エクスポートできます</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}