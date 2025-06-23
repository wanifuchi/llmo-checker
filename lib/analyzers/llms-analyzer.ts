import { LlmsTxtAnalysis } from '@/lib/types';

export async function analyzeLlmsTxt(url: string): Promise<LlmsTxtAnalysis> {
  try {
    // llms.txtのURLを構築
    const llmsTxtUrl = new URL(url);
    llmsTxtUrl.pathname = '/llms.txt';
    
    // llms.txtを取得しようとする
    const response = await fetch(llmsTxtUrl.toString(), {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; LLMO-Checker/1.0)'
      }
    });
    
    if (!response.ok) {
      return {
        exists: false,
        syntax: {
          valid: false,
          errors: ['llms.txtファイルが見つかりません']
        },
        content: {
          allowed: [],
          disallowed: [],
          sitemaps: []
        }
      };
    }
    
    // Content-Typeをチェック（HTMLページが返された場合を除外）
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('text/html')) {
      return {
        exists: false,
        syntax: {
          valid: false,
          errors: ['llms.txtではなくHTMLページが返されました']
        },
        content: {
          allowed: [],
          disallowed: [],
          sitemaps: []
        }
      };
    }
    
    const content = await response.text();
    
    // HTMLっぽい内容をチェック
    if (content.includes('<!DOCTYPE html>') || content.includes('<html')) {
      return {
        exists: false,
        syntax: {
          valid: false,
          errors: ['llms.txtファイルが存在しません（HTMLページが返されました）']
        },
        content: {
          allowed: [],
          disallowed: [],
          sitemaps: []
        }
      };
    }
    
    return parseLlmsTxt(content);
    
  } catch (error) {
    console.error('llms.txt解析エラー:', error);
    return {
      exists: false,
      syntax: {
        valid: false,
        errors: ['アクセスエラー']
      },
      content: {
        allowed: [],
        disallowed: [],
        sitemaps: []
      }
    };
  }
}

function parseLlmsTxt(content: string): LlmsTxtAnalysis {
  const lines = content.split('\n').map(line => line.trim()).filter(line => line);
  const errors: string[] = [];
  const allowed: string[] = [];
  const disallowed: string[] = [];
  const sitemaps: string[] = [];
  
  for (const line of lines) {
    if (line.startsWith('#')) {
      // コメント行はスキップ
      continue;
    }
    
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) {
      errors.push(`無効な行形式: ${line}`);
      continue;
    }
    
    const key = line.substring(0, colonIndex).trim().toLowerCase();
    const value = line.substring(colonIndex + 1).trim();
    
    switch (key) {
      case 'user-agent':
        // User-agent行はスキップ
        break;
      case 'allow':
        allowed.push(value);
        break;
      case 'disallow':
        disallowed.push(value);
        break;
      case 'sitemap':
        sitemaps.push(value);
        break;
      default:
        errors.push(`不明なディレクティブ: ${key}`);
    }
  }
  
  return {
    exists: true,
    syntax: {
      valid: errors.length === 0,
      errors
    },
    content: {
      allowed,
      disallowed,
      sitemaps
    }
  };
}