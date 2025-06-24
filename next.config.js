/** @type {import('next').NextConfig} */
const nextConfig = {
  // Vercel環境でpuppeteer-coreと@sparticuz/chromium-minを正しく処理
  serverExternalPackages: ['puppeteer-core', '@sparticuz/chromium-min'],
  
  // SSGを無効化してSSRのみに
  trailingSlash: false,
  output: undefined,
  
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // クライアントサイドでは Node.js モジュールと puppeteer をすべて無効化
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        path: false,
        dns: false,
        child_process: false,
        'node:assert': false,
        'node:child_process': false,
        'node:fs/promises': false,
        'node:fs': false,
        'node:net': false,
        'node:tls': false,
        'node:url': false,
        'node:dns': false,
        'node:stream': false,
        'node:path': false,
        'node:os': false,
        'node:crypto': false,
        'node:zlib': false,
        'node:http': false,
        'node:https': false,
        'puppeteer-core': false,
        '@sparticuz/chromium-min': false,
        puppeteer: false
      };
      
      // puppeteer関連のモジュールを完全に無視
      const webpack = require('webpack');
      config.plugins.push(
        new webpack.IgnorePlugin({
          resourceRegExp: /^(puppeteer|puppeteer-core|@sparticuz\/chromium-min)$/,
        })
      );
    }
    
    // サーバーサイドでもPuppeteer関連を外部依存として処理
    if (isServer) {
      config.externals.push('puppeteer-core', '@sparticuz/chromium-min');
    }
    
    return config;
  }
}

module.exports = nextConfig