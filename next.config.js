/** @type {import('next').NextConfig} */
const nextConfig = {
  // Vercel環境でpuppeteer-coreと@sparticuz/chromium-minを正しく処理
  serverExternalPackages: ['puppeteer-core', '@sparticuz/chromium-min']
}

module.exports = nextConfig