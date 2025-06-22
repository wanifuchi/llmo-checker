import * as cheerio from 'cheerio';
import { StructuredDataAnalysis, SchemaInfo } from '@/lib/types';

export function analyzeStructuredData($: cheerio.CheerioAPI): StructuredDataAnalysis {
  const jsonLdScripts = $('script[type="application/ld+json"]');
  const schemas: SchemaInfo[] = [];
  const errors: string[] = [];
  const warnings: string[] = [];
  
  if (jsonLdScripts.length === 0) {
    warnings.push('JSON-LD構造化データが見つかりません');
  }
  
  jsonLdScripts.each((_: number, element: cheerio.Element) => {
    try {
      const jsonContent = $(element).html();
      if (!jsonContent) return;
      
      const data = JSON.parse(jsonContent);
      const schemaArray = Array.isArray(data) ? data : [data];
      
      for (const schema of schemaArray) {
        if (schema['@type']) {
          const schemaInfo = analyzeSchema(schema);
          schemas.push(schemaInfo);
        }
      }
    } catch (error) {
      errors.push(`JSON-LDのパースエラー: ${error}`);
    }
  });
  
  return {
    jsonLdCount: jsonLdScripts.length,
    schemas,
    errors,
    warnings
  };
}

function analyzeSchema(schema: any): SchemaInfo {
  const type = schema['@type'] || 'Unknown';
  const missingRequired: string[] = [];
  const warnings: string[] = [];
  
  // 基本的なフィールドチェック
  const commonRequiredFields = ['name', 'description'];
  for (const field of commonRequiredFields) {
    if (!schema[field]) {
      missingRequired.push(field);
    }
  }
  
  // スキーマタイプ別のチェック
  switch (type) {
    case 'Article':
      if (!schema.author) missingRequired.push('author');
      if (!schema.datePublished) missingRequired.push('datePublished');
      if (!schema.headline) missingRequired.push('headline');
      break;
    case 'Organization':
      if (!schema.url) missingRequired.push('url');
      break;
    case 'WebSite':
      if (!schema.url) missingRequired.push('url');
      break;
    case 'FAQPage':
      if (!schema.mainEntity) missingRequired.push('mainEntity');
      break;
    default:
      warnings.push(`不明なスキーマタイプ: ${type}`);
  }
  
  return {
    type,
    validation: {
      valid: missingRequired.length === 0,
      missingRequired,
      warnings
    }
  };
}