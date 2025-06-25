'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Home } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center">
      <div className="container mx-auto px-4">
        <Card className="max-w-2xl mx-auto border-0 bg-white/80 backdrop-blur-sm shadow-xl">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-red-500 to-pink-600 shadow-2xl">
              <AlertCircle className="h-10 w-10 text-white" />
            </div>
            <CardTitle className="text-4xl font-bold text-foreground mb-2">
              404 - ページが見つかりません
            </CardTitle>
            <p className="text-lg text-muted-foreground">
              お探しのページは存在しないか、移動された可能性があります。
            </p>
          </CardHeader>
          <CardContent className="text-center">
            <Link 
              href="/"
              className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
            >
              <Home className="h-4 w-4" />
              <span>ホームに戻る</span>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}