'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="text-center space-y-6 max-w-md">
        <div className="flex justify-center">
          <div className="bg-red-100 rounded-full p-6">
            <AlertCircle className="h-12 w-12 text-red-600" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900">エラーが発生しました</h2>
        <p className="text-gray-600">
          申し訳ございません。予期しないエラーが発生しました。
        </p>
        <Button
          onClick={() => reset()}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          もう一度試す
        </Button>
      </div>
    </div>
  );
}