'use client';

import { useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface ScrollToResultsProps {
  shouldScroll: boolean;
  targetId: string;
  delay?: number;
}

export default function ScrollToResults({ 
  shouldScroll, 
  targetId, 
  delay = 500 
}: ScrollToResultsProps) {
  useEffect(() => {
    if (shouldScroll) {
      const timer = setTimeout(() => {
        const element = document.getElementById(targetId);
        if (element) {
          // スムーズなスクロールアニメーション
          element.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
          });
          
          // 視覚的フィードバック（軽いハイライト効果）
          element.classList.add('animate-pulse');
          setTimeout(() => {
            element.classList.remove('animate-pulse');
          }, 2000);
        }
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [shouldScroll, targetId, delay]);

  if (!shouldScroll) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-bounce">
      <div className="bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg flex items-center space-x-2">
        <ChevronDown className="h-4 w-4" />
        <span className="text-sm font-medium">結果を確認</span>
      </div>
    </div>
  );
}