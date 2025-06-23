'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Globe, Trash2, ExternalLink } from 'lucide-react';
import { getHistory, clearHistory, HistoryItem } from '@/lib/utils/history';

interface HistoryPanelProps {
  onSelectUrl: (url: string) => void;
  onSelectHistory?: (item: HistoryItem) => void;
}

export default function HistoryPanel({ onSelectUrl, onSelectHistory }: HistoryPanelProps) {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    // 初回読み込み
    setHistory(getHistory());
    
    // LocalStorageの変更を監視
    const handleStorageChange = () => {
      setHistory(getHistory());
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleClearHistory = () => {
    if (confirm('履歴をすべて削除しますか？')) {
      clearHistory();
      setHistory([]);
    }
  };

  const getScoreBadgeVariant = (score: number): any => {
    if (score >= 90) return 'success';
    if (score >= 70) return 'warning';
    return 'destructive';
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '今';
    if (minutes < 60) return `${minutes}分前`;
    if (hours < 24) return `${hours}時間前`;
    if (days < 7) return `${days}日前`;
    
    return date.toLocaleDateString('ja-JP');
  };

  if (history.length === 0) {
    return null;
  }

  return (
    <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-xl">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg">解析履歴</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearHistory}
            className="text-destructive hover:text-destructive/90"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            すべて削除
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y">
          {history.map((item) => (
            <div
              key={item.id}
              className="p-4 hover:bg-muted/50 transition-colors cursor-pointer group"
              onClick={() => {
                if (onSelectHistory && item.result) {
                  onSelectHistory(item);
                } else {
                  onSelectUrl(item.url);
                }
              }}
            >
              <div className="flex items-start justify-between space-x-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <Globe className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <p className="text-sm font-medium truncate">
                      {new URL(item.url).hostname}
                    </p>
                    <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {item.url}
                  </p>
                </div>
                <div className="flex flex-col items-end space-y-1 flex-shrink-0">
                  <Badge variant={getScoreBadgeVariant(item.score)}>
                    {item.score}/100
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(new Date(item.timestamp))}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}