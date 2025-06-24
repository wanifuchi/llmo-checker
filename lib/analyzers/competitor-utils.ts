// クライアントサイドで安全に使用できる競合関連ユーティリティ
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