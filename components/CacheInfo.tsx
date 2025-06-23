'use client';

import { Badge } from '@/components/ui/badge';
import { Clock, Database, Zap } from 'lucide-react';

interface CacheInfoProps {
  fromCache?: boolean;
  cacheHit?: boolean;
  cacheTimeRemaining?: string;
  className?: string;
}

export default function CacheInfo({ 
  fromCache = false, 
  cacheHit = false, 
  cacheTimeRemaining,
  className = '' 
}: CacheInfoProps) {
  if (!fromCache && !cacheHit) return null;

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {fromCache && (
        <Badge variant="outline" className="flex items-center space-x-1 text-xs bg-blue-50 border-blue-200 text-blue-700">
          <Zap className="h-3 w-3" />
          <span>高速表示</span>
        </Badge>
      )}
      
      {cacheHit && (
        <Badge variant="outline" className="flex items-center space-x-1 text-xs bg-green-50 border-green-200 text-green-700">
          <Database className="h-3 w-3" />
          <span>キャッシュヒット</span>
        </Badge>
      )}
      
      {cacheTimeRemaining && (
        <Badge variant="outline" className="flex items-center space-x-1 text-xs bg-gray-50 border-gray-200 text-gray-600">
          <Clock className="h-3 w-3" />
          <span>有効期限: {cacheTimeRemaining}</span>
        </Badge>
      )}
    </div>
  );
}