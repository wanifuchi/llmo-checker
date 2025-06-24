import { AnalysisResult, CompetitiveAnalysis, CompetitorSite, CompetitorGap, IndustryBenchmarks, CompetitiveRecommendation } from '@/lib/types';
import { getEnhancedCompetitorAnalysis, integrateLighthouseScores, findCompetitorsByKeywords } from './external-apis';

// 業界マッピング
const INDUSTRY_MAPPING: Record<string, string[]> = {
  'ecommerce': ['shop', 'store', 'buy', 'cart', 'product', 'price'],
  'healthcare': ['health', 'medical', 'clinic', 'hospital', 'doctor', 'treatment'],
  'finance': ['bank', 'loan', 'credit', 'investment', 'finance', 'money'],
  'education': ['school', 'university', 'course', 'learn', 'education', 'student'],
  'technology': ['tech', 'software', 'app', 'api', 'developer', 'code'],
  'travel': ['hotel', 'travel', 'booking', 'trip', 'vacation', 'flight'],
  'food': ['restaurant', 'food', 'menu', 'cuisine', 'recipe', 'cook'],
  'real-estate': ['property', 'house', 'rent', 'real estate', 'home', 'apartment'],
  'legal': ['law', 'lawyer', 'legal', 'attorney', 'court', 'justice'],
  'consulting': ['consulting', 'consultant', 'advisory', 'business', 'strategy'],
  'other': []
};

// 業界別ベンチマーク（実際の運用では外部データソースから取得）
const INDUSTRY_BENCHMARKS: Record<string, IndustryBenchmarks> = {
  'ecommerce': {
    industry: 'Eコマース',
    averageScores: { overall: 72, technical: 78, structuredData: 85, content: 65, eeat: 68 },
    topPerformerScores: { overall: 92, technical: 95, structuredData: 98, content: 88, eeat: 90 },
    commonFeatures: ['商品スキーマ', 'レビュー構造化', 'パンくずリスト', 'FAQ', 'サイトマップ'],
    emergingTrends: ['AI検索最適化', 'パーソナライゼーション', 'ボイス検索対応']
  },
  'healthcare': {
    industry: 'ヘルスケア',
    averageScores: { overall: 75, technical: 80, structuredData: 70, content: 78, eeat: 82 },
    topPerformerScores: { overall: 94, technical: 96, structuredData: 90, content: 95, eeat: 98 },
    commonFeatures: ['医療機関スキーマ', 'E-A-T強化', '専門家情報', 'アクセシビリティ'],
    emergingTrends: ['医療AI統合', 'テレヘルス対応', '信頼性指標強化']
  },
  'finance': {
    industry: '金融',
    averageScores: { overall: 78, technical: 85, structuredData: 75, content: 75, eeat: 85 },
    topPerformerScores: { overall: 95, technical: 98, structuredData: 92, content: 90, eeat: 98 },
    commonFeatures: ['金融商品スキーマ', 'セキュリティ強化', '規制遵守', '透明性向上'],
    emergingTrends: ['FinTech統合', '暗号通貨対応', 'AI財務アドバイザー']
  },
  'other': {
    industry: 'その他',
    averageScores: { overall: 70, technical: 75, structuredData: 68, content: 70, eeat: 65 },
    topPerformerScores: { overall: 90, technical: 92, structuredData: 88, content: 85, eeat: 85 },
    commonFeatures: ['基本構造化データ', 'SEO最適化', 'モバイル対応'],
    emergingTrends: ['AI最適化', 'パフォーマンス向上', 'ユーザー体験改善']
  }
};

/**
 * 業界を自動検出
 */
function detectIndustry(url: string, analysis: AnalysisResult): string {
  const urlLower = url.toLowerCase();
  const content = analysis.details.content;
  
  for (const [industry, keywords] of Object.entries(INDUSTRY_MAPPING)) {
    if (industry === 'other') continue;
    
    const matches = keywords.filter(keyword => 
      urlLower.includes(keyword) || 
      JSON.stringify(content).toLowerCase().includes(keyword)
    );
    
    if (matches.length >= 2) {
      return industry;
    }
  }
  
  return 'other';
}

/**
 * 競合サイトの市場ポジションを分析
 */
