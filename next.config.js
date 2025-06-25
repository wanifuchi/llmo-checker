/** @type {import('next').NextConfig} */
const nextConfig = {
  // Vercel/Railway対応設定
  trailingSlash: false,
  serverExternalPackages: ['puppeteer-core', '@sparticuz/chromium'],
  
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
        '@sparticuz/chromium': false,
        puppeteer: false
      };
      
      // puppeteer関連のモジュールを完全に無視
      const webpack = require('webpack');
      config.plugins.push(
        new webpack.IgnorePlugin({
          resourceRegExp: /^(puppeteer|puppeteer-core|@sparticuz\/chromium)$/,
        })
      );
    }
    
    return config;
  }
}

module.exports = nextConfig