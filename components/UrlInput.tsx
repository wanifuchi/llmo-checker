'use client';

import { useState, useEffect } from 'react';
import { Globe, Zap, ArrowRight, Clock, RefreshCw } from 'lucide-react';
import { isCached, getCacheTimeRemainingFormatted } from '@/lib/utils/cache';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils/cn';

interface UrlInputProps {
  onAnalyze: (url: string, forceRefresh?: boolean) => void;
  isAnalyzing?: boolean;
  initialUrl?: string;
}

export default function UrlInput({ onAnalyze, isAnalyzing = false, initialUrl = '' }: UrlInputProps) {
  const [url, setUrl] = useState(initialUrl);
  const [error, setError] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [hasCachedData, setHasCachedData] = useState(false);
  const [cacheTimeRemaining, setCacheTimeRemaining] = useState('');
  
  // initialUrlが変更されたときに入力欄を更新
  useEffect(() => {
    if (initialUrl) {
      setUrl(initialUrl);
    }
  }, [initialUrl]);
  
  // URLが変更されたときにキャッシュ状態をチェック
  useEffect(() => {
    if (url && validateUrl(url)) {
      const cached = isCached(url);
      setHasCachedData(cached);
      if (cached) {
        setCacheTimeRemaining(getCacheTimeRemainingFormatted(url));
      }
    } else {
      setHasCachedData(false);
      setCacheTimeRemaining('');
    }
  }, [url]);

  const validateUrl = (url: string): boolean => {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!url.trim()) {
      setError('URLを入力してください');
      return;
    }

    if (!validateUrl(url)) {
      setError('正しいURL形式で入力してください');
      return;
    }

    onAnalyze(url, false);
  };

  const exampleSites = [
    { name: "企業サイト", url: "https://company.example.com" },
    { name: "ブログ", url: "https://blog.example.com" },
    { name: "ECサイト", url: "https://shop.example.com" }
  ];

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 py-24">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/25 dark:[mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.5))]"></div>
      
      <div className="container relative mx-auto px-4">
        <div className="mx-auto max-w-4xl text-center">
          {/* Hero Section */}
          <div className="mb-12 animate-fade-in">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600 shadow-2xl">
              <Zap className="h-10 w-10 text-white" />
            </div>
            <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground md:text-6xl">
              AI時代の
              <span className="gradient-text"> ウェブ最適化</span>
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground md:text-xl">
              大規模言語モデルによるクロールとインデックスを想定した
              <br className="hidden md:block" />
              次世代ウェブサイト最適化を、いま。
            </p>
          </div>

          {/* Input Section */}
          <Card className="mx-auto max-w-2xl bg-white/80 backdrop-blur-xl border-white/20 shadow-2xl floating-card">
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    解析対象URL
                  </label>
                  <div className={cn(
                    "relative transition-all duration-200",
                    isFocused && "scale-[1.02]"
                  )}>
                    <Globe className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground transition-colors" />
                    <input
                      type="text"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      onFocus={() => setIsFocused(true)}
                      onBlur={() => setIsFocused(false)}
                      placeholder="https://your-website.com"
                      className={cn(
                        "w-full rounded-lg border bg-background pl-12 pr-4 py-4 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50",
                        error && "border-destructive focus:ring-destructive"
                      )}
                      disabled={isAnalyzing}
                    />
                  </div>
                  {error && (
                    <p className="text-sm text-destructive animate-slide-up">
                      {error}
                    </p>
                  )}
                </div>

                <div className="space-y-3">
                  <Button
                    type="submit"
                    disabled={isAnalyzing}
                    size="lg"
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-[1.02]"
                  >
                    {isAnalyzing ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                        AI解析実行中...
                      </>
                    ) : (
                      <>
                        {hasCachedData ? 'キャッシュから表示' : '今すぐ解析開始'}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                  
                  {/* キャッシュ情報と強制更新ボタン */}
                  {hasCachedData && !isAnalyzing && (
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>キャッシュ有効: {cacheTimeRemaining}</span>
                      </div>
                      <Button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          if (validateUrl(url)) {
                            onAnalyze(url, true); // 強制更新
                          }
                        }}
                        variant="ghost"
                        size="sm"
                        className="text-xs"
                      >
                        <RefreshCw className="h-3 w-3 mr-1" />
                        強制更新
                      </Button>
                    </div>
                  )}
                </div>
              </form>

              {/* Example URLs */}
              <div className="mt-8 space-y-3">
                <p className="text-sm font-medium text-muted-foreground">
                  サンプルサイトで試す
                </p>
                <div className="flex flex-wrap gap-2">
                  {exampleSites.map((site, index) => (
                    <button
                      key={index}
                      onClick={() => setUrl(site.url)}
                      className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground transition-colors hover:bg-secondary/80"
                      disabled={isAnalyzing}
                    >
                      {site.name}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Features Preview */}
          <div className="mt-16 grid gap-6 md:grid-cols-3 animate-slide-up">
            {[
              { icon: "🔍", title: "llms.txt解析", desc: "AI向けrobots.txt仕様の実装状況" },
              { icon: "📊", title: "構造化データ", desc: "JSON-LDとSchema.orgの最適化度" },
              { icon: "🏆", title: "E-E-A-T評価", desc: "専門性・権威性・信頼性の総合評価" }
            ].map((feature, index) => (
              <Card key={index} className="border-white/20 bg-white/60 backdrop-blur-sm">
                <CardContent className="p-6 text-center">
                  <div className="text-2xl mb-2">{feature.icon}</div>
                  <h3 className="font-semibold text-foreground mb-1">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}