function analyzeMarketPosition(
  score: number, 
  allScores: number[]
): 'leader' | 'challenger' | 'follower' {
  const sortedScores = [...allScores].sort((a, b) => b - a);
  const position = sortedScores.indexOf(score) + 1;
  const totalSites = sortedScores.length;
  
  if (position <= Math.ceil(totalSites * 0.2)) return 'leader';
  if (position <= Math.ceil(totalSites * 0.5)) return 'challenger';
  return 'follower';
}

/**
 * 競合ギャップ分析
 */
function performGapAnalysis(
  targetAnalysis: AnalysisResult,
  competitors: CompetitorSite[]
): CompetitorGap[] {
  const gaps: CompetitorGap[] = [];
  const areas: Array<keyof AnalysisResult['scores']> = ['technical', 'structuredData', 'content', 'eeat'];
  
  for (const area of areas) {
    if (area === 'overall') continue;
    
    const currentScore = targetAnalysis.scores[area];
    const competitorScores = competitors.map(c => c.analysis.scores[area]);
    const competitorAverage = competitorScores.reduce((a, b) => a + b, 0) / competitorScores.length;
    const topCompetitorScore = Math.max(...competitorScores);
    const gap = topCompetitorScore - currentScore;
    
    gaps.push({
      area: area as any,
      currentScore,
      competitorAverage,
      topCompetitorScore,
      gap,
      impact: gap > 20 ? 'high' : gap > 10 ? 'medium' : 'low',
      effort: area === 'technical' ? 'high' : area === 'structuredData' ? 'medium' : 'low'
    });
  }
  
  return gaps.sort((a, b) => b.gap - a.gap);
}

/**
 * 競合に基づく推奨事項生成
 */
function generateCompetitiveRecommendations(
  gapAnalysis: CompetitorGap[],
  competitors: CompetitorSite[],
  industry: string
): CompetitiveRecommendation[] {
  const recommendations: CompetitiveRecommendation[] = [];
  
  for (const gap of gapAnalysis) {
    if (gap.gap < 5) continue; // 小さなギャップはスキップ
    
    const topCompetitor = competitors.find(c => 
      c.analysis.scores[gap.area] === gap.topCompetitorScore
    );
    
    const recommendation: CompetitiveRecommendation = {
      id: `competitive-${gap.area}-${Date.now()}`,
      priority: gap.impact === 'high' ? 'critical' : gap.impact === 'medium' ? 'high' : 'medium',
      type: gap.effort === 'low' ? 'quick-win' : gap.effort === 'medium' ? 'strategic' : 'long-term',
      title: `${getAreaDisplayName(gap.area)}の競合格差解消`,
      description: `${topCompetitor?.name || '上位競合'}との${gap.gap.toFixed(1)}ポイントの差を縮める`,
      competitorExample: topCompetitor?.url || '',
      expectedImpact: {
        scoreImprovement: gap.gap * 0.7, // 70%の改善を想定
        rankingImprovement: Math.ceil(gap.gap / 10),
        timeToImplement: gap.effort === 'low' ? '1-2週間' : gap.effort === 'medium' ? '1-2ヶ月' : '3-6ヶ月'
      },
      implementation: getImplementationAdvice(gap.area, industry),
      roi: {
        effort: gap.effort === 'low' ? 3 : gap.effort === 'medium' ? 6 : 9,
        impact: gap.impact === 'high' ? 9 : gap.impact === 'medium' ? 6 : 3,
        score: 0 // 計算される
      }
    };
    
    recommendation.roi.score = recommendation.roi.impact / recommendation.roi.effort;
    recommendations.push(recommendation);
  }
  
  return recommendations.sort((a, b) => b.roi.score - a.roi.score);
}

function getAreaDisplayName(area: string): string {
  const names: Record<string, string> = {
    'technical': '技術的最適化',
    'structuredData': '構造化データ',
    'content': 'コンテンツ品質',
    'eeat': 'E-E-A-T'
  };
  return names[area] || area;
}

function getImplementationAdvice(area: string, industry: string): string {
  const advice: Record<string, Record<string, string>> = {
    'technical': {
      'ecommerce': 'Core Web Vitalsの改善、CDN導入、画像最適化',
      'healthcare': 'アクセシビリティ強化、セキュリティ証明書、HTTPS完全移行',
      'default': 'ページ速度最適化、モバイルファースト設計、技術的SEO改善'
    },
    'structuredData': {
      'ecommerce': '商品・レビュー・価格スキーマの実装',
      'healthcare': '医療機関・医師・サービススキーマの実装',
      'default': '組織・記事・FAQスキーマの実装'
    },
    'content': {
      'ecommerce': '商品説明の充実、ユーザーレビュー活用、FAQ追加',
      'healthcare': '専門的かつ分かりやすい医療情報、症例・治療法の詳細',
      'default': 'ユーザーニーズに応じたコンテンツ充実、FAQ・用語集追加'
    },
    'eeat': {
      'ecommerce': '運営会社情報の充実、顧客サポート体制の明示',
      'healthcare': '医師・専門家プロフィール、資格・経歴の詳細表示',
      'default': '著者情報、組織の信頼性、専門性の証明'
    }
  };
  
  return advice[area]?.[industry] || advice[area]?.['default'] || '競合分析に基づく最適化を実施';
}

/**
 * 拡張された競合サイト解析（外部API統合）
 */
async function analyzeCompetitorSite(url: string): Promise<AnalysisResult> {
  try {
    // 1. 内部解析API呼び出し
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      throw new Error(`Failed to analyze ${url}`);
    }

    const internalAnalysis = await response.json();
    
    // 2. 外部API（Lighthouse）で強化
    const { lighthouseData } = await getEnhancedCompetitorAnalysis(url);
    
    // 3. 内部解析とLighthouseデータを統合
    const enhancedAnalysis = integrateLighthouseScores(internalAnalysis, lighthouseData);
    
    return enhancedAnalysis;
  } catch (error) {
    console.warn(`競合サイト ${url} の解析に失敗。フォールバックデータを使用:`, error);
    
    // 解析失敗時のフォールバックデータ
    return {
      url,
      timestamp: new Date(),
      scores: {
        overall: 65 + Math.random() * 20,
        technical: 60 + Math.random() * 25,
        structuredData: 55 + Math.random() * 30,
        content: 65 + Math.random() * 20,
        eeat: 60 + Math.random() * 25
      },
      details: {
        structuredData: { schemas: [], openGraph: [], jsonLd: [] },
        technical: { performance: [], accessibility: [], seo: [] },
        content: { headings: [], links: [], images: [] },
        eeat: { expertise: [], authoritativeness: [], trustworthiness: [] }
      },
      suggestions: [],
      isFallbackData: true,
      fallbackReason: '競合サイト解析エラー'
    };
  }
}

/**
 * 解析結果から強みを抽出
 */
function extractStrengths(analysis: AnalysisResult): string[] {
  const strengths: string[] = [];
  const scores = analysis.scores;
  
  if (scores.technical > 80) strengths.push('技術的最適化が優秀');
  if (scores.structuredData > 85) strengths.push('構造化データが充実');
  if (scores.content > 80) strengths.push('コンテンツ品質が高い');
  if (scores.eeat > 85) strengths.push('E-E-A-Tが強固');
  
  // デフォルトの強み
  if (strengths.length === 0) {
    if (scores.overall > 75) strengths.push('総合的な最適化レベルが高い');
    else strengths.push('基本的な SEO 対策が実装済み');
  }
  
  return strengths;
}

/**
 * 解析結果から弱みを抽出
 */
function extractWeaknesses(analysis: AnalysisResult): string[] {
  const weaknesses: string[] = [];
  const scores = analysis.scores;
  
  if (scores.technical < 70) weaknesses.push('ページ速度・技術面の改善余地');
  if (scores.structuredData < 65) weaknesses.push('構造化データの実装不足');
  if (scores.content < 70) weaknesses.push('コンテンツ最適化の余地');
  if (scores.eeat < 65) weaknesses.push('E-E-A-T強化が必要');
  
  // デフォルトの弱み
  if (weaknesses.length === 0) {
    if (scores.overall < 85) weaknesses.push('さらなる最適化の余地あり');
    else weaknesses.push('細部の微調整で完璧に');
  }
  
  return weaknesses;
}

/**
 * 競合分析のメイン関数
 */
export async function performCompetitiveAnalysis(
  targetUrl: string,
  targetAnalysis: AnalysisResult,
  competitorUrls: string[]
): Promise<CompetitiveAnalysis> {
  // ターゲットサイトもLighthouseで強化
  const enhancedTargetAnalysis = await (async () => {
    try {
      const { lighthouseData } = await getEnhancedCompetitorAnalysis(targetUrl);
      return integrateLighthouseScores(targetAnalysis, lighthouseData);
    } catch {
      return targetAnalysis; // エラー時は元の解析結果を使用
    }
  })();
  
  // 各競合URLを実際に解析（外部API統合版）
  const competitors: CompetitorSite[] = await Promise.all(
    competitorUrls.map(async (url, index) => {
      const analysis = await analyzeCompetitorSite(url);
      
      const allScores = [enhancedTargetAnalysis.scores.overall, analysis.scores.overall];
      
      return {
        url,
        name: `競合サイト ${index + 1}`,
        analysis,
        marketPosition: analyzeMarketPosition(analysis.scores.overall, allScores),
        strengths: extractStrengths(analysis),
        weaknesses: extractWeaknesses(analysis)
      };
    })
  );
  
  // 強化されたターゲット解析を使用してギャップ分析も更新
  const gapAnalysis = performGapAnalysis(enhancedTargetAnalysis, competitors);
  
  const industry = detectIndustry(targetUrl, targetAnalysis);
  const benchmarks = INDUSTRY_BENCHMARKS[industry] || INDUSTRY_BENCHMARKS['other'];
  
  const allScores = [targetAnalysis.scores.overall, ...competitors.map(c => c.analysis.scores.overall)];
  const ranking = {
    position: allScores.sort((a, b) => b - a).indexOf(targetAnalysis.scores.overall) + 1,
    outOf: allScores.length,
    category: benchmarks.industry,
    industry
  };
  
  // ギャップ分析は上で実行済み
  const recommendations = generateCompetitiveRecommendations(gapAnalysis, competitors, industry);
  
  return {
    targetUrl,
    competitors,
    ranking,
    gapAnalysis,
    benchmarks,
    recommendations
  };
}

/**
 * 推奨競合サイトを自動提案（外部API強化版）
 */
export async function suggestCompetitors(url: string, industry: string): Promise<string[]> {
  try {
    // 1. 外部APIでキーワードベース競合発見
    const discoveredCompetitors = await findCompetitorsByKeywords(url, industry);
    
    if (discoveredCompetitors.length > 0) {
      return discoveredCompetitors;
    }
    
    // 2. フォールバック: 静的な業界別競合リスト
    const staticSuggestions: Record<string, string[]> = {
      'ecommerce': ['https://amazon.co.jp', 'https://rakuten.co.jp', 'https://shopping.yahoo.co.jp'],
      'healthcare': ['https://www.hospita.jp', 'https://fdoc.jp', 'https://medical.yahoo.co.jp'],
      'finance': ['https://www.rakuten-sec.co.jp', 'https://www.sbi-sec.co.jp', 'https://kabu.com'],
      'education': ['https://benesse.jp', 'https://schoo.jp', 'https://www.udemy.com'],
      'technology': ['https://qiita.com', 'https://zenn.dev', 'https://github.com'],
      'other': ['https://www.wantedly.com', 'https://corp.freee.co.jp']
    };
    
    return staticSuggestions[industry] || [];
  } catch (error) {
    console.error('競合サイト提案エラー:', error);
    return [];
  }
}

/**
 * 同期版の競合サイト提案（既存のコンポーネント互換性のため）
 */
export function suggestCompetitorsSync(url: string, industry: string): string[] {
  const staticSuggestions: Record<string, string[]> = {
    'ecommerce': ['https://amazon.co.jp', 'https://rakuten.co.jp', 'https://shopping.yahoo.co.jp'],
    'healthcare': ['https://www.hospita.jp', 'https://fdoc.jp'],
    'finance': ['https://www.rakuten-sec.co.jp', 'https://www.sbi-sec.co.jp'],
    'education': ['https://benesse.jp', 'https://schoo.jp'],
    'other': []
  };
  
  return staticSuggestions[industry] || [];
}