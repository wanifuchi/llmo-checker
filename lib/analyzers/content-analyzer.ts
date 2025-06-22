import * as cheerio from 'cheerio';
import { ContentAnalysis } from '@/lib/types';

export function analyzeContent($: cheerio.CheerioAPI): ContentAnalysis {
  return {
    headingStructure: analyzeHeadingStructure($),
    semanticHtml: analyzeSemanticHtml($),
    faqDetected: detectFaq($),
    listElements: countListElements($),
    summarySection: detectSummarySection($)
  };
}

function analyzeHeadingStructure($: cheerio.CheerioAPI) {
  const headings = $('h1, h2, h3, h4, h5, h6');
  const issues: string[] = [];
  
  if (headings.length === 0) {
    issues.push('見出しタグが見つかりません');
    return { valid: false, issues };
  }
  
  const h1Count = $('h1').length;
  if (h1Count === 0) {
    issues.push('H1タグが見つかりません');
  } else if (h1Count > 1) {
    issues.push('H1タグが複数あります');
  }
  
  // 見出しの階層構造をチェック
  let previousLevel = 0;
  headings.each((_: number, element: cheerio.Element) => {
    const tagName = (element as any).tagName?.toLowerCase() || (element as any).name?.toLowerCase();
    const level = parseInt(tagName.charAt(1));
    
    if (previousLevel > 0 && level > previousLevel + 1) {
      issues.push(`見出しレベルがスキップされています: ${tagName}`);
    }
    
    previousLevel = level;
  });
  
  return {
    valid: issues.length === 0,
    issues
  };
}

function analyzeSemanticHtml($: cheerio.CheerioAPI) {
  const semanticElements = [
    'main', 'article', 'section', 'nav', 'aside',
    'header', 'footer', 'figure', 'figcaption'
  ];
  
  const foundElements: string[] = [];
  let score = 0;
  
  for (const element of semanticElements) {
    const count = $(element).length;
    if (count > 0) {
      foundElements.push(`${element} (${count})個`);
      score += Math.min(count, 3); // 最大3点まで
    }
  }
  
  return {
    score: Math.min(score, 20), // 最大20点
    elements: foundElements
  };
}

function detectFaq($: cheerio.CheerioAPI): boolean {
  // FAQを示すキーワードを検索
  const faqKeywords = ['よくある質問', 'FAQ', 'Q&A', '質問'];
  const text = $('body').text().toLowerCase();
  
  for (const keyword of faqKeywords) {
    if (text.includes(keyword.toLowerCase())) {
      return true;
    }
  }
  
  // dt/dd構造をチェック
  const dlElements = $('dl');
  if (dlElements.length > 0) {
    return true;
  }
  
  return false;
}

function countListElements($: cheerio.CheerioAPI): number {
  return $('ul, ol').length;
}

function detectSummarySection($: cheerio.CheerioAPI): boolean {
  const summaryKeywords = ['まとめ', '概要', '要約', 'summary'];
  const text = $('body').text().toLowerCase();
  
  for (const keyword of summaryKeywords) {
    if (text.includes(keyword.toLowerCase())) {
      return true;
    }
  }
  
  // summaryタグをチェック
  return $('summary').length > 0;
}