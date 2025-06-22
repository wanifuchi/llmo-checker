import { LlmsTxtAnalysis, StructuredDataAnalysis, ContentAnalysis, EeatAnalysis } from '@/lib/types';

export function calculateScores(
  llmsTxt: LlmsTxtAnalysis,
  structuredData: StructuredDataAnalysis,
  content: ContentAnalysis,
  eeat: EeatAnalysis
) {
  const technicalScore = calculateTechnicalScore(llmsTxt);
  const structuredDataScore = calculateStructuredDataScore(structuredData);
  const contentScore = calculateContentScore(content);
  const eeatScore = calculateEeatScore(eeat);
  
  const overall = Math.round(
    (technicalScore * 0.3 + structuredDataScore * 0.25 + contentScore * 0.25 + eeatScore * 0.2)
  );
  
  return {
    overall,
    technical: technicalScore,
    structuredData: structuredDataScore,
    content: contentScore,
    eeat: eeatScore
  };
}

function calculateTechnicalScore(llmsTxt: LlmsTxtAnalysis): number {
  let score = 0;
  
  // llms.txtが存在するか
  if (llmsTxt.exists) {
    score += 40;
    
    // 構文が正しいか
    if (llmsTxt.syntax.valid) {
      score += 30;
    }
    
    // コンテンツが充実しているか
    const contentItems = [
      ...llmsTxt.content.allowed,
      ...llmsTxt.content.disallowed,
      ...llmsTxt.content.sitemaps
    ];
    
    if (contentItems.length > 0) {
      score += 20;
    }
    
    if (contentItems.length > 3) {
      score += 10;
    }
  }
  
  return Math.min(score, 100);
}

function calculateStructuredDataScore(structuredData: StructuredDataAnalysis): number {
  let score = 0;
  
  // JSON-LDが存在するか
  if (structuredData.jsonLdCount > 0) {
    score += 30;
    
    // エラーがないか
    if (structuredData.errors.length === 0) {
      score += 20;
    }
    
    // スキーマの数に応じて加点
    score += Math.min(structuredData.schemas.length * 10, 30);
    
    // バリデーションの品質
    const validSchemas = structuredData.schemas.filter(s => s.validation.valid);
    if (validSchemas.length === structuredData.schemas.length) {
      score += 20;
    }
  }
  
  return Math.min(score, 100);
}

function calculateContentScore(content: ContentAnalysis): number {
  let score = 0;
  
  // 見出し構造
  if (content.headingStructure.valid) {
    score += 25;
  }
  
  // セマンティックHTML
  score += Math.min(content.semanticHtml.score, 25);
  
  // FAQの存在
  if (content.faqDetected) {
    score += 20;
  }
  
  // リスト要素
  if (content.listElements > 0) {
    score += 15;
  }
  
  // まとめセクション
  if (content.summarySection) {
    score += 15;
  }
  
  return Math.min(score, 100);
}

function calculateEeatScore(eeat: EeatAnalysis): number {
  let score = 0;
  
  // 著者情報
  if (eeat.authorInfo.exists) {
    score += 20;
    if (eeat.authorInfo.complete) {
      score += 10;
    }
  }
  
  // 組織情報
  if (eeat.organizationInfo.exists) {
    score += 20;
    if (eeat.organizationInfo.complete) {
      score += 10;
    }
  }
  
  // 更新日情報
  if (eeat.lastUpdated) {
    score += 20;
  }
  
  // 信頼シグナル
  score += Math.min(eeat.trustSignals.length * 5, 20);
  
  return Math.min(score, 100);
}