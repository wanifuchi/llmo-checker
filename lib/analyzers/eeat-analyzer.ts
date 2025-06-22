import * as cheerio from 'cheerio';
import { EeatAnalysis } from '@/lib/types';

export function analyzeEeat($: cheerio.CheerioAPI): EeatAnalysis {
  return {
    authorInfo: analyzeAuthorInfo($),
    organizationInfo: analyzeOrganizationInfo($),
    lastUpdated: extractLastUpdated($),
    trustSignals: findTrustSignals($)
  };
}

function analyzeAuthorInfo($: cheerio.CheerioAPI) {
  const authorKeywords = ['著者', '筆者', 'author', 'ライター'];
  const text = $('body').text().toLowerCase();
  
  let exists = false;
  let complete = false;
  
  // キーワードで著者情報を検索
  for (const keyword of authorKeywords) {
    if (text.includes(keyword.toLowerCase())) {
      exists = true;
      break;
    }
  }
  
  // 構造化データで著者情報を確認
  const jsonLdScripts = $('script[type="application/ld+json"]');
  jsonLdScripts.each((_: number, element: cheerio.Element) => {
    try {
      const data = JSON.parse($(element).html() || '{}');
      if (data.author) {
        exists = true;
        if (data.author.name && data.author.url) {
          complete = true;
        }
      }
    } catch {
      // JSONパースエラーは無視
    }
  });
  
  return { exists, complete };
}

function analyzeOrganizationInfo($: cheerio.CheerioAPI) {
  const orgKeywords = ['会社', '組織', 'organization', '企業'];
  const text = $('body').text().toLowerCase();
  
  let exists = false;
  let complete = false;
  
  // キーワードで組織情報を検索
  for (const keyword of orgKeywords) {
    if (text.includes(keyword.toLowerCase())) {
      exists = true;
      break;
    }
  }
  
  // footerやheaderで会社情報を確認
  const footer = $('footer').text().toLowerCase();
  const header = $('header').text().toLowerCase();
  
  if (footer.includes('会社') || header.includes('会社')) {
    exists = true;
  }
  
  // 連絡先情報があるかチェック
  const contactInfo = $('*').filter((_: number, el: cheerio.Element) => {
    const text = $(el).text().toLowerCase();
    return text.includes('連絡') || text.includes('contact') || text.includes('お問い合わせ');
  });
  
  if (contactInfo.length > 0) {
    complete = true;
  }
  
  return { exists, complete };
}

function extractLastUpdated($: cheerio.CheerioAPI): string | null {
  const updateKeywords = ['更新', '修正', 'updated', 'modified'];
  const timeElements = $('time');
  
  // timeタグから日付を取得
  let latestDate: string | null = null;
  timeElements.each((_: number, element: cheerio.Element) => {
    const datetime = $(element).attr('datetime');
    if (datetime) {
      latestDate = datetime;
    }
  });
  
  if (latestDate) return latestDate;
  
  // テキストから日付を検索
  const text = $('body').text();
  const dateRegex = /(\d{4})[\/-](\d{1,2})[\/-](\d{1,2})/g;
  const matches = text.match(dateRegex);
  
  if (matches && matches.length > 0) {
    return matches[matches.length - 1]; // 最後の日付を返す
  }
  
  return null;
}

function findTrustSignals($: cheerio.CheerioAPI): string[] {
  const signals: string[] = [];
  const text = $('body').text().toLowerCase();
  
  // SSL証明書の確認（httpsから推測）
  if (window.location?.protocol === 'https:') {
    signals.push('SSL証明書');
  }
  
  // プライバシーポリシー
  if (text.includes('プライバシー') || text.includes('privacy')) {
    signals.push('プライバシーポリシー');
  }
  
  // 利用規約
  if (text.includes('利用規約') || text.includes('terms')) {
    signals.push('利用規約');
  }
  
  // 投稿日や更新日
  if (text.includes('投稿') || text.includes('更新')) {
    signals.push('日付情報');
  }
  
  // 証明書や資格
  const credentials = ['資格', '証明書', 'ライセンス', 'certification'];
  for (const cred of credentials) {
    if (text.includes(cred.toLowerCase())) {
      signals.push('資格・証明書');
      break;
    }
  }
  
  return signals;
}