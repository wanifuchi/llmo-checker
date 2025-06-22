import { LlmsTxtAnalysis, StructuredDataAnalysis, ContentAnalysis, EeatAnalysis, Suggestion } from '@/lib/types';

export function generateSuggestions(
  llmsTxt: LlmsTxtAnalysis,
  structuredData: StructuredDataAnalysis,
  content: ContentAnalysis,
  eeat: EeatAnalysis
): Suggestion[] {
  const suggestions: Suggestion[] = [];
  
  // llms.txt関連の提案
  suggestions.push(...generateLlmsTxtSuggestions(llmsTxt));
  
  // 構造化データ関連の提案
  suggestions.push(...generateStructuredDataSuggestions(structuredData));
  
  // コンテンツ関連の提案
  suggestions.push(...generateContentSuggestions(content));
  
  // E-E-A-T関連の提案
  suggestions.push(...generateEeatSuggestions(eeat));
  
  return suggestions;
}

function generateLlmsTxtSuggestions(llmsTxt: LlmsTxtAnalysis): Suggestion[] {
  const suggestions: Suggestion[] = [];
  
  if (!llmsTxt.exists) {
    suggestions.push({
      id: 'llms-txt-create',
      priority: 'high',
      category: 'llms.txt',
      title: 'llms.txtファイルを作成',
      description: 'AIクローラー向けの指示ファイルを作成してください。',
      implementation: 'ルートディレクトリに llms.txt ファイルを作成し、適切なディレクティブを記述してください。',
      codeExample: `User-agent: *
Allow: /
Sitemap: https://example.com/sitemap.xml

# AIクローラー向けの設定
Disallow: /admin/
Disallow: /private/`
    });
  } else {
    if (!llmsTxt.syntax.valid) {
      suggestions.push({
        id: 'llms-txt-fix-syntax',
        priority: 'high',
        category: 'llms.txt',
        title: 'llms.txtの構文エラーを修正',
        description: `以下のエラーを修正してください: ${llmsTxt.syntax.errors.join(', ')}`,
        implementation: 'エラーメッセージに基づいて構文を修正してください。'
      });
    }
    
    if (llmsTxt.content.sitemaps.length === 0) {
      suggestions.push({
        id: 'llms-txt-add-sitemap',
        priority: 'medium',
        category: 'llms.txt',
        title: 'サイトマップを追加',
        description: 'AIクローラーがサイト構造を理解しやすくなります。',
        implementation: 'llms.txtにSitemapディレクティブを追加してください。',
        codeExample: 'Sitemap: https://yoursite.com/sitemap.xml'
      });
    }
  }
  
  return suggestions;
}

function generateStructuredDataSuggestions(structuredData: StructuredDataAnalysis): Suggestion[] {
  const suggestions: Suggestion[] = [];
  
  if (structuredData.jsonLdCount === 0) {
    suggestions.push({
      id: 'add-structured-data',
      priority: 'high',
      category: '構造化データ',
      title: 'JSON-LD構造化データを追加',
      description: 'AIがコンテンツを理解しやすくなります。',
      implementation: 'headタグ内にJSON-LDスクリプトを追加してください。',
      codeExample: `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "記事のタイトル",
  "author": {
    "@type": "Person",
    "name": "著者名"
  },
  "datePublished": "2024-01-01",
  "description": "記事の要約"
}
</script>`
    });
  }
  
  if (structuredData.errors.length > 0) {
    suggestions.push({
      id: 'fix-structured-data-errors',
      priority: 'high',
      category: '構造化データ',
      title: 'JSON-LDエラーを修正',
      description: `以下のエラーを修正してください: ${structuredData.errors.join(', ')}`,
      implementation: 'JSONの構文を確認し、エラーを修正してください。'
    });
  }
  
  return suggestions;
}

function generateContentSuggestions(content: ContentAnalysis): Suggestion[] {
  const suggestions: Suggestion[] = [];
  
  if (!content.headingStructure.valid) {
    suggestions.push({
      id: 'fix-heading-structure',
      priority: 'medium',
      category: 'コンテンツ構造',
      title: '見出し構造を改善',
      description: `以下の問題を修正してください: ${content.headingStructure.issues.join(', ')}`,
      implementation: '見出しタグの階層構造を見直し、適切な順序で使用してください。'
    });
  }
  
  if (!content.faqDetected) {
    suggestions.push({
      id: 'add-faq-section',
      priority: 'low',
      category: 'コンテンツ構造',
      title: 'FAQセクションを追加',
      description: 'よくある質問セクションを追加するとAIが理解しやすくなります。',
      implementation: 'FAQセクションを作成し、関連する質問と回答を追加してください。'
    });
  }
  
  return suggestions;
}

function generateEeatSuggestions(eeat: EeatAnalysis): Suggestion[] {
  const suggestions: Suggestion[] = [];
  
  if (!eeat.authorInfo.exists) {
    suggestions.push({
      id: 'add-author-info',
      priority: 'medium',
      category: 'E-E-A-T',
      title: '著者情報を追加',
      description: '著者情報を明記することで信頼性が向上します。',
      implementation: '記事やページに著者情報を追加し、構造化データでも指定してください。'
    });
  }
  
  if (!eeat.organizationInfo.exists) {
    suggestions.push({
      id: 'add-organization-info',
      priority: 'medium',
      category: 'E-E-A-T',
      title: '組織情報を追加',
      description: '運営組織の情報を明記して信頼性を向上させましょう。',
      implementation: '会社情報、連絡先、会社概要などを追加してください。'
    });
  }
  
  if (!eeat.lastUpdated) {
    suggestions.push({
      id: 'add-update-date',
      priority: 'low',
      category: 'E-E-A-T',
      title: '更新日を追加',
      description: 'コンテンツの更新日を明記して新鮮さをアピールしましょう。',
      implementation: '投稿日や更新日をtimeタグでマークアップしてください。',
      codeExample: '<time datetime="2024-01-01">更新日: 2024年1月1日</time>'
    });
  }
  
  return suggestions;
}