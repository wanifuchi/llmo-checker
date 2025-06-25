import { fetchHtmlWithVercelBrowser } from './browser-vercel';

// 開発環境かどうかを判定
const isDev = process.env.NODE_ENV === 'development';

export async function getBrowser() {
  // Vercel環境では専用実装を使用
  if (process.env.VERCEL) {
    throw new Error('Use fetchHtmlWithVercelBrowser for Vercel environment');
  }
  
  // Railway環境
  if (process.env.RAILWAY_ENVIRONMENT || process.env.RAILWAY_STATIC_URL) {
    try {
      const [chromium, puppeteerCore] = await Promise.all([
        import('@sparticuz/chromium'),
        import('puppeteer-core')
      ]);
      
      const executablePath = await chromium.default.executablePath();
      const args = [...chromium.default.args];
      
      const browser = await puppeteerCore.default.launch({
        args: [
          ...args,
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-gpu',
          '--disable-dev-shm-usage'
        ],
        defaultViewport: { width: 1280, height: 720 },
        executablePath,
        headless: true
      });
      
      return browser;
    } catch (e) {
      console.error('Railway Chromium failed:', e);
      throw new Error('Chromium not available in Railway environment');
    }
  }
  
  // ローカル環境
  const puppeteerCore = await import('puppeteer-core');
  const executablePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
  
  const browser = await puppeteerCore.default.launch({
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-gpu',
      '--disable-dev-shm-usage'
    ],
    defaultViewport: { width: 1280, height: 720 },
    executablePath,
    headless: true
  });
  
  return browser;
}

export async function fetchHtmlWithBrowser(url: string): Promise<string> {
  // Vercel環境では専用実装を使用
  if (process.env.VERCEL) {
    console.log('Using Vercel-specific browser implementation');
    return fetchHtmlWithVercelBrowser(url);
  }
  
  // Railway環境やローカル環境
  let browser: any = null;
  
  try {
    console.log('ブラウザ起動開始...');
    browser = await getBrowser();
    console.log('ブラウザ起動成功');
    
    const page = await browser.newPage();
    console.log('新しいページ作成成功');
    
    // ナビゲーションタイムアウトを30秒に設定
    page.setDefaultNavigationTimeout(30000);
    
    // 不要なリソースをブロックしてパフォーマンスを向上
    await page.setRequestInterception(true);
    page.on('request', (request: any) => {
      const resourceType = request.resourceType();
      // 画像、フォント、メディアなどをブロック
      if (['image', 'font', 'media', 'websocket'].includes(resourceType)) {
        request.abort();
      } else {
        request.continue();
      }
    });
    
    // ページにアクセス
    console.log(`URL ${url} にアクセス開始...`);
    await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    console.log('ページ読み込み完了');
    
    // JavaScriptレンダリング後のHTMLを取得
    const html = await page.content();
    console.log(`HTML取得完了: ${html.length} 文字`);
    
    await page.close();
    
    return html;
  } catch (error) {
    console.error('Browser fetch error:', error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}