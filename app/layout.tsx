import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'LLMO最適化チェックツール',
  description: 'ウェブサイトのLLMO（Large Language Model Optimization）最適化状況を分析します',
}

// SSRを無効化してクライアントサイドレンダリングのみに
export const dynamic = 'force-dynamic';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ja">
      <body className={inter.className}>{children}</body>
    </html>
  )
}