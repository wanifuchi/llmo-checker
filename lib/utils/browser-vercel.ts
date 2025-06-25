// Vercel専用のブラウザ実装

export async function getBrowserForVercel() {
  try {
    // Vercel環境での正しい動的インポート
    const chromium = await import('@sparticuz/chromium');
    const puppeteer = await import('puppeteer-core');

    // Chromiumの設定
    const executablePath = await chromium.default.executablePath();
    
    console.log('Chromium executable path:', executablePath);
    console.log('Chromium args:', chromium.default.args);

    const browser = await puppeteer.default.launch({
      args: chromium.default.args,
      defaultViewport: chromium.default.defaultViewport,
      executablePath,
      headless: chromium.default.headless,
    });

    console.log('Browser launched successfully');
    return browser;
  } catch (error) {
    console.error('Browser launch failed:', error);
    throw error;
  }
}

export async function fetchHtmlWithVercelBrowser(url: string): Promise<string> {
  let browser: any = null;
  
  try {
    console.log('Vercel browser: Starting browser launch...');
    browser = await getBrowserForVercel();
    console.log('Vercel browser: Browser launched successfully');
    
    const page = await browser.newPage();
    console.log('Vercel browser: New page created');
    
    // タイムアウト設定
    page.setDefaultNavigationTimeout(25000); // Vercelの30秒制限を考慮
    
    // リソースブロック
    await page.setRequestInterception(true);
    page.on('request', (request: any) => {
      const resourceType = request.resourceType();
      if (['image', 'font', 'media', 'websocket', 'other'].includes(resourceType)) {
        request.abort();
      } else {
        request.continue();
      }
    });
    
    console.log(`Vercel browser: Navigating to ${url}...`);
    await page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: 25000
    });
    console.log('Vercel browser: Navigation completed');
    
    const html = await page.content();
    console.log(`Vercel browser: HTML content retrieved (${html.length} chars)`);
    
    await page.close();
    return html;
  } catch (error) {
    console.error('Vercel browser error:', error);
    throw error;
  } finally {
    if (browser) {
      try {
        await browser.close();
        console.log('Vercel browser: Browser closed');
      } catch (closeError) {
        console.error('Browser close error:', closeError);
      }
    }
  }
}