import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FileQuestion } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="text-center space-y-6 max-w-md">
        <div className="flex justify-center">
          <div className="bg-gray-100 rounded-full p-6">
            <FileQuestion className="h-12 w-12 text-gray-600" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900">ページが見つかりません</h2>
        <p className="text-gray-600">
          お探しのページは存在しないか、移動した可能性があります。
        </p>
        <Link href="/">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            ホームに戻る
          </Button>
        </Link>
      </div>
    </div>
  );
}