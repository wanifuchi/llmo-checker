// クライアントサイドで安全に使用できる競合関連ユーティリティ
export function suggestCompetitorsSync(url: string, industry: string): string[] {
  const staticSuggestions: Record<string, string[]> = {
    'ecommerce': ['https://amazon.co.jp', 'https://rakuten.co.jp', 'https://shopping.yahoo.co.jp'],
    'healthcare': ['https://www.hospita.jp', 'https://fdoc.jp'],
    'finance': ['https://www.rakuten-sec.co.jp', 'https://www.sbi-sec.co.jp'],
    'education': ['https://benesse.jp', 'https://schoo.jp'],
    'technology': ['https://tech.nikkeibp.co.jp', 'https://www.itmedia.co.jp'],
    'funeral': [
      'https://www.sousai-sougi.com',
      'https://www.sogi.co.jp', 
      'https://www.urban-funes.com',
      'https://www.tear.co.jp',
      'https://www.chisan.co.jp',
      'https://www.memoria.co.jp',
      'https://www.sousai.jp',
      'https://www.e-sogi.com'
    ],
    'ending': [
      'https://www.tear.co.jp',
      'https://www.sousai-sougi.com',
      'https://www.chisan.co.jp',
      'https://www.ending-note.com',
      'https://www.lifedot.jp',
      'https://www.boen.jp',
      'https://www.osohshiki.jp',
      'https://www.minrevi.jp'
    ],
    'cemetery': [
      'https://www.boseki.net',
      'https://www.ohaka-sagashi.com',
      'https://www.e-ohaka.com',
      'https://www.reien.net',
      'https://www.sekihi.com',
      'https://www.ishicho.com',
      'https://www.ohakabank.com',
      'https://www.sekizai-kyokai.or.jp'
    ],
    'buddhist': [
      'https://www.butsugu.com',
      'https://www.butsudan.ne.jp',
      'https://www.butsudankobo.com',
      'https://www.bukkyo.net',
      'https://www.takayama-wb.co.jp',
      'https://www.yamagataya.co.jp',
      'https://www.hibiki-web.com',
      'https://www.butsudan-web.com'
    ],
    'other': []
  };
  
  return staticSuggestions[industry] || [];
}