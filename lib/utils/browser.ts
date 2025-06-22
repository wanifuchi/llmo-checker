import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';
import type { Browser } from 'puppeteer-core';

// 開発環境かどうかを判定
const isDev = process.env.NODE_ENV === 'development';

export async function getBrowser(): Promise<Browser> {
  if (isDev) {
    // 開発環境では通常のpuppeteerを使用
    try {
      const devPuppeteer = await import('puppeteer');
      return await devPuppeteer.default.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
    } catch (error) {
      console.warn('開発環境でpuppeteerが見つかりません。puppeteer-coreを使用します。');
    }
  }

  // 本番環境（Vercel）では@sparticuz/chromiumを使用
  // パフォーマンス最適化のため、WebGLを無効化
  chromium.setGraphicsMode = false;
  
  const browser = await puppeteer.launch({
    args: [
      ...chromium.args,
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-gpu',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--disable-animations',
      '--disable-background-timer-throttling',
      '--font-render-hinting=none'
    ],
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath(),
    headless: chromium.headless,
    ignoreHTTPSErrors: true
  });
  
  return browser;
}

export async function fetchHtmlWithBrowser(url: string): Promise<string> {
  let browser: Browser | null = null;
  
  try {
    browser = await getBrowser();
    const page = await browser.newPage();
    
    // ナビゲーションタイムアウトを30秒に設定（Vercelの制限を考慮）
    page.setDefaultNavigationTimeout(30000);
    
    // 不要なリソースをブロックしてパフォーマンスを向上
    await page.setRequestInterception(true);
    page.on('request', (request) => {
      const resourceType = request.resourceType();
      // 画像、フォント、メディアなどをブロック
      if (['image', 'font', 'media', 'websocket'].includes(resourceType)) {
        request.abort();
      } else {
        request.continue();
      }
    });
    
    // ページにアクセス
    await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    
    // JavaScriptレンダリング後のHTMLを取得
    const html = await page.content();
    
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