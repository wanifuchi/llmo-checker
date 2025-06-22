import { Search } from 'lucide-react';

export default function Header() {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Search className="h-8 w-8 text-blue-600 mr-3" />
            <h1 className="text-2xl font-bold text-gray-900">
              LLMO最適化チェックツール
            </h1>
          </div>
          <div className="text-sm text-gray-500">
            Large Language Model Optimization
          </div>
        </div>
      </div>
    </header>
  );
}