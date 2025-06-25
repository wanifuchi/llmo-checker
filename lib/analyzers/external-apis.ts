import { AnalysisResult } from '@/lib/types';

// Lighthouse API統合
export interface LighthouseResult {
  performance: number;
  accessibility: number;
  bestPractices: number;
  seo: number;
  pwa?: number;
  metrics: {
    firstContentfulPaint: number;
    largestContentfulPaint: number;
    cumulativeLayoutShift: number;
    speedIndex: number;
  };
  opportunities: Array<{
    id: string;
    title: string;
    description: string;
    score: number;
    numericValue: number;
  }>;
}

// Google検索結果の型定義
export interface SearchResult {
  title: string;
  url: string;
  description: string;
  position: number;
}

// SerpAPI結果の型定義
export interface SerpApiResult {
  organicResults: SearchResult[];
  peopleAlsoAsk?: string[];
  relatedSearches?: string[];
}

/**
 * Lighthouse APIを使用してサイトの詳細分析
 */
export async function getLighthouseAnalysis(url: string): Promise<LighthouseResult | null> {
  try {
    // Google PageSpeed Insights API (無料)
    const apiKey = process.env.GOOGLE_PAGESPEED_API_KEY;
    const baseUrl = `https://www.googleapis.com/pagespeed/v5/runPagespeed?url=${encodeURIComponent(url)}&strategy=desktop&category=performance&category=accessibility&category=best-practices&category=seo`;
    const apiUrl = apiKey ? `${baseUrl}&key=${apiKey}` : baseUrl;
    
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      console.warn(`Lighthouse分析失敗: ${url}`);
      return null;
    }
    
    const data = await response.json();
    const lighthouse = data.lighthouseResult;
    
    return {
      performance: Math.round(lighthouse.categories.performance.score * 100),
      accessibility: Math.round(lighthouse.categories.accessibility.score * 100),
      bestPractices: Math.round(lighthouse.categories['best-practices'].score * 100),
      seo: Math.round(lighthouse.categories.seo.score * 100),
      metrics: {
        firstContentfulPaint: lighthouse.audits['first-contentful-paint']?.numericValue || 0,
        largestContentfulPaint: lighthouse.audits['largest-contentful-paint']?.numericValue || 0,
        cumulativeLayoutShift: lighthouse.audits['cumulative-layout-shift']?.numericValue || 0,
        speedIndex: lighthouse.audits['speed-index']?.numericValue || 0,
      },
      opportunities: Object.values(lighthouse.audits)
        .filter((audit: any) => audit.score !== null && audit.score < 1)
        .map((audit: any) => ({
          id: audit.id,
          title: audit.title,
          description: audit.description,
          score: audit.score,
          numericValue: audit.numericValue || 0
        }))
        .slice(0, 5) // 上位5つの改善点
    };
  } catch (error) {
    console.error('Lighthouse API エラー:', error);
    return null;
  }
}

/**
 * キーワードベースで競合サイトを発見
 */
export async function findCompetitorsByKeywords(targetUrl: string, industry: string): Promise<string[]> {
  try {
    // 業界キーワードから検索クエリを生成
    const queries = generateSearchQueries(targetUrl, industry);
    const competitors = new Set<string>();
    
    for (const query of queries.slice(0, 2)) { // 最初の2つのクエリのみ実行
      const results = await searchGoogle(query);
      results.slice(0, 5).forEach(result => {
        const domain = extractDomain(result.url);
        if (domain && domain !== extractDomain(targetUrl) && isValidCompetitor(result.url)) {
          competitors.add(result.url);
        }
      });
    }
    
    return Array.from(competitors).slice(0, 5);
  } catch (error) {
    console.error('競合サイト発見エラー:', error);
    return [];
  }
}

/**
 * 検索クエリ生成
 */
