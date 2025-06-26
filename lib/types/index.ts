// LLMO解析結果の型定義
export interface AnalysisResult {
  url: string;
  timestamp: Date;
  scores: {
    overall: number;
    technical: number;
    structuredData: number;
    content: number;
    eeat: number;
  };
  details: {
    llmsTxt: LlmsTxtAnalysis;
    structuredData: StructuredDataAnalysis;
    content: ContentAnalysis;
    eeat: EeatAnalysis;
  };
  suggestions: Suggestion[];
  // 外部API統合用のオプショナルプロパティ
  isFallbackData?: boolean;
  fallbackReason?: string;
  fromCache?: boolean;
  cacheHit?: boolean;
  cacheTimeRemaining?: string;
}

// llms.txt解析結果
export interface LlmsTxtAnalysis {
  exists: boolean;
  syntax: {
    valid: boolean;
    errors: string[];
  };
  content: {
    allowed: string[];
    disallowed: string[];
    sitemaps: string[];
  };
}

// 構造化データ解析結果
export interface StructuredDataAnalysis {
  jsonLdCount: number;
  schemas: SchemaInfo[];
  errors: string[];
  warnings: string[];
}

export interface SchemaInfo {
  type: string;
  validation: {
    valid: boolean;
    missingRequired: string[];
    warnings: string[];
  };
}

// コンテンツ解析結果
export interface ContentAnalysis {
  headingStructure: {
    valid: boolean;
    issues: string[];
  };
  semanticHtml: {
    score: number;
    elements: string[];
  };
  faqDetected: boolean;
  listElements: number;
  summarySection: boolean;
}

// E-E-A-T解析結果
export interface EeatAnalysis {
  authorInfo: {
    exists: boolean;
    complete: boolean;
  };
  organizationInfo: {
    exists: boolean;
    complete: boolean;
  };
  lastUpdated: string | null;
  trustSignals: string[];
}

// 改善提案
export interface Suggestion {
  id: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
  title: string;
  description: string;
  implementation: string;
  codeExample?: string;
  roi?: {
    effort: number;
    impact: number;
    score: number;
  };
}

// 解析進捗
export interface AnalysisProgress {
  stage: 'fetching' | 'parsing' | 'analyzing' | 'generating';
  percentage: number;
  currentTask: string;
}

// 競合比較・ベンチマーク機能
export interface CompetitiveAnalysis {
  targetUrl: string;
  competitors: CompetitorSite[];
  ranking: {
    position: number;
    outOf: number;
    category: string;
    industry?: string;
  };
  gapAnalysis: CompetitorGap[];
  benchmarks: IndustryBenchmarks;
  recommendations: CompetitiveRecommendation[];
}

export interface CompetitorSite {
  url: string;
  name: string;
  analysis: AnalysisResult;
  marketPosition: 'leader' | 'challenger' | 'follower';
  strengths: string[];
  weaknesses: string[];
  // 詳細な分析情報
  uniqueFeatures?: string[];
  missingFeatures?: string[];
  // 業界別特化情報
  industrySpecificStrengths?: string[];
  industrySpecificWeaknesses?: string[];
}

export interface CompetitorGap {
  area: 'technical' | 'content' | 'structuredData' | 'eeat' | 'customerSupport' | 'priceTransparency' | 'localSEO' | 'mobileOptimization' | 'security' | 'accessibility';
  currentScore: number;
  competitorAverage: number;
  topCompetitorScore: number;
  gap: number;
  impact: 'high' | 'medium' | 'low';
  effort: 'low' | 'medium' | 'high';
  // 詳細なギャップ分析情報
  details?: {
    percentileBehind: number;
    catchUpTime: string;
    requiredResources: string[];
    quickWins: string[];
    industryBenchmark?: number;
    marketPosition?: 'leading' | 'competitive' | 'lagging';
  };
}

export interface IndustryBenchmarks {
  industry: string;
  averageScores: {
    overall: number;
    technical: number;
    structuredData: number;
    content: number;
    eeat: number;
  };
  topPerformerScores: {
    overall: number;
    technical: number;
    structuredData: number;
    content: number;
    eeat: number;
  };
  commonFeatures: string[];
  emergingTrends: string[];
  // 詳細なベンチマーク情報
  detailedBenchmarks?: {
    pageSpeed?: { mobile: number; desktop: number };
    coreWebVitals?: { lcp: number; fid: number; cls: number };
    // 業界固有のベンチマーク
    serviceTransparency?: string[];
    customerSupport?: string[];
    localSEO?: string[];
    contentFeatures?: string[];
    trustIndicators?: string[];
    compliance?: string[];
    userTrust?: string[];
    security?: string[];
    regulatoryCompliance?: string[];
    serviceRange?: string[];
    expertiseDisplay?: string[];
    userEngagement?: string[];
    facilityInfo?: string[];
    priceTransparency?: string[];
    visitorSupport?: string[];
    productDisplay?: string[];
    culturalRespect?: string[];
    customerService?: string[];
    basicOptimization?: string[];
    userExperience?: string[];
    contentStrategy?: string[];
    // 追加のベンチマーク
    conversionOptimization?: string[];
    contentQuality?: string[];
  };
}

export interface CompetitiveRecommendation {
  id: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  type: 'quick-win' | 'strategic' | 'long-term';
  title: string;
  description: string;
  competitorExample: string;
  expectedImpact: {
    scoreImprovement: number;
    rankingImprovement: number;
    timeToImplement: string;
    // 業界固有の期待成果
    [key: string]: any;
  };
  implementation: string;
  codeExample?: string;
  roi: {
    effort: number; // 1-10 scale
    impact: number; // 1-10 scale
    score: number; // impact/effort ratio
    // 詳細なROI分析
    investmentRequired?: number;
    paybackPeriod?: string;
    yearlyBenefit?: number;
  };
  // 詳細な実装情報
  implementationSteps?: string[];
  requiredResources?: string[];
  quickWins?: string[];
  successExamples?: string[];
  kpis?: string[];
  risks?: string[];
  dependencies?: string[];
  timeline?: {
    planning: string;
    development: string;
    testing: string;
    deployment: string;
  };
}