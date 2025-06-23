import { AnalysisResult } from '@/lib/types';

export interface ExportOptions {
  format: 'json' | 'pdf';
  filename?: string;
}

/**
 * 解析結果をJSONファイルとしてダウンロードする
 */
export function exportToJSON(result: AnalysisResult, filename?: string): void {
  const dataStr = JSON.stringify(result, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  
  const defaultFilename = `llmo-analysis-${new URL(result.url).hostname}-${formatDateForFilename(result.timestamp)}.json`;
  downloadBlob(dataBlob, filename || defaultFilename);
}

/**
 * 解析結果をPDFレポートとしてダウンロードする
 */
export function exportToPDF(result: AnalysisResult, filename?: string): void {
  // シンプルなHTMLレポートを生成してPDF変換
  const htmlContent = generateHTMLReport(result);
  
  // HTMLをPDFに変換（ブラウザの印刷機能を利用）
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('ポップアップがブロックされました。ポップアップを許可してからもう一度お試しください。');
    return;
  }
  
  printWindow.document.write(htmlContent);
  printWindow.document.close();
  
  // 印刷ダイアログを表示
  printWindow.print();
  
  // 印刷完了後にウィンドウを閉じる
  printWindow.onafterprint = () => {
    printWindow.close();
  };
}

/**
 * 簡易的な解析レポートサマリーをCSV形式でエクスポート
 */
export function exportToCSV(results: AnalysisResult[], filename?: string): void {
  const headers = [
    'URL',
    '解析日時',
    '総合スコア',
    '技術面スコア',
    '構造化データスコア',
'コンテンツスコア',
    'E-E-A-Tスコア',
    'llms.txt',
    'メタタグ最適化',
    'Schema.org実装',
    '内部リンク構造'
  ];
  
  const csvContent = [
    headers.join(','),
    ...results.map(result => [
      `"${result.url}"`,
      new Date(result.timestamp).toLocaleString('ja-JP'),
      result.scores.overall,
      result.scores.technical,
      result.scores.structuredData,
      result.scores.content,
      result.scores.eeat,
      result.details.llmsTxt.exists ? 'あり' : 'なし',
      'N/A', // 技術解析の詳細は現在の型定義にない
      result.details.structuredData.schemas.length > 0 ? '実装済み' : '未実装',
      'N/A' // 内部リンクの詳細は現在の型定義にない
    ].join(','))
  ].join('\n');
  
  const dataBlob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const defaultFilename = `llmo-analysis-summary-${formatDateForFilename(new Date())}.csv`;
  downloadBlob(dataBlob, filename || defaultFilename);
}

/**
 * HTMLレポートを生成する
 */