function generateSearchQueries(targetUrl: string, industry: string): string[] {
  const baseQueries = {
    'ecommerce': ['オンラインショッピング', 'ネット通販', 'EC サイト'],
    'healthcare': ['医療 クリニック', 'ヘルスケア', '病院 予約'],
    'finance': ['金融 サービス', '投資 証券', 'ローン 銀行'],
    'education': ['オンライン学習', '教育 スクール', 'eラーニング'],
    'technology': ['IT サービス', 'ソフトウェア開発', 'アプリ 開発'],
    'funeral': ['葬儀社', '葬式 サービス', '斎場 葬儀', '家族葬', '一般葬'],
    'ending': ['終活 サービス', 'エンディング', '生前整理', '相続 手続き', 'シニア サポート'],
    'cemetery': ['霊園', '墓地 販売', '永代供養', '納骨堂', '樹木葬'],
    'buddhist': ['仏壇 販売', '仏具 通販', '位牌 制作', '数珠 専門店', '線香 販売'],
    'other': ['ビジネス サービス', '企業 サイト', 'サービス 比較']
  };
  
  return baseQueries[industry as keyof typeof baseQueries] || baseQueries.other;
}

/**
 * Google検索（スクレイピング代替）
 */
async function searchGoogle(query: string): Promise<SearchResult[]> {
  try {
    // 実際の実装では適切なスクレイピングライブラリまたはSerpAPIを使用
    // ここでは模擬データを返す（実装時に実際のAPIに置き換え）
    
    // SerpAPI無料枠を使用する場合の例
    const serpApiKey = process.env.SERP_API_KEY;
    if (serpApiKey) {
      const url = `https://serpapi.com/search.json?q=${encodeURIComponent(query)}&api_key=${serpApiKey}&num=10`;
      const response = await fetch(url);
      
      if (response.ok) {
        const data = await response.json();
        return data.organic_results?.map((result: any, index: number) => ({
          title: result.title,
          url: result.link,
          description: result.snippet,
          position: index + 1
        })) || [];
      }
    }
    
    // フォールバック: 業界別の既知競合サイト
    return getKnownCompetitors(query);
  } catch (error) {
    console.error('Google検索エラー:', error);
    return [];
  }
}

/**
 * 既知の競合サイト（フォールバック）
 */
function getKnownCompetitors(query: string): SearchResult[] {
  const knownSites: Record<string, SearchResult[]> = {
    'オンラインショッピング': [
      { title: 'Amazon.co.jp', url: 'https://amazon.co.jp', description: '大手ECサイト', position: 1 },
      { title: '楽天市場', url: 'https://rakuten.co.jp', description: '総合ECモール', position: 2 },
      { title: 'Yahoo!ショッピング', url: 'https://shopping.yahoo.co.jp', description: 'Yahoo!のECサイト', position: 3 }
    ],
    'ヘルスケア': [
      { title: '病院検索ホスピタ', url: 'https://www.hospita.jp', description: '病院検索サイト', position: 1 },
      { title: 'EPARKクリニック・病院', url: 'https://fdoc.jp', description: 'クリニック予約', position: 2 }
    ],
    '葬儀社': [
      { title: '小さなお葬式', url: 'https://www.osohshiki.jp', description: '低価格葬儀サービス', position: 1 },
      { title: 'イオンのお葬式', url: 'https://www.sousai-sougi.com', description: 'イオングループ葬儀', position: 2 },
      { title: 'ティア', url: 'https://www.tear.co.jp', description: '愛知県大手葬儀社', position: 3 },
      { title: '公益社', url: 'https://www.koekisha.co.jp', description: '関西大手葬儀社', position: 4 }
    ],
    '終活 サービス': [
      { title: 'ライフドット', url: 'https://www.lifedot.jp', description: '終活総合サイト', position: 1 },
      { title: 'エンディングノート', url: 'https://www.ending-note.com', description: 'エンディングノート配布', position: 2 },
      { title: 'ミライセルフ', url: 'https://www.miraiself.com', description: '終活サポート', position: 3 }
    ],
    '霊園': [
      { title: 'いいお墓', url: 'https://www.e-ohaka.com', description: '霊園・墓地検索', position: 1 },
      { title: '墓石・霊園検索', url: 'https://www.boseki.net', description: '全国霊園検索', position: 2 },
      { title: 'お墓探しならお墓さがし', url: 'https://www.ohaka-sagashi.com', description: '霊園・墓地紹介', position: 3 }
    ],
    '仏壇 販売': [
      { title: '仏壇・仏具の滝田商店', url: 'https://www.takita-corp.co.jp', description: '仏壇仏具専門店', position: 1 },
      { title: '仏壇仏具のメモリアルアート', url: 'https://www.memorial-art.jp', description: '現代仏壇専門', position: 2 },
      { title: 'はせがわ', url: 'https://www.hasegawa-gb.co.jp', description: '全国展開仏壇店', position: 3 }
    ]
  };
  
  // クエリに含まれるキーワードで検索
  for (const [key, sites] of Object.entries(knownSites)) {
    if (query.includes(key)) {
      return sites;
    }
  }
  
  return [];
}

