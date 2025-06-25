import * as cheerio from 'cheerio';
import { AnalysisResult, LlmsTxtAnalysis, StructuredDataAnalysis, ContentAnalysis, EeatAnalysis, Suggestion } from '@/lib/types';
import { analyzeLlmsTxt } from './llms-analyzer';
import { analyzeStructuredData } from './structured-data-analyzer';
import { analyzeContent } from './content-analyzer';
import { analyzeEeat } from './eeat-analyzer';
import { calculateScores } from './score-calculator';
import { generateSuggestions } from './suggestion-generator';
import { fetchHtmlWithFallback } from '@/lib/utils/html-fetcher';

export async function analyzeUrl(url: string): Promise<AnalysisResult> {
  console.log(`LLMO解析開始: ${url}`);
  
  // HTMLを取得（フォールバック機能付き）
  const html = await fetchHtmlWithFallback(url);
  const $ = cheerio.load(html);
  
  // 並列で各解析を実行
  const [llmsTxt, structuredData, content, eeat] = await Promise.all([
    analyzeLlmsTxt(url),
    analyzeStructuredData($ as any),
    analyzeContent($ as any),
    analyzeEeat($ as any, url)
  ]);
  
  // スコアを計算
  const scores = calculateScores(llmsTxt, structuredData, content, eeat);
  
  // 改善提案を生成
  const suggestions = generateSuggestions(llmsTxt, structuredData, content, eeat);
  
  return {
    url,
    timestamp: new Date(),
    scores,
    details: {
      llmsTxt,
      structuredData,
      content,
      eeat
    },
    suggestions
  };
}

// 旧fetchHtml関数は削除（fetchHtmlWithBrowserを使用）