function generateHTMLReport(result: AnalysisResult): string {
  const hostname = new URL(result.url).hostname;
  const analysisDate = new Date(result.timestamp).toLocaleString('ja-JP');
  
  return `
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LLMO解析レポート - ${hostname}</title>
    <style>
        body {
            font-family: 'Hiragino Sans', 'Yu Gothic', sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 20px;
            color: #333;
        }
        .header {
            border-bottom: 3px solid #3b82f6;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .header h1 {
            color: #1e40af;
            margin: 0;
            font-size: 28px;
        }
        .header .subtitle {
            color: #6b7280;
            margin: 5px 0;
        }
        .site-info {
            background: #f8fafc;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 30px;
        }
        .scores-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .score-card {
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
        }
        .score-value {
            font-size: 32px;
            font-weight: bold;
            margin: 10px 0;
        }
        .score-high { color: #10b981; }
        .score-medium { color: #f59e0b; }
        .score-low { color: #ef4444; }
        .section {
            margin-bottom: 30px;
            page-break-inside: avoid;
        }
        .section h2 {
            color: #1e40af;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 10px;
        }
        .detail-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
        }
        .detail-card {
            background: #f8fafc;
            border-radius: 8px;
            padding: 15px;
        }
        .detail-card h3 {
            margin-top: 0;
            color: #374151;
        }
        .suggestion-list {
            list-style: none;
            padding: 0;
        }
        .suggestion-item {
            background: white;
            border-left: 4px solid #3b82f6;
            margin-bottom: 15px;
            padding: 15px;
            border-radius: 0 8px 8px 0;
        }
        .suggestion-priority {
            font-weight: bold;
            color: #1e40af;
        }
        .suggestion-high { border-left-color: #ef4444; }
        .suggestion-medium { border-left-color: #f59e0b; }
        .suggestion-low { border-left-color: #10b981; }
        @media print {
            body { font-size: 12px; }
            .header h1 { font-size: 24px; }
            .score-value { font-size: 24px; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>LLMO解析レポート</h1>
        <div class="subtitle">AI時代のウェブサイト最適化分析</div>
    </div>

    <div class="site-info">
        <h2>サイト情報</h2>
        <p><strong>URL:</strong> ${result.url}</p>
        <p><strong>ホスト名:</strong> ${hostname}</p>
        <p><strong>解析日時:</strong> ${analysisDate}</p>
    </div>

    <div class="section">
        <h2>スコア概要</h2>
        <div class="scores-grid">
            <div class="score-card">
                <h3>総合スコア</h3>
                <div class="score-value ${getScoreClass(result.scores.overall)}">${result.scores.overall}/100</div>
            </div>
            <div class="score-card">
                <h3>技術面</h3>
                <div class="score-value ${getScoreClass(result.scores.technical)}">${result.scores.technical}/100</div>
            </div>
            <div class="score-card">
                <h3>構造化データ</h3>
                <div class="score-value ${getScoreClass(result.scores.structuredData)}">${result.scores.structuredData}/100</div>
            </div>
            <div class="score-card">
                <h3>コンテンツ構造</h3>
                <div class="score-value ${getScoreClass(result.scores.content)}">${result.scores.content}/100</div>
            </div>
            <div class="score-card">
                <h3>E-E-A-T</h3>
                <div class="score-value ${getScoreClass(result.scores.eeat)}">${result.scores.eeat}/100</div>
            </div>
        </div>
    </div>

    <div class="section">
        <h2>詳細解析結果</h2>
        <div class="detail-grid">
            <div class="detail-card">
                <h3>🤖 llms.txt解析</h3>
                <p><strong>llms.txt:</strong> ${result.details.llmsTxt.exists ? 'あり' : 'なし'}</p>
                <p><strong>構文チェック:</strong> ${result.details.llmsTxt.syntax.valid ? '有効' : 'エラーあり'}</p>
                <p><strong>セクション数:</strong> ${Object.keys(result.details.llmsTxt.content).length}件</p>
            </div>
            
            <div class="detail-card">
                <h3>🔧 技術面解析</h3>
                <p><strong>技術スコア:</strong> ${result.scores.technical}/100</p>
                <p><strong>状態:</strong> 解析完了</p>
                <p><strong>最適化度:</strong> ${result.scores.technical >= 80 ? '高' : result.scores.technical >= 60 ? '中' : '低'}</p>
            </div>

            <div class="detail-card">
                <h3>📊 構造化データ</h3>
                <p><strong>Schema.org:</strong> ${result.details.structuredData.schemas.length}件</p>
                <p><strong>JSON-LD:</strong> ${result.details.structuredData.jsonLdCount}件</p>
                <p><strong>エラー:</strong> ${result.details.structuredData.errors.length}件</p>
            </div>

            <div class="detail-card">
                <h3>📝 コンテンツ構造</h3>
                <p><strong>見出し構造:</strong> ${result.details.content.headingStructure.valid ? '適切' : '要改善'}</p>
                <p><strong>セマンティックHTML:</strong> ${result.details.content.semanticHtml.score}/100</p>
                <p><strong>FAQセクション:</strong> ${result.details.content.faqDetected ? 'あり' : 'なし'}</p>
            </div>

            <div class="detail-card">
                <h3>🏆 E-E-A-T評価</h3>
                <p><strong>著者情報:</strong> ${result.details.eeat.authorInfo.exists ? (result.details.eeat.authorInfo.complete ? '完全' : '部分的') : 'なし'}</p>
                <p><strong>組織情報:</strong> ${result.details.eeat.organizationInfo.exists ? (result.details.eeat.organizationInfo.complete ? '完全' : '部分的') : 'なし'}</p>
                <p><strong>信頼シグナル:</strong> ${result.details.eeat.trustSignals.length}件</p>
            </div>
        </div>
    </div>

    <div class="section">
        <h2>改善提案</h2>
        <ul class="suggestion-list">
            ${result.suggestions.map(suggestion => `
                <li class="suggestion-item suggestion-${suggestion.priority}">
                    <div class="suggestion-priority">[${getPriorityText(suggestion.priority)}] ${suggestion.title}</div>
                    <p>${suggestion.description}</p>
                    ${suggestion.codeExample ? `<div style="background: #f3f4f6; padding: 10px; border-radius: 4px; font-family: monospace; font-size: 11px; margin-top: 10px;"><pre>${suggestion.codeExample}</pre></div>` : ''}
                </li>
            `).join('')}
        </ul>
    </div>

    <div style="margin-top: 50px; text-align: center; color: #6b7280; font-size: 12px;">
        <p>LLMO Analyzer - AI時代のウェブサイト最適化ツール</p>
        <p>レポート生成日時: ${new Date().toLocaleString('ja-JP')}</p>
    </div>
</body>
</html>
  `;
}

/**
 * スコアに応じたCSSクラスを返す
 */
function getScoreClass(score: number): string {
  if (score >= 80) return 'score-high';
  if (score >= 60) return 'score-medium';
  return 'score-low';
}

/**
 * 優先度テキストを返す
 */
function getPriorityText(priority: string): string {
  switch (priority) {
    case 'high': return '高';
    case 'medium': return '中';
    case 'low': return '低';
    default: return priority;
  }
}

/**
 * ファイル名用の日付フォーマット
 */
function formatDateForFilename(date: Date): string {
  return date.toISOString().slice(0, 19).replace(/[T:]/g, '-');
}

/**
 * Blobをダウンロードするヘルパー関数
 */
function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}