/**
 * ドメイン抽出
 */
function extractDomain(url: string): string | null {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    return null;
  }
}

/**
 * 有効な競合サイトかチェック
 */
function isValidCompetitor(url: string): boolean {
  const domain = extractDomain(url);
  if (!domain) return false;
  
  // 除外ドメイン
  const excludedDomains = [
    'google.com', 'youtube.com', 'facebook.com', 'twitter.com',
    'instagram.com', 'linkedin.com', 'wikipedia.org'
  ];
  
  return !excludedDomains.some(excluded => domain.includes(excluded));
}

/**
 * 拡張された競合分析（Lighthouse + 検索ベース）
 */
export async function getEnhancedCompetitorAnalysis(
  url: string, 
  industry: string = 'other'
): Promise<{
  competitors: string[];
  lighthouseData: LighthouseResult | null;
}> {
  const [competitors, lighthouseData] = await Promise.all([
    findCompetitorsByKeywords(url, industry),
    getLighthouseAnalysis(url)
  ]);
  
  return {
    competitors,
    lighthouseData
  };
}

/**
 * Lighthouse結果を内部スコアに統合
 */
export function integrateLighthouseScores(
  internalAnalysis: AnalysisResult,
  lighthouseData: LighthouseResult | null
): AnalysisResult {
  if (!lighthouseData) {
    return internalAnalysis;
  }
  
  // Lighthouseスコアで技術スコアを強化
  const enhancedTechnicalScore = Math.round(
    (internalAnalysis.scores.technical * 0.6) + 
    (lighthouseData.performance * 0.4)
  );
  
  // SEOスコアも統合
  const enhancedSeoScore = Math.round(
    (internalAnalysis.scores.content * 0.7) + 
    (lighthouseData.seo * 0.3)
  );
  
  // アクセシビリティスコアで全体を底上げ
  const accessibilityBonus = lighthouseData.accessibility > 90 ? 5 : 0;
  
  return {
    ...internalAnalysis,
    scores: {
      ...internalAnalysis.scores,
      technical: Math.min(100, enhancedTechnicalScore + accessibilityBonus),
      content: Math.min(100, enhancedSeoScore),
      overall: Math.round(
        (enhancedTechnicalScore + 
         internalAnalysis.scores.structuredData + 
         enhancedSeoScore + 
         internalAnalysis.scores.eeat + 
         accessibilityBonus) / 4
      )
    },
    // Lighthouse改善提案を追加
    suggestions: [
      ...internalAnalysis.suggestions,
      ...lighthouseData.opportunities.map(opp => ({
        id: `lighthouse-${opp.id}`,
        priority: opp.score < 0.5 ? 'high' : 'medium' as 'high' | 'medium' | 'low',
        category: 'technical' as const,
        title: `パフォーマンス改善: ${opp.title}`,
        description: opp.description,
        implementation: 'Lighthouse推奨の最適化手法を実装',
        effort: opp.score < 0.3 ? 'high' : 'medium' as 'high' | 'medium' | 'low',
        impact: opp.numericValue > 1000 ? 'high' : 'medium' as 'high' | 'medium' | 'low',
        codeExample: '',
        resources: ['https://web.dev/performance/'],
        roi: {
          effort: opp.score < 0.3 ? 8 : 5,
          impact: opp.numericValue > 1000 ? 9 : 6,
          score: 0
        }
      }))
    ]
  };
}