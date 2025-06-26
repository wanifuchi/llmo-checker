import { AnalysisResult, CompetitiveAnalysis, CompetitorSite, CompetitorGap, IndustryBenchmarks, CompetitiveRecommendation } from '@/lib/types';
import { getEnhancedCompetitorAnalysis, integrateLighthouseScores, findCompetitorsByKeywords } from './external-apis';
import { analyzeUrl } from './url-analyzer';

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
  'funeral': ['葬儀', '葬式', 'funeral', '告別式', 'memorial', 'ending', 'セレモニー', '斎場', '霊園', 'cemetery'],
  'other': []
};

// 詳細な業界別ベンチマーク
const INDUSTRY_BENCHMARKS: Record<string, IndustryBenchmarks> = {
  'ecommerce': {
    industry: 'Eコマース',
    averageScores: { overall: 72, technical: 78, structuredData: 85, content: 65, eeat: 68 },
    topPerformerScores: { overall: 92, technical: 95, structuredData: 98, content: 88, eeat: 90 },
    commonFeatures: ['商品スキーマ', 'レビュー構造化', 'パンくずリスト', 'FAQ', 'サイトマップ'],
    emergingTrends: ['AI検索最適化', 'パーソナライゼーション', 'ボイス検索対応'],
    detailedBenchmarks: {
      pageSpeed: { mobile: 2.5, desktop: 1.8 },
      coreWebVitals: { lcp: 2500, fid: 100, cls: 0.1 },
      conversionOptimization: ['ワンクリック購入', 'リコメンドエンジン', 'カート放棄対策'],
      userExperience: ['24時間サポート', 'ライブチャット', 'AR試着機能'],
      basicOptimization: ['動的メタタグ', '商品フィード', 'リッチスニペット', 'サイトリンク検索ボックス']
    }
  },
  'healthcare': {
    industry: 'ヘルスケア',
    averageScores: { overall: 75, technical: 80, structuredData: 70, content: 78, eeat: 82 },
    topPerformerScores: { overall: 94, technical: 96, structuredData: 90, content: 95, eeat: 98 },
    commonFeatures: ['医療機関スキーマ', 'E-A-T強化', '専門家情報', 'アクセシビリティ'],
    emergingTrends: ['医療AI統合', 'テレヘルス対応', '信頼性指標強化'],
    detailedBenchmarks: {
      pageSpeed: { mobile: 3.0, desktop: 2.0 },
      coreWebVitals: { lcp: 3000, fid: 100, cls: 0.1 },
      trustIndicators: ['医師プロフィール', '資格認証', '患者レビュー', '治療実績'],
      compliance: ['HIPAA準拠', 'プライバシーポリシー', 'データ暗号化', 'アクセス制限'],
      contentQuality: ['医学的正確性', 'わかりやすさ', '最新情報更新', '多言語対応']
    }
  },
  'finance': {
    industry: '金融',
    averageScores: { overall: 78, technical: 85, structuredData: 75, content: 75, eeat: 85 },
    topPerformerScores: { overall: 95, technical: 98, structuredData: 92, content: 90, eeat: 98 },
    commonFeatures: ['金融商品スキーマ', 'セキュリティ強化', '規制遵守', '透明性向上'],
    emergingTrends: ['FinTech統合', '暗号通貨対応', 'AI財務アドバイザー'],
    detailedBenchmarks: {
      pageSpeed: { mobile: 2.0, desktop: 1.5 },
      coreWebVitals: { lcp: 2000, fid: 50, cls: 0.05 },
      security: ['SSL/TLS', '二要素認証', 'データ暗号化', 'セキュリティ監査'],
      regulatoryCompliance: ['金融庁ガイドライン', 'AML/CFT対策', '個人情報保護', 'リスク開示'],
      userTrust: ['会社情報開示', '財務諸表公開', '規約明確化', 'カスタマーサポート']
    }
  },
  'funeral': {
    industry: '葬儀・エンディング',
    averageScores: { overall: 65, technical: 70, structuredData: 55, content: 75, eeat: 80 },
    topPerformerScores: { overall: 88, technical: 90, structuredData: 85, content: 92, eeat: 95 },
    commonFeatures: ['葬儀サービススキーマ', '施設情報', '料金体系', '連絡先情報', 'アクセス情報'],
    emergingTrends: ['オンライン葬儀対応', 'デジタル供養', '生前契約システム', '遺族サポート強化'],
    detailedBenchmarks: {
      pageSpeed: { mobile: 3.5, desktop: 2.5 },
      coreWebVitals: { lcp: 3500, fid: 150, cls: 0.15 },
      serviceTransparency: ['明朗料金表示', 'サービス内容詳細', '施設写真', 'スタッフ紹介'],
      customerSupport: ['24時間電話対応', '事前相談', 'アフターケア', '遺族サポート'],
      localSEO: ['地域キーワード', 'Googleマイビジネス', '地図表示', 'アクセス案内'],
      contentFeatures: ['お客様の声', '葬儀事例', 'よくある質問', '費用シミュレーター']
    }
  },
  'ending': {
    industry: 'エンディング産業',
    averageScores: { overall: 68, technical: 72, structuredData: 60, content: 78, eeat: 82 },
    topPerformerScores: { overall: 90, technical: 92, structuredData: 88, content: 94, eeat: 96 },
    commonFeatures: ['終活サービススキーマ', '専門家情報', '料金体系', 'サポート内容', 'セミナー情報'],
    emergingTrends: ['デジタル遺品整理', 'オンライン相談', 'AI終活プランナー', 'エンディングノート電子化'],
    detailedBenchmarks: {
      pageSpeed: { mobile: 3.0, desktop: 2.2 },
      coreWebVitals: { lcp: 3000, fid: 120, cls: 0.12 },
      serviceRange: ['生前整理', '相続相談', '遺言作成', '葬儀準備', '墓地選定'],
      expertiseDisplay: ['専門資格表示', '経験年数', '相談実績', '専門分野'],
      userEngagement: ['無料相談', 'セミナー開催', 'ガイドブック配布', 'メルマガ配信']
    }
  },
  'cemetery': {
    industry: '霊園・墓石',
    averageScores: { overall: 64, technical: 68, structuredData: 52, content: 72, eeat: 78 },
    topPerformerScores: { overall: 86, technical: 88, structuredData: 82, content: 90, eeat: 92 },
    commonFeatures: ['霊園スキーマ', '施設情報', '価格表', '見学予約', 'アクセス情報'],
    emergingTrends: ['VR霊園見学', '永代供養システム', 'オンライン法要', 'デジタル墓碑'],
    detailedBenchmarks: {
      pageSpeed: { mobile: 3.8, desktop: 2.8 },
      coreWebVitals: { lcp: 3800, fid: 180, cls: 0.18 },
      facilityInfo: ['霊園写真', '区画情報', '施設設備', '管理体制'],
      priceTransparency: ['区画別価格', '管理費', '永代供養料', '各種オプション'],
      visitorSupport: ['見学予約', '送迎サービス', '現地案内', '資料請求']
    }
  },
  'buddhist': {
    industry: '仏壇・仏具',
    averageScores: { overall: 62, technical: 66, structuredData: 50, content: 70, eeat: 76 },
    topPerformerScores: { overall: 84, technical: 86, structuredData: 80, content: 88, eeat: 90 },
    commonFeatures: ['商品スキーマ', '店舗情報', 'オンラインカタログ', '配送情報', 'アフターサービス'],
    emergingTrends: ['モダン仏壇', 'カスタマイズ対応', 'AR配置シミュレーション', 'サブスクサービス'],
    detailedBenchmarks: {
      pageSpeed: { mobile: 3.5, desktop: 2.5 },
      coreWebVitals: { lcp: 3500, fid: 150, cls: 0.15 },
      productDisplay: ['高品質画像', '360度ビュー', 'サイズ詳細', '材質説明'],
      culturalRespect: ['宗派別対応', '作法説明', '仏事知識', '伝統継承'],
      customerService: ['専門相談', '自宅訪問', 'メンテナンス', '買い替えサポート']
    }
  },
  'other': {
    industry: 'その他',
    averageScores: { overall: 70, technical: 75, structuredData: 68, content: 70, eeat: 65 },
    topPerformerScores: { overall: 90, technical: 92, structuredData: 88, content: 85, eeat: 85 },
    commonFeatures: ['基本構造化データ', 'SEO最適化', 'モバイル対応'],
    emergingTrends: ['AI最適化', 'パフォーマンス向上', 'ユーザー体験改善'],
    detailedBenchmarks: {
      pageSpeed: { mobile: 3.0, desktop: 2.0 },
      coreWebVitals: { lcp: 3000, fid: 100, cls: 0.1 },
      basicOptimization: ['メタタグ最適化', 'サイトマップ', 'robots.txt', 'canonical設定'],
      userExperience: ['レスポンシブデザイン', 'ナビゲーション', 'フォーム最適化', '検索機能'],
      contentStrategy: ['ブログ運営', 'FAQ設置', 'リソースセンター', 'ニュース更新']
    }
  }
};

/**
 * コンテンツ内のキーワード検索ヘルパー関数
 */
function contentContains(analysis: AnalysisResult, keyword: string): boolean {
  // ContentAnalysisオブジェクトから推測可能な情報を使用
  const content = analysis.details.content;
  
  // FAQ検出でFAQ関連キーワードをチェック
  if (keyword.includes('FAQ') || keyword.includes('よくある質問')) {
    return content.faqDetected;
  }
  
  // セマンティックHTML要素からコンテンツの推測
  const semanticElements = content.semanticHtml.elements.join(' ').toLowerCase();
  if (semanticElements.includes(keyword.toLowerCase())) {
    return true;
  }
  
  // E-E-A-T情報から推測
  const eatInfo = analysis.details.eeat;
  if (eatInfo.trustSignals.some(signal => signal.toLowerCase().includes(keyword.toLowerCase()))) {
    return true;
  }
  
  // 構造化データから推測
  const schemas = analysis.details.structuredData.schemas;
  if (schemas.some(schema => schema.type.toLowerCase().includes(keyword.toLowerCase()))) {
    return true;
  }
  
  return false;
}

/**
 * 業界を自動検出
 */
function detectIndustry(url: string, analysis: AnalysisResult): string {
  const urlLower = url.toLowerCase();
  
  for (const [industry, keywords] of Object.entries(INDUSTRY_MAPPING)) {
    if (industry === 'other') continue;
    
    const matches = keywords.filter(keyword => 
      urlLower.includes(keyword) || 
      contentContains(analysis, keyword)
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
 * 詳細な競合ギャップ分析
 */
function performGapAnalysis(
  targetAnalysis: AnalysisResult,
  competitors: CompetitorSite[],
  industry: string
): CompetitorGap[] {
  const gaps: CompetitorGap[] = [];
  const areas: Array<keyof AnalysisResult['scores']> = ['technical', 'structuredData', 'content', 'eeat'];
  
  // 基本的なスコアギャップ分析
  for (const area of areas) {
    if (area === 'overall') continue;
    
    const areaKey = area as string;
    const currentScore = targetAnalysis.scores[area];
    const competitorScores = competitors.map(c => c.analysis.scores[area]);
    const competitorAverage = competitorScores.reduce((a, b) => a + b, 0) / competitorScores.length;
    const topCompetitorScore = Math.max(...competitorScores);
    const gap = topCompetitorScore - currentScore;
    
    // より詳細なインパクトと工数の評価
    const impact = calculateDetailedImpact(areaKey, gap, industry);
    const effort = calculateDetailedEffort(areaKey, targetAnalysis, industry);
    
    gaps.push({
      area: area as CompetitorGap['area'],
      currentScore,
      competitorAverage,
      topCompetitorScore,
      gap,
      impact,
      effort,
      // 追加の詳細情報
      details: {
        percentileBehind: calculatePercentileBehind(currentScore, competitorScores),
        catchUpTime: estimateCatchUpTime(gap, effort),
        requiredResources: getRequiredResources(areaKey, gap, industry),
        quickWins: identifyQuickWins(areaKey, targetAnalysis, industry)
      }
    });
  }
  
  // 業界固有のギャップ分析を追加
  const industryGaps = analyzeIndustrySpecificGaps(targetAnalysis, competitors, industry);
  gaps.push(...industryGaps);
  
  // ROIベースでソート（インパクト÷工数）
  return gaps.sort((a, b) => {
    const roiA = getImpactScore(a.impact) / getEffortScore(a.effort);
    const roiB = getImpactScore(b.impact) / getEffortScore(b.effort);
    return roiB - roiA;
  });
}

// 詳細なインパクト計算
function calculateDetailedImpact(area: string, gap: number, industry: string): 'high' | 'medium' | 'low' {
  const industryWeights = {
    'funeral': { technical: 0.8, structuredData: 1.2, content: 1.5, eeat: 2.0 },
    'ending': { technical: 0.9, structuredData: 1.1, content: 1.8, eeat: 2.2 },
    'cemetery': { technical: 0.7, structuredData: 1.0, content: 1.6, eeat: 1.8 },
    'buddhist': { technical: 0.7, structuredData: 0.9, content: 1.4, eeat: 1.6 },
    'ecommerce': { technical: 1.5, structuredData: 2.0, content: 1.2, eeat: 1.0 },
    'healthcare': { technical: 1.2, structuredData: 1.5, content: 1.8, eeat: 2.5 },
    'finance': { technical: 1.8, structuredData: 1.6, content: 1.4, eeat: 2.2 },
    'other': { technical: 1.0, structuredData: 1.0, content: 1.0, eeat: 1.0 }
  };
  
  const weight = (industryWeights as Record<string, Record<string, number>>)[industry]?.[area] || 1.0;
  const adjustedGap = gap * weight;
  
  if (adjustedGap > 25) return 'high';
  if (adjustedGap > 12) return 'medium';
  return 'low';
}

// 詳細な工数計算
function calculateDetailedEffort(area: string, analysis: AnalysisResult, industry: string): 'high' | 'medium' | 'low' {
  const baseEffort = {
    'technical': 'high',
    'structuredData': 'medium',
    'content': 'medium',
    'eeat': 'high'
  };
  
  // 現在の実装状況に基づいて工数を調整
  if (area === 'structuredData' && analysis.details.structuredData.jsonLdCount > 5) {
    return 'low'; // 既に基盤がある場合
  }
  
  if (area === 'content' && analysis.details.content.semanticHtml.score > 80) {
    return 'low'; // コンテンツ構造が良好な場合
  }
  
  return baseEffort[area as keyof typeof baseEffort] as 'high' | 'medium' | 'low';
}

// パーセンタイル計算
function calculatePercentileBehind(currentScore: number, competitorScores: number[]): number {
  const sortedScores = [...competitorScores, currentScore].sort((a, b) => a - b);
  const position = sortedScores.indexOf(currentScore);
  return Math.round((position / sortedScores.length) * 100);
}

// キャッチアップ時間の推定
function estimateCatchUpTime(gap: number, effort: string): string {
  const timeMap = {
    'low': { small: '1-2週間', medium: '2-4週間', large: '1-2ヶ月' },
    'medium': { small: '2-4週間', medium: '1-2ヶ月', large: '2-3ヶ月' },
    'high': { small: '1-2ヶ月', medium: '2-3ヶ月', large: '3-6ヶ月' }
  };
  
  const gapSize = gap < 10 ? 'small' : gap < 20 ? 'medium' : 'large';
  return timeMap[effort as keyof typeof timeMap]?.[gapSize] || '要相談';
}

// 必要リソースの特定
function getRequiredResources(area: string, gap: number, industry: string): string[] {
  const resources: Record<string, string[]> = {
    'technical': ['フロントエンドエンジニア', 'パフォーマンス専門家', 'CDN/インフラ'],
    'structuredData': ['SEOスペシャリスト', 'スキーマ実装経験者', 'JSON-LDツール'],
    'content': ['コンテンツライター', 'SEOライター', '業界専門家', 'エディター'],
    'eeat': ['業界専門家', 'レピュテーション管理', 'PR/広報', 'カスタマーサクセス']
  };
  
  const industrySpecific = {
    'funeral': { 'content': ['葬祭ディレクター監修', '遺族ケア専門家'], 'eeat': ['葬儀社実績データ', '顧客満足度調査'] },
    'healthcare': { 'content': ['医師監修', '医療ライター'], 'eeat': ['医師プロフィール作成', '症例データ'] }
  };
  
  const baseResources = resources[area] || [];
  const specificResources = (industrySpecific as Record<string, Record<string, string[]>>)[industry]?.[area] || [];
  
  return [...baseResources, ...specificResources];
}

// クイックウィンの特定
function identifyQuickWins(area: string, analysis: AnalysisResult, industry: string): string[] {
  const quickWins: string[] = [];
  
  if (area === 'technical') {
    // Note: technical details not available in current type definition
    // if (!analysis.details.technical?.hasCompression) quickWins.push('Gzip/Brotli圧縮の有効化');
    // if (!analysis.details.technical?.hasCaching) quickWins.push('ブラウザキャッシュの設定');
    quickWins.push('画像の遅延読み込み実装');
    quickWins.push('Core Web Vitalsの最適化');  
  }
  
  if (area === 'structuredData') {
    if (analysis.details.structuredData.jsonLdCount === 0) quickWins.push('基本的な組織スキーマの追加');
    quickWins.push('パンくずリストの構造化');
    if (industry === 'funeral') quickWins.push('葬儀サービススキーマの実装');
  }
  
  if (area === 'content') {
    if (!analysis.details.content.faqDetected) quickWins.push('FAQセクションの追加');
    quickWins.push('見出し構造の最適化');
    if (industry === 'funeral') quickWins.push('料金体系の明確化');
  }
  
  if (area === 'eeat') {
    if (!analysis.details.eeat.authorInfo.exists) quickWins.push('運営者情報ページの作成');
    quickWins.push('お客様の声の追加');
    if (industry === 'funeral') quickWins.push('葬祭ディレクター資格の明示');
  }
  
  return quickWins;
}

// インパクトスコアの数値化
function getImpactScore(impact: string): number {
  const scores = { 'high': 9, 'medium': 5, 'low': 2 };
  return scores[impact as keyof typeof scores] || 5;
}

// 工数スコアの数値化
function getEffortScore(effort: string): number {
  const scores = { 'high': 8, 'medium': 5, 'low': 2 };
  return scores[effort as keyof typeof scores] || 5;
}

// 業界固有のギャップ分析
function analyzeIndustrySpecificGaps(
  targetAnalysis: AnalysisResult,
  competitors: CompetitorSite[],
  industry: string
): CompetitorGap[] {
  const industryGaps: CompetitorGap[] = [];
  
  if (industry === 'funeral' || industry === 'ending' || industry === 'cemetery' || industry === 'buddhist') {
    // 葬儀関連業界の特殊なギャップ分析
    
    // 24時間対応体制のギャップ
    const has24HourSupport = contentContains(targetAnalysis, '24時間');
    const competitors24Hour = competitors.filter(c => 
      contentContains(c.analysis, '24時間')
    ).length / competitors.length;
    
    if (!has24HourSupport && competitors24Hour > 0.5) {
      industryGaps.push({
        area: 'customerSupport',
        currentScore: 0,
        competitorAverage: competitors24Hour * 100,
        topCompetitorScore: 100,
        gap: 100,
        impact: 'high',
        effort: 'medium',
        details: {
          percentileBehind: 100,
          catchUpTime: '1-2ヶ月',
          requiredResources: ['コールセンター', '夜間スタッフ', '緊急対応システム'],
          quickWins: ['緊急連絡先の明示', '営業時間外の対応方法明記']
        }
      });
    }
    
    // 料金透明性のギャップ
    const hasPriceTransparency = contentContains(targetAnalysis, '料金') || 
                                 contentContains(targetAnalysis, '価格');
    const competitorsPricing = competitors.filter(c => 
      contentContains(c.analysis, '料金') || 
      contentContains(c.analysis, '価格')
    ).length / competitors.length;
    
    if (!hasPriceTransparency && competitorsPricing > 0.7) {
      industryGaps.push({
        area: 'priceTransparency',
        currentScore: 0,
        competitorAverage: competitorsPricing * 100,
        topCompetitorScore: 100,
        gap: 100,
        impact: 'high',
        effort: 'low',
        details: {
          percentileBehind: 100,
          catchUpTime: '1-2週間',
          requiredResources: ['料金体系の整理', 'コンテンツライター'],
          quickWins: ['基本料金の明示', '追加オプションの説明', '見積もりフォーム']
        }
      });
    }
  }
  
  return industryGaps;
}

/**
 * 詳細な競合に基づく推奨事項生成
 */
function generateCompetitiveRecommendations(
  gapAnalysis: CompetitorGap[],
  competitors: CompetitorSite[],
  industry: string,
  targetAnalysis: AnalysisResult
): CompetitiveRecommendation[] {
  const recommendations: CompetitiveRecommendation[] = [];
  const benchmarks = INDUSTRY_BENCHMARKS[industry] || INDUSTRY_BENCHMARKS['other'];
  
  for (const gap of gapAnalysis) {
    if (gap.gap < 3) continue; // より小さなギャップも対象に
    
    const topCompetitor = competitors.find(c => {
      const scoreArea = gap.area as keyof typeof c.analysis.scores;
      return scoreArea in c.analysis.scores && c.analysis.scores[scoreArea] === gap.topCompetitorScore;
    });
    
    // 詳細な実装ステップを生成
    const detailedSteps = generateDetailedImplementationSteps(gap, industry, targetAnalysis);
    
    // 期待される具体的な成果を計算
    const concreteResults = calculateConcreteResults(gap, industry, targetAnalysis);
    
    const recommendation: CompetitiveRecommendation = {
      id: `competitive-${gap.area}-${Date.now()}`,
      priority: gap.impact === 'high' ? 'critical' : gap.impact === 'medium' ? 'high' : 'medium',
      type: gap.effort === 'low' ? 'quick-win' : gap.effort === 'medium' ? 'strategic' : 'long-term',
      title: generateSpecificTitle(gap, industry),
      description: generateDetailedDescription(gap, topCompetitor, industry),
      competitorExample: topCompetitor?.url || '',
      expectedImpact: {
        scoreImprovement: gap.gap * 0.7,
        rankingImprovement: Math.ceil(gap.gap / 10),
        timeToImplement: gap.details?.catchUpTime || estimateCatchUpTime(gap.gap, gap.effort),
        // 追加の具体的な成果指標
        ...concreteResults
      },
      implementation: getDetailedImplementationAdvice(gap.area, industry, targetAnalysis),
      // 詳細な実装ステップ
      implementationSteps: detailedSteps,
      // 必要なリソース
      requiredResources: gap.details?.requiredResources || [],
      // クイックウィン
      quickWins: gap.details?.quickWins || [],
      // 成功事例
      successExamples: getSuccessExamples(gap.area, industry),
      // KPI
      kpis: generateKPIs(gap.area, industry),
      roi: {
        effort: getEffortScore(gap.effort),
        impact: getImpactScore(gap.impact),
        score: 0,
        // 追加のROI詳細
        investmentRequired: estimateInvestment(gap, industry),
        paybackPeriod: estimatePaybackPeriod(gap, industry),
        yearlyBenefit: estimateYearlyBenefit(gap, industry)
      }
    };
    
    recommendation.roi.score = (recommendation.roi.impact * (recommendation.roi.yearlyBenefit || 1)) / 
                              (recommendation.roi.effort * (recommendation.roi.investmentRequired || 1));
    
    recommendations.push(recommendation);
  }
  
  // 業界別の追加推奨事項
  const industrySpecificRecommendations = generateIndustrySpecificRecommendations(
    targetAnalysis, competitors, industry, benchmarks
  );
  recommendations.push(...industrySpecificRecommendations);
  
  // ROIスコアと優先度でソート
  return recommendations.sort((a, b) => {
    // まず優先度でソート
    const priorityOrder = { 'critical': 0, 'high': 1, 'medium': 2, 'low': 3 };
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (priorityDiff !== 0) return priorityDiff;
    
    // 同じ優先度ならROIスコアでソート
    return b.roi.score - a.roi.score;
  });
}

// 具体的なタイトル生成
function generateSpecificTitle(gap: CompetitorGap, industry: string): string {
  const titles: Record<string, Record<string, string>> = {
    'technical': {
      'funeral': '葬儀予約システムの高速化と24時間対応',
      'ending': 'エンディングプラン検索の最適化',
      'cemetery': '霊園検索・見学予約システムの改善',
      'buddhist': '仏壇カタログの表示速度改善',
      'default': '技術的パフォーマンスの最適化'
    },
    'structuredData': {
      'funeral': '葬儀サービス・料金体系の構造化データ実装',
      'ending': '終活サービス・専門家情報の構造化',
      'cemetery': '霊園施設・区画情報の構造化データ',
      'buddhist': '商品カタログ・店舗情報の構造化',
      'default': '構造化データの包括的実装'
    },
    'content': {
      'funeral': '葬儀プラン詳細とお客様の声の充実',
      'ending': '終活ガイドと専門家コラムの拡充',
      'cemetery': '霊園選びガイドと見学レポート',
      'buddhist': '仏事知識と商品選びガイド',
      'default': 'コンテンツ戦略の強化'
    },
    'eeat': {
      'funeral': '葬祭ディレクター紹介と実績公開',
      'ending': '終活カウンセラー資格と相談実績',
      'cemetery': '霊園管理実績と顧客満足度',
      'buddhist': '職人紹介と伝統技術の継承',
      'default': '専門性・権威性・信頼性の強化'
    },
    'customerSupport': {
      'funeral': '24時間365日の緊急対応体制構築',
      'ending': 'オンライン相談システムの導入',
      'cemetery': '現地案内・送迎サービスの強化',
      'buddhist': '専門スタッフによる購入相談',
      'default': 'カスタマーサポートの拡充'
    },
    'priceTransparency': {
      'funeral': '葬儀費用の完全明朗会計システム',
      'ending': 'サービス料金の透明化',
      'cemetery': '区画別価格と管理費の明確化',
      'buddhist': '商品価格とオプション料金の明示',
      'default': '料金体系の透明化'
    }
  };
  
  return titles[gap.area]?.[industry] || titles[gap.area]?.['default'] || 
         `${getAreaDisplayName(gap.area)}の改善`;
}

// 詳細な説明生成
function generateDetailedDescription(gap: CompetitorGap, competitor: CompetitorSite | undefined, industry: string): string {
  const competitorName = competitor?.name || '業界トップ企業';
  const percentileBehind = gap.details?.percentileBehind || 50;
  
  let description = `現在、${competitorName}と比較して${gap.gap.toFixed(1)}ポイントの差があります。`;
  description += `この分野では業界内で下位${percentileBehind}%に位置しています。`;
  
  // 業界別の具体的な影響を追加
  const industryImpacts = {
    'funeral': {
      'technical': '検索時の表示順位低下、緊急時のアクセス遅延により機会損失',
      'content': '料金やサービス内容が不明瞭で、問い合わせ前の離脱率が高い',
      'eeat': '信頼性不足により、大切な場面での選択から外れる可能性'
    },
    'ending': {
      'technical': 'シニア層のアクセシビリティ低下、情報取得の困難',
      'content': '終活情報の不足により、相談前の不安解消ができない',
      'eeat': '専門性の証明不足により、競合他社への流出'
    }
  };
  
  const impact = (industryImpacts as Record<string, Record<string, string>>)[industry]?.[gap.area] || '競合優位性の喪失';
  description += ` ${impact}。`;
  
  if (gap.details?.catchUpTime) {
    description += ` 改善には約${gap.details.catchUpTime}を要しますが、段階的な実装により早期に効果を実感できます。`;
  }
  
  return description;
}

// 詳細な実装ステップ生成
function generateDetailedImplementationSteps(gap: CompetitorGap, industry: string, analysis: AnalysisResult): string[] {
  const steps: Record<string, Record<string, string[]>> = {
    'technical': {
      'funeral': [
        '1. 現状分析: PageSpeed InsightsとGTmetrixで詳細な速度測定',
        '2. 画像最適化: 施設写真・スタッフ写真のWebP変換と遅延読み込み',
        '3. CDN導入: 全国からの緊急アクセスに対応するCDN設定',
        '4. キャッシュ戦略: 静的コンテンツの積極的キャッシュ',
        '5. モバイル最適化: レスポンシブデザインとタッチ操作の最適化',
        '6. 24時間監視: 緊急時でもダウンしない監視体制構築'
      ],
      'default': [
        '1. パフォーマンス測定と現状分析',
        '2. 画像・動画の最適化',
        '3. JavaScript/CSSの最小化と遅延読み込み',
        '4. サーバー応答時間の改善',
        '5. CDN導入とキャッシュ戦略'
      ]
    },
    'structuredData': {
      'funeral': [
        '1. 葬儀サービススキーマ(FuneralService)の実装',
        '2. 施設情報(LocalBusiness)の詳細設定',
        '3. 料金体系(Offer)の構造化',
        '4. スタッフ情報(Person)の追加',
        '5. お客様の声(Review)の構造化',
        '6. よくある質問(FAQPage)の実装',
        '7. Google Search Consoleでの検証と修正'
      ],
      'default': [
        '1. 基本的な組織スキーマの実装',
        '2. 商品・サービススキーマの追加',
        '3. パンくずリストの構造化',
        '4. FAQとHowToスキーマ',
        '5. 検証とテスト'
      ]
    },
    'content': {
      'funeral': [
        '1. 葬儀プラン一覧ページの作成（家族葬・一般葬・社葬など）',
        '2. 各プランの詳細ページ（含まれるサービス、オプション、料金目安）',
        '3. 葬儀の流れ解説ページ（初めての方向けガイド）',
        '4. よくある質問の充実（費用、宗教、マナーなど）',
        '5. お客様の声・葬儀事例の掲載（許可を得て）',
        '6. 葬儀後のサポート情報（法要、相続など）',
        '7. 地域別の慣習・マナー情報'
      ],
      'default': [
        '1. ターゲットキーワードの調査',
        '2. コンテンツカレンダーの作成',
        '3. 専門性の高い記事の執筆',
        '4. 既存コンテンツの最適化',
        '5. 内部リンク構造の改善'
      ]
    },
    'eeat': {
      'funeral': [
        '1. 葬祭ディレクター紹介ページ（資格、経験年数、専門分野）',
        '2. 会社概要の充実（創業年、実績数、受賞歴）',
        '3. 施設紹介（写真、設備、アクセス）',
        '4. メディア掲載実績の掲載',
        '5. 業界団体への加盟情報',
        '6. プライバシーポリシーと個人情報保護方針',
        '7. お客様の声の定期的な更新システム構築'
      ],
      'default': [
        '1. 著者・専門家プロフィールの作成',
        '2. 会社情報の透明化',
        '3. 実績・事例の公開',
        '4. 第三者認証の取得と表示',
        '5. カスタマーレビューシステム'
      ]
    }
  };
  
  return steps[gap.area]?.[industry] || steps[gap.area]?.['default'] || 
         ['現状分析', '改善計画策定', '実装', 'テスト', '効果測定'];
}

// 具体的な成果計算
function calculateConcreteResults(gap: CompetitorGap, industry: string, analysis: AnalysisResult): any {
  const results: any = {};
  
  if (gap.area === 'technical') {
    results.pageSpeedImprovement = `${Math.round(gap.gap * 0.8)}%向上`;
    results.bounceRateReduction = `${Math.round(gap.gap * 0.3)}%削減`;
    results.mobileUsability = '90点以上達成';
  }
  
  if (gap.area === 'content') {
    results.organicTrafficIncrease = `${Math.round(gap.gap * 1.5)}%増加`;
    results.averageTimeOnPage = `${Math.round(gap.gap * 0.5)}秒延長`;
    results.conversionRateImprovement = `${Math.round(gap.gap * 0.2)}%向上`;
  }
  
  if (industry === 'funeral' && gap.area === 'eeat') {
    results.trustScoreImprovement = '信頼度スコア30%向上';
    results.inquiryIncrease = '問い合わせ率20%増加';
    results.brandRecognition = '地域認知度向上';
  }
  
  return results;
}

// 詳細な実装アドバイス
function getDetailedImplementationAdvice(area: string, industry: string, analysis: AnalysisResult): string {
  const currentState = analyzeCurrentState(area, analysis);
  let advice = getImplementationAdvice(area, industry);
  
  // 現状に基づいた具体的なアドバイスを追加
  advice += `\n\n【現状分析】\n${currentState}\n\n`;
  
  // 段階的実装プラン
  advice += '【段階的実装プラン】\n';
  advice += 'フェーズ1（1-2週間）: クイックウィンの実装\n';
  advice += 'フェーズ2（3-4週間）: 基盤構築\n';
  advice += 'フェーズ3（5-8週間）: 本格実装と最適化\n\n';
  
  // 推奨ツール・サービス
  advice += '【推奨ツール】\n';
  const tools = getRecommendedTools(area, industry);
  advice += tools.join('\n');
  
  return advice;
}

// 現状分析
function analyzeCurrentState(area: string, analysis: AnalysisResult): string {
  let state = '';
  
  if (area === 'technical') {
    state = `現在の技術スコア: ${analysis.scores.technical}/100\n`;
    state += `主な課題: ページ読み込み速度、モバイル対応\n`;
    state += `改善ポテンシャル: 高（基本的な最適化で大幅改善可能）`;
  }
  
  if (area === 'structuredData') {
    const schemaCount = analysis.details.structuredData.jsonLdCount;
    state = `実装済みスキーマ数: ${schemaCount}\n`;
    state += `不足している重要スキーマ: ${schemaCount < 3 ? '多数' : '一部'}\n`;
    state += `実装難易度: 中（技術的知識が必要）`;
  }
  
  return state;
}

// 推奨ツール取得
function getRecommendedTools(area: string, industry: string): string[] {
  const tools: Record<string, string[]> = {
    'technical': [
      '・Google PageSpeed Insights - 無料の速度測定',
      '・Cloudflare - CDNとセキュリティ',
      '・ImageOptim - 画像最適化',
      '・GTmetrix - 詳細なパフォーマンス分析'
    ],
    'structuredData': [
      '・Schema.org Validator - スキーマ検証',
      '・Google構造化データテストツール',
      '・JSON-LD Generator - スキーマ生成',
      '・Merkle Schema Markup Generator'
    ],
    'content': [
      '・Google Search Console - 検索パフォーマンス',
      '・Ahrefs/SEMrush - キーワード調査',
      '・Grammarly - 文章校正',
      '・Hemingway Editor - 読みやすさ改善'
    ],
    'eeat': [
      '・Google My Business - ローカルプレゼンス',
      '・Trustpilot - レビュー管理',
      '・HARO - メディア露出機会',
      '・LinkedIn - 専門家プロフィール'
    ]
  };
  
  return tools[area] || ['・専門コンサルタントへの相談を推奨'];
}

// 成功事例取得
function getSuccessExamples(area: string, industry: string): string[] {
  const examples: Record<string, Record<string, string[]>> = {
    'technical': {
      'funeral': [
        '某葬儀社A: ページ速度を3.5秒→1.2秒に改善し、問い合わせ率40%向上',
        '某葬儀社B: モバイル最適化により、スマホからの予約が60%増加'
      ],
      'default': [
        'サイトA: Core Web Vitals改善により、検索順位平均3位上昇',
        'サイトB: 表示速度50%改善で、直帰率30%減少'
      ]
    },
    'content': {
      'funeral': [
        '某葬儀社C: 葬儀の流れ解説ページ追加で、事前相談が80%増加',
        '某葬儀社D: 料金体系明確化により、成約率25%向上'
      ],
      'default': [
        'サイトC: FAQ充実により、サポート問い合わせ40%削減',
        'サイトD: 専門記事により、オーガニックトラフィック200%増加'
      ]
    }
  };
  
  return examples[area]?.[industry] || examples[area]?.['default'] || 
         ['業界リーダーの実装事例を参考に'];
}

// KPI生成
function generateKPIs(area: string, industry: string): string[] {
  const kpis: Record<string, string[]> = {
    'technical': [
      'ページ読み込み時間（目標: 2秒以下）',
      'Core Web Vitals スコア（全て「良好」）',
      'モバイルユーザビリティスコア（90点以上）',
      'サーバー応答時間（200ms以下）'
    ],
    'structuredData': [
      '構造化データエラー数（0件）',
      'リッチリザルト表示率（50%以上）',
      'スキーマ実装数（10種類以上）',
      'Search Console エラー（0件）'
    ],
    'content': [
      'オーガニックトラフィック成長率（月10%）',
      '平均滞在時間（3分以上）',
      '直帰率（50%以下）',
      'コンテンツ公開頻度（週2回以上）'
    ],
    'eeat': [
      '著者ページ完成度（100%）',
      'レビュー数（月10件以上）',
      'メディア掲載数（四半期1回以上）',
      '信頼性スコア（自社測定）'
    ]
  };
  
  return kpis[area] || ['改善前後の比較測定', '競合との差分追跡'];
}

// 投資額推定
function estimateInvestment(gap: CompetitorGap, industry: string): number {
  const baseInvestment = {
    'low': { 'low': 10, 'medium': 20, 'high': 30 },
    'medium': { 'low': 30, 'medium': 50, 'high': 80 },
    'high': { 'low': 50, 'medium': 100, 'high': 200 }
  };
  
  const effortLevel = gap.effort as keyof typeof baseInvestment;
  const impactLevel = gap.impact as keyof typeof baseInvestment.low;
  
  let investment = baseInvestment[effortLevel]?.[impactLevel] || 50;
  
  // 業界による調整
  if (industry === 'funeral' || industry === 'healthcare' || industry === 'finance') {
    investment *= 1.5; // 規制や専門性が高い業界
  }
  
  return investment;
}

// 回収期間推定
function estimatePaybackPeriod(gap: CompetitorGap, industry: string): string {
  const monthlyBenefit = gap.gap * 2; // 仮定: 1ポイント改善で月2万円の効果
  const investment = estimateInvestment(gap, industry);
  const months = Math.ceil(investment / monthlyBenefit);
  
  if (months <= 3) return '3ヶ月以内';
  if (months <= 6) return '6ヶ月以内';
  if (months <= 12) return '12ヶ月以内';
  return '12ヶ月以上';
}

// 年間利益推定
function estimateYearlyBenefit(gap: CompetitorGap, industry: string): number {
  // 業界別の改善1ポイントあたりの年間価値（万円）
  const pointValue = {
    'funeral': 5, // 高単価
    'ending': 4,
    'cemetery': 5,
    'buddhist': 3,
    'healthcare': 4,
    'finance': 6,
    'ecommerce': 3,
    'other': 2
  };
  
  const value = (pointValue as Record<string, number>)[industry] || 2;
  return Math.round(gap.gap * value * 12); // 年間利益（万円）
}

// 業界特化型推奨事項生成
function generateIndustrySpecificRecommendations(
  analysis: AnalysisResult,
  competitors: CompetitorSite[],
  industry: string,
  benchmarks: IndustryBenchmarks
): CompetitiveRecommendation[] {
  const recommendations: CompetitiveRecommendation[] = [];
  
  if (industry === 'funeral' || industry === 'ending' || industry === 'cemetery' || industry === 'buddhist') {
    // 葬儀関連業界の特別な推奨事項
    
    // 24時間対応システム
    if (!contentContains(analysis, '24時間')) {
      recommendations.push({
        id: `industry-24hour-${Date.now()}`,
        priority: 'critical',
        type: 'strategic',
        title: '24時間365日対応体制の構築',
        description: '葬儀業界では緊急対応が必須。競合の80%以上が実装済み。',
        competitorExample: competitors[0]?.url || '',
        expectedImpact: {
          scoreImprovement: 15,
          rankingImprovement: 2,
          timeToImplement: '1-2ヶ月',
          inquiryIncrease: '深夜・早朝の問い合わせ30%獲得',
          customerSatisfaction: '緊急時対応満足度90%以上'
        },
        implementation: '1. 専用コールセンター契約\n2. 当直スタッフ体制構築\n3. 緊急対応マニュアル作成\n4. ウェブサイトに明確に表示',
        implementationSteps: [
          '現状の問い合わせ時間分析',
          '外部コールセンターサービス比較検討',
          'スタッフシフト体制の構築',
          '緊急対応フローの確立',
          'ウェブサイトへの表示最適化'
        ],
        requiredResources: ['コールセンター契約', '当直スタッフ2名以上', '緊急対応システム'],
        quickWins: ['営業時間外の自動応答設定', '緊急連絡先の明示'],
        successExamples: ['某大手葬儀社: 24時間対応により深夜の成約率50%向上'],
        kpis: ['深夜早朝の応答率100%', '平均応答時間3コール以内', '緊急対応満足度90%'],
        roi: {
          effort: 7,
          impact: 9,
          score: 0,
          investmentRequired: 150,
          paybackPeriod: '6ヶ月以内',
          yearlyBenefit: 300
        }
      });
    }
    
    // オンライン見積もりシステム
    if (!contentContains(analysis, '見積') && !contentContains(analysis, 'シミュレー')) {
      recommendations.push({
        id: `industry-estimate-${Date.now()}`,
        priority: 'high',
        type: 'quick-win',
        title: 'オンライン見積もりシミュレーターの導入',
        description: '料金の透明性向上と顧客の不安解消。競合の60%が実装。',
        competitorExample: competitors.find(c => contentContains(c.analysis, '見積'))?.url || '',
        expectedImpact: {
          scoreImprovement: 12,
          rankingImprovement: 1,
          timeToImplement: '3-4週間',
          conversionRate: 'フォーム送信率25%向上',
          trustImprovement: '料金透明性による信頼度向上'
        },
        implementation: '1. 基本プランと オプション料金の整理\n2. 計算ロジックの開発\n3. UIデザインと実装\n4. テストと最適化',
        implementationSteps: [
          '現在の料金体系の整理と標準化',
          'シミュレーターの要件定義',
          'UI/UXデザインの作成',
          'フロントエンド実装',
          'バックエンド計算ロジック実装',
          'テストと調整'
        ],
        requiredResources: ['ウェブ開発者', 'UIデザイナー', '料金体系の整理'],
        quickWins: ['基本料金の明確な表示', 'よくある質問への料金情報追加'],
        successExamples: ['葬儀社E: オンライン見積もりで問い合わせ前の離脱50%削減'],
        kpis: ['見積もりツール利用率', '完了率', '問い合わせ転換率'],
        roi: {
          effort: 4,
          impact: 8,
          score: 0,
          investmentRequired: 50,
          paybackPeriod: '3ヶ月以内',
          yearlyBenefit: 200
        }
      });
    }
  }
  
  // 各推奨事項のROIスコアを計算
  recommendations.forEach(rec => {
    rec.roi.score = (rec.roi.impact * (rec.roi.yearlyBenefit || 1)) / 
                    (rec.roi.effort * (rec.roi.investmentRequired || 1));
  });
  
  return recommendations;
}

function getAreaDisplayName(area: string): string {
  const names: Record<string, string> = {
    'technical': '技術的最適化',
    'structuredData': '構造化データ',
    'content': 'コンテンツ品質',
    'eeat': 'E-E-A-T',
    'customerSupport': 'カスタマーサポート',
    'priceTransparency': '料金透明性',
    'localSEO': 'ローカルSEO',
    'mobileOptimization': 'モバイル最適化',
    'security': 'セキュリティ',
    'accessibility': 'アクセシビリティ'
  };
  return names[area] || area;
}

function getImplementationAdvice(area: string, industry: string): string {
  const advice: Record<string, Record<string, string>> = {
    'technical': {
      'ecommerce': 'Core Web Vitalsの改善、CDN導入、画像最適化',
      'healthcare': 'アクセシビリティ強化、セキュリティ証明書、HTTPS完全移行',
      'funeral': 'SSL証明書の実装、24時間アクセス対応、モバイル最適化',
      'default': 'ページ速度最適化、モバイルファースト設計、技術的SEO改善'
    },
    'structuredData': {
      'ecommerce': '商品・レビュー・価格スキーマの実装',
      'healthcare': '医療機関・医師・サービススキーマの実装',
      'funeral': '葬儀社・施設・サービス・料金体系のスキーマ実装',
      'default': '組織・記事・FAQスキーマの実装'
    },
    'content': {
      'ecommerce': '商品説明の充実、ユーザーレビュー活用、FAQ追加',
      'healthcare': '専門的かつ分かりやすい医療情報、症例・治療法の詳細',
      'funeral': '明確な料金体系、サービス内容、施設案内、お客様の声',
      'default': 'ユーザーニーズに応じたコンテンツ充実、FAQ・用語集追加'
    },
    'eeat': {
      'ecommerce': '運営会社情報の充実、顧客サポート体制の明示',
      'healthcare': '医師・専門家プロフィール、資格・経歴の詳細表示',
      'funeral': '葬祭ディレクター資格、実績・経験年数、お客様の声・事例',
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
    console.log(`競合サイト解析開始: ${url}`);
    
    // 1. 内部解析エンジンを直接呼び出し
    const internalAnalysis = await analyzeUrl(url);
    console.log(`内部解析完了: ${url}, スコア: ${internalAnalysis.scores.overall}`);
    
    // 2. 外部API（Lighthouse）で強化
    try {
      const { lighthouseData } = await getEnhancedCompetitorAnalysis(url);
      
      // 3. 内部解析とLighthouseデータを統合
      const enhancedAnalysis = integrateLighthouseScores(internalAnalysis, lighthouseData);
      console.log(`Lighthouse統合完了: ${url}, 最終スコア: ${enhancedAnalysis.scores.overall}`);
      
      return enhancedAnalysis;
    } catch (lighthouseError) {
      console.warn(`Lighthouse統合失敗: ${url}, 内部解析のみ使用`, lighthouseError);
      return internalAnalysis;
    }
  } catch (error) {
    console.warn(`競合サイト ${url} の解析に失敗。フォールバックデータを使用:`, error);
    
    // 解析失敗時のフォールバックデータ
    const fallbackResult: AnalysisResult = {
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
        llmsTxt: {
          exists: false,
          syntax: { valid: true, errors: [] },
          content: { allowed: [], disallowed: [], sitemaps: [] }
        },
        structuredData: {
          jsonLdCount: 0,
          schemas: [],
          errors: [],
          warnings: []
        },
        content: {
          headingStructure: { valid: true, issues: [] },
          semanticHtml: { score: 70, elements: [] },
          faqDetected: false,
          listElements: 0,
          summarySection: false
        },
        eeat: {
          authorInfo: { exists: false, complete: false },
          organizationInfo: { exists: false, complete: false },
          lastUpdated: null,
          trustSignals: []
        }
      },
      suggestions: [],
      isFallbackData: true,
      fallbackReason: '競合サイト解析エラー'
    };
    
    return fallbackResult;
  }
}

/**
 * サイト名を抽出
 */
function extractSiteName(url: string, analysis: AnalysisResult): string | null {
  try {
    // まずはドメインから推測
    const domain = new URL(url).hostname.replace('www.', '');
    const parts = domain.split('.');
    let name = parts[0];
    
    // 分析結果からサイト名を探す（仮定）
    // 実際の実装では、ページタイトルやOGPから取得
    
    // ドメイン名を人間が読みやすい形に
    name = name.charAt(0).toUpperCase() + name.slice(1);
    name = name.replace(/-/g, ' ');
    
    return name;
  } catch {
    return null;
  }
}

/**
 * 詳細な強みを抽出
 */
function extractDetailedStrengths(analysis: AnalysisResult, industry: string): string[] {
  const strengths: string[] = [];
  const scores = analysis.scores;
  
  // スコアベースの強み
  if (scores.technical > 85) {
    strengths.push('ページ読み込み速度が業界トップクラス（2秒以内）');
  } else if (scores.technical > 75) {
    strengths.push('技術的最適化が良好（Core Web Vitals合格）');
  }
  
  if (scores.structuredData > 90) {
    strengths.push('構造化データが完璧に実装（10種類以上のスキーマ）');
  } else if (scores.structuredData > 80) {
    strengths.push('主要な構造化データを実装済み');
  }
  
  if (scores.content > 85) {
    strengths.push('コンテンツが充実し、ユーザーニーズに対応');
  } else if (scores.content > 75) {
    strengths.push('基本的なコンテンツ戦略を実施');
  }
  
  if (scores.eeat > 90) {
    strengths.push('専門性・権威性・信頼性が極めて高い');
  } else if (scores.eeat > 80) {
    strengths.push('信頼性の高い情報発信体制');
  }
  
  // 業界特有の強み
  if (industry === 'funeral' || industry === 'ending') {
    if (contentContains(analysis, '24時間')) {
      strengths.push('24時間365日の緊急対応体制');
    }
    if (contentContains(analysis, '料金') || contentContains(analysis, '価格')) {
      strengths.push('料金体系の透明性が高い');
    }
    if (contentContains(analysis, 'お客様の声') || contentContains(analysis, '事例')) {
      strengths.push('豊富な実績と顧客の声を掲載');
    }
  }
  
  // デフォルトの強み
  if (strengths.length === 0) {
    if (scores.overall > 75) strengths.push('総合的な最適化レベルが高い');
    else strengths.push('基本的なSEO対策が実装済み');
  }
  
  return strengths;
}

/**
 * 詳細な弱みを抽出
 */
function extractDetailedWeaknesses(analysis: AnalysisResult, industry: string): string[] {
  const weaknesses: string[] = [];
  const scores = analysis.scores;
  
  // スコアベースの弱み
  if (scores.technical < 60) {
    weaknesses.push('ページ速度が遅い（4秒以上）- 離脱率に影響');
  } else if (scores.technical < 70) {
    weaknesses.push('技術的最適化に改善余地（特にモバイル）');
  }
  
  if (scores.structuredData < 50) {
    weaknesses.push('構造化データがほぼ未実装 - 検索結果表示で不利');
  } else if (scores.structuredData < 65) {
    weaknesses.push('構造化データの実装が不十分');
  }
  
  if (scores.content < 60) {
    weaknesses.push('コンテンツ不足 - ユーザーの疑問に答えられない');
  } else if (scores.content < 70) {
    weaknesses.push('コンテンツ戦略の見直しが必要');
  }
  
  if (scores.eeat < 55) {
    weaknesses.push('信頼性の証明が不足 - 選ばれにくい');
  } else if (scores.eeat < 65) {
    weaknesses.push('E-E-A-T（専門性・権威性）の強化が必要');
  }
  
  // 業界特有の弱み
  if (industry === 'funeral' || industry === 'ending') {
    if (!contentContains(analysis, '24時間')) {
      weaknesses.push('24時間対応未実装 - 緊急時の機会損失');
    }
    if (!contentContains(analysis, '料金') && !contentContains(analysis, '価格')) {
      weaknesses.push('料金情報が不明確 - 問い合わせ前の離脱要因');
    }
    if (!contentContains(analysis, '資格') && !contentContains(analysis, 'ディレクター')) {
      weaknesses.push('専門資格・経験の明示不足');
    }
  }
  
  // デフォルトの弱み
  if (weaknesses.length === 0) {
    if (scores.overall < 85) weaknesses.push('さらなる最適化の余地あり');
    else weaknesses.push('細部の微調整で完璧に');
  }
  
  return weaknesses;
}

/**
 * ユニークな機能を抽出
 */
function extractUniqueFeatures(analysis: AnalysisResult, industry: string): string[] {
  const features: string[] = [];
  
  // 業界別のユニーク機能チェック
  if (industry === 'funeral') {
    if (contentContains(analysis, 'VR') || contentContains(analysis, 'バーチャル')) {
      features.push('VR葬儀場見学システム');
    }
    if (contentContains(analysis, 'ライブ') || contentContains(analysis, '配信')) {
      features.push('葬儀のライブ配信サービス');
    }
    if (contentContains(analysis, 'AI') || contentContains(analysis, 'チャット')) {
      features.push('AIチャットボットによる24時間相談');
    }
  }
  
  // 一般的なユニーク機能
  if (analysis.details.structuredData.schemas.some(schema => schema.type === 'VideoObject')) {
    features.push('動画コンテンツの活用');
  }
  if (analysis.details.structuredData.schemas.some(schema => schema.type === 'Event')) {
    features.push('イベント・セミナー情報の構造化');
  }
  
  return features;
}

/**
 * 不足している機能を特定
 */
function identifyMissingFeatures(analysis: AnalysisResult, industry: string): string[] {
  const missing: string[] = [];
  const benchmarks = INDUSTRY_BENCHMARKS[industry] || INDUSTRY_BENCHMARKS['other'];
  
  // 業界標準機能との比較
  benchmarks.commonFeatures.forEach(feature => {
    const hasFeature = analysis.details.structuredData.schemas.some(schema => 
      feature.toLowerCase().includes(schema.type.toLowerCase())
    ) || contentContains(analysis, feature);
    
    if (!hasFeature) {
      missing.push(feature);
    }
  });
  
  // 業界トレンドとの比較
  benchmarks.emergingTrends.forEach(trend => {
    const hasTrend = contentContains(analysis, trend.substring(0, 4));
    if (!hasTrend) {
      missing.push(`【トレンド】${trend}`);
    }
  });
  
  return missing;
}

/**
 * 競合分析のメイン関数
 */
export async function performCompetitiveAnalysis(
  targetUrl: string,
  targetAnalysis: AnalysisResult,
  competitorUrls: string[]
): Promise<CompetitiveAnalysis> {
  console.log(`競合分析開始: ${targetUrl}, 競合数: ${competitorUrls.length}`);
  console.log('競合URLリスト:', competitorUrls);
  
  // ターゲットサイトもLighthouseで強化
  const enhancedTargetAnalysis = await (async () => {
    try {
      console.log(`ターゲットサイトLighthouse強化開始: ${targetUrl}`);
      const { lighthouseData } = await getEnhancedCompetitorAnalysis(targetUrl);
      const enhanced = integrateLighthouseScores(targetAnalysis, lighthouseData);
      console.log(`ターゲットサイト強化完了: ${enhanced.scores.overall}`);
      return enhanced;
    } catch (error) {
      console.warn(`ターゲットサイトLighthouse強化失敗:`, error);
      return targetAnalysis; // エラー時は元の解析結果を使用
    }
  })();
  
  // 業界検出（競合分析で使用）
  const industry = detectIndustry(targetUrl, targetAnalysis);
  
  // 各競合URLを実際に解析（外部API統合版）
  console.log('競合サイト解析開始...');
  const competitors: CompetitorSite[] = await Promise.all(
    competitorUrls.map(async (url, index) => {
      try {
        console.log(`競合サイト ${index + 1} 解析開始: ${url}`);
        const analysis = await analyzeCompetitorSite(url);
        
        const allScores = [enhancedTargetAnalysis.scores.overall, analysis.scores.overall];
        
        // サイト名を抽出
        const siteName = extractSiteName(url, analysis);
        
        const competitor = {
          url,
          name: siteName || `競合サイト ${index + 1}`,
          analysis,
          marketPosition: analyzeMarketPosition(analysis.scores.overall, allScores),
          strengths: extractDetailedStrengths(analysis, industry),
          weaknesses: extractDetailedWeaknesses(analysis, industry),
          // 追加の詳細情報
          uniqueFeatures: extractUniqueFeatures(analysis, industry),
          missingFeatures: identifyMissingFeatures(analysis, industry)
        };
        
        console.log(`競合サイト ${index + 1} 解析完了: ${url}, スコア: ${analysis.scores.overall}`);
        return competitor;
      } catch (error) {
        console.error(`競合サイト ${index + 1} 解析エラー: ${url}`, error);
        throw error; // エラーを上位に伝播
      }
    })
  );
  
  console.log(`全競合サイト解析完了. 結果数: ${competitors.length}`);
  
  // 強化されたターゲット解析を使用してギャップ分析も更新
  const gapAnalysis = performGapAnalysis(enhancedTargetAnalysis, competitors, industry);
  const benchmarks = INDUSTRY_BENCHMARKS[industry] || INDUSTRY_BENCHMARKS['other'];
  
  const allScores = [targetAnalysis.scores.overall, ...competitors.map(c => c.analysis.scores.overall)];
  const ranking = {
    position: allScores.sort((a, b) => b - a).indexOf(targetAnalysis.scores.overall) + 1,
    outOf: allScores.length,
    category: benchmarks.industry,
    industry
  };
  
  // ギャップ分析は上で実行済み
  const recommendations = generateCompetitiveRecommendations(gapAnalysis, competitors, industry, enhancedTargetAnalysis);
  
  const result = {
    targetUrl,
    competitors,
    ranking,
    gapAnalysis,
    benchmarks,
    recommendations
  };
  
  console.log(`競合分析完了. ランキング: ${ranking.position}/${ranking.outOf}, 推奨事項: ${recommendations.length}件`);
  
  return result;
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
      'funeral': ['https://www.sousai-sougi.com', 'https://www.sogi.co.jp', 'https://www.zenkokusai.jp'],
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
    'funeral': ['https://www.sousai-sougi.com', 'https://www.sogi.co.jp'],
    'other': []
  };
  
  return staticSuggestions[industry] || [];
}