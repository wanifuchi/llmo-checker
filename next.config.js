/** @type {import('next').NextConfig} */
const nextConfig = {
  // Vercel環境でpuppeteer-coreと@sparticuz/chromiumを正しく処理
  serverExternalPackages: ['puppeteer-core', '@sparticuz/chromium']
}

module.exports = nextConfig