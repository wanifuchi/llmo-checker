import { Brain, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 opacity-20 blur-md"></div>
            <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600">
              <Brain className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg font-bold gradient-text">
              LLMO Analyzer
            </h1>
            <p className="text-xs text-muted-foreground hidden sm:block">
              AI最適化の未来を解析
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Sparkles className="h-4 w-4 text-yellow-500" />
          <span className="text-sm font-medium text-muted-foreground hidden md:inline">
            Large Language Model Optimization
          </span>
        </div>
      </div>
    </header>
  );
}