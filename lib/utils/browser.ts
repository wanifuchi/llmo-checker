import puppeteerCore from 'puppeteer-core';

// 開発環境かどうかを判定
const isDev = process.env.NODE_ENV === 'development';

export async function getBrowser() {
  // 本番環境（Railway/Vercel）では@sparticuz/chromium-minを動的インポート
  
  let executablePath;
  let args = [];
  
  if (process.env.AWS_LAMBDA_FUNCTION_VERSION || process.env.VERCEL || process.env.RAILWAY_ENVIRONMENT || process.env.RAILWAY_STATIC_URL) {
    try {
      // AWS Lambda/Vercel/Railway環境では動的インポート
      const chromium = await import('@sparticuz/chromium-min').then(mod => mod.default);
      
      executablePath = await chromium.executablePath(
        'https://github.com/Sparticuz/chromium/releases/download/v126.0.0/chromium-v126.0.0-pack.tar'
      );
      args = [...chromium.args];
    } catch (e) {
      console.error('Chromium import failed, using fallback:', e);
      throw new Error('Chromium not available in production environment');
    }
  } else {
    // ローカル環境では事前インストールされたChromiumを使用
    executablePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
    args = ['--no-sandbox', '--disable-setuid-sandbox'];
  }
  
  const browser = await puppeteerCore.launch({
    args: [
      ...args,
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-gpu',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--disable-animations',
      '--disable-background-timer-throttling',
      '--font-render-hinting=none'
    ],
    defaultViewport: { width: 1280, height: 720 },
    executablePath,
    headless: true
  });
  
  return browser;
}

export async function fetchHtmlWithBrowser(url: string): Promise<string> {
  let browser: any = null;
  
  try {
    console.log('ブラウザ起動開始...');
    browser = await getBrowser();
    console.log('ブラウザ起動成功');
    
    const page = await browser.newPage();
    console.log('新しいページ作成成功');
    
    // ナビゲーションタイムアウトを30秒に設定（Vercelの制限を考慮）
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