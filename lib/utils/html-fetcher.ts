// フォールバック用のHTML取得実装（ブラウザレス）

import * as https from 'https';
import * as http from 'http';

interface FetchOptions {
  timeout?: number;
  userAgent?: string;
  followRedirects?: boolean;
  maxRedirects?: number;
}

export async function fetchHtmlFallback(url: string, options: FetchOptions = {}): Promise<string> {
  const {
    timeout = 10000,
    userAgent = 'LLMO-Checker/1.0 (Website Analysis Bot)',
    followRedirects = true,
    maxRedirects = 5
  } = options;

  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;
    
    let redirectCount = 0;
    
    const makeRequest = (currentUrl: string) => {
      const currentUrlObj = new URL(currentUrl);
      const requestOptions = {
        hostname: currentUrlObj.hostname,
        port: currentUrlObj.port || (isHttps ? 443 : 80),
        path: currentUrlObj.pathname + currentUrlObj.search,
        method: 'GET',
        headers: {
          'User-Agent': userAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'ja,en-US;q=0.7,en;q=0.3',
          'Accept-Encoding': 'identity', // gzipを避けてシンプルに
          'Connection': 'close',
          'Upgrade-Insecure-Requests': '1'
        },
        timeout
      };

      const req = client.request(requestOptions, (res) => {
        const { statusCode, headers } = res;
        
        // リダイレクト処理
        if (followRedirects && statusCode && statusCode >= 300 && statusCode < 400) {
          const location = headers.location;
          if (location && redirectCount < maxRedirects) {
            redirectCount++;
            const redirectUrl = new URL(location, currentUrl).toString();
            console.log(`Redirecting to: ${redirectUrl} (${redirectCount}/${maxRedirects})`);
            makeRequest(redirectUrl);
            return;
          }
        }

        if (!statusCode || statusCode < 200 || statusCode >= 300) {
          reject(new Error(`HTTP ${statusCode}: ${res.statusMessage}`));
          return;
        }

        let data = '';
        res.setEncoding('utf8');
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          console.log(`HTML fetched successfully: ${data.length} characters`);
          resolve(data);
        });
      });

      req.on('error', (error) => {
        console.error('Request error:', error);
        reject(error);
      });

      req.on('timeout', () => {
        req.destroy();
        reject(new Error(`Request timeout after ${timeout}ms`));
      });

      req.end();
    };

    makeRequest(url);
  });
}

// メインのHTML取得関数（フォールバック機能付き）
export async function fetchHtmlWithFallback(url: string): Promise<string> {
  try {
    // まずPuppeteerを試す
    const { fetchHtmlWithBrowser } = await import('./browser');
    console.log('Attempting Puppeteer-based fetch...');
    return await fetchHtmlWithBrowser(url);
  } catch (puppeteerError) {
    console.warn('Puppeteer fetch failed, using fallback:', puppeteerError);
    
    try {
      // フォールバック: シンプルなHTTP fetch
      console.log('Using HTTP fallback fetch...');
      return await fetchHtmlFallback(url);
    } catch (fallbackError) {
      console.error('All fetch methods failed:', fallbackError);
      throw new Error(`Failed to fetch HTML: Puppeteer failed (${puppeteerError}), Fallback failed (${fallbackError})`);
    }
  }
}