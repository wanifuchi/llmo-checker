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
}

export interface CompetitorGap {
  area: 'technical' | 'content' | 'structuredData' | 'eeat';
  currentScore: number;
  competitorAverage: number;
  topCompetitorScore: number;
  gap: number;
  impact: 'high' | 'medium' | 'low';
  effort: 'low' | 'medium' | 'high';
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
  };
  implementation: string;
  codeExample?: string;
  roi: {
    effort: number; // 1-10 scale
    impact: number; // 1-10 scale
    score: number; // impact/effort ratio
  };
}