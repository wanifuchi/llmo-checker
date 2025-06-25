import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'LLMO最適化チェックツール',
  description: 'ウェブサイトのLLMO（Large Language Model Optimization）最適化状況を分析します',
}

// Vercel環境での最適化
export const dynamic = 'auto';

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