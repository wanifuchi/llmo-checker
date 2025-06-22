'use client';

import { AnalysisResult } from '@/lib/types';
import { TrendingUp, Database, FileText, Shield, Trophy, Zap, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils/cn';

interface ScoreDashboardProps {
  result: AnalysisResult;
}

export default function ScoreDashboard({ result }: ScoreDashboardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'from-emerald-500 to-green-600';
    if (score >= 80) return 'from-blue-500 to-cyan-600';
    if (score >= 70) return 'from-yellow-500 to-orange-500';
    if (score >= 60) return 'from-orange-500 to-red-500';
    return 'from-red-500 to-rose-600';
  };

  const getScoreGrade = (score: number) => {
    if (score >= 90) return { grade: 'S', label: '最高ランク' };
    if (score >= 80) return { grade: 'A', label: '優秀' };
    if (score >= 70) return { grade: 'B', label: '良好' };
    if (score >= 60) return { grade: 'C', label: '標準' };
    return { grade: 'D', label: '要改善' };
  };

  const getScoreBadge = (score: number) => {
    if (score >= 90) return 'success';
    if (score >= 70) return 'warning';
    return 'destructive';
  };

  const scoreItems = [
    {
      label: '技術実装',
      value: result.scores.technical,
      icon: Database,
      description: 'llms.txt・サイトマップ・技術的基盤',
      color: 'from-blue-500 to-cyan-600'
    },
    {
      label: '構造化データ',
      value: result.scores.structuredData,
      icon: FileText,
      description: 'JSON-LD・Schema.org・メタデータ',
      color: 'from-purple-500 to-violet-600'
    },
    {
      label: 'コンテンツ品質',
      value: result.scores.content,
      icon: TrendingUp,
      description: 'HTML構造・セマンティック・可読性',
      color: 'from-green-500 to-emerald-600'
    },
    {
      label: 'E-E-A-T',
      value: result.scores.eeat,
      icon: Shield,
      description: '専門性・権威性・信頼性・経験',
      color: 'from-orange-500 to-red-500'
    }
  ];

  const overallGrade = getScoreGrade(result.scores.overall);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Overall Score Hero Section */}
      <Card className="border-0 bg-gradient-to-br from-slate-50 to-blue-50 shadow-xl">
        <CardContent className="p-8">
          <div className="flex flex-col items-center text-center lg:flex-row lg:text-left lg:justify-between">
            <div className="mb-6 lg:mb-0">
              <div className="flex items-center justify-center lg:justify-start mb-4">
                <Trophy className="h-8 w-8 text-yellow-500 mr-3" />
                <h2 className="text-3xl font-bold text-foreground">
                  LLMO最適化スコア
                </h2>
              </div>
              <p className="text-muted-foreground text-lg max-w-2xl">
                大規模言語モデル時代のウェブサイト最適化レベルを総合評価
              </p>
            </div>
            
            <div className="flex flex-col items-center space-y-4">
              {/* Circular Score Display */}
              <div className="relative">
                <div className="w-32 h-32">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      d="m18,2.0845 a 15.9155,15.9155 0 0,1 0,31.831 a 15.9155,15.9155 0 0,1 0,-31.831"
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="2"
                    />
                    <path
                      d="m18,2.0845 a 15.9155,15.9155 0 0,1 0,31.831 a 15.9155,15.9155 0 0,1 0,-31.831"
                      fill="none"
                      stroke="url(#gradient)"
                      strokeWidth="2"
                      strokeDasharray={`${result.scores.overall}, 100`}
                      className="transition-all duration-1000 ease-out"
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" className="text-blue-500" stopColor="currentColor" />
                        <stop offset="100%" className="text-purple-600" stopColor="currentColor" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-foreground">
                        {result.scores.overall}
                      </div>
                      <div className="text-xs text-muted-foreground">/ 100</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="text-center space-y-2">
                <Badge 
                  variant={getScoreBadge(result.scores.overall) as any}
                  className="text-lg px-4 py-1 font-bold"
                >
                  {overallGrade.grade}ランク
                </Badge>
                <p className="text-sm text-muted-foreground">
                  {overallGrade.label}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Scores Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {scoreItems.map((item, index) => {
          const IconComponent = item.icon;
          return (
            <Card key={index} className="group floating-card border-0 bg-white shadow-lg hover:shadow-xl">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r",
                    item.color
                  )}>
                    <IconComponent className="h-6 w-6 text-white" />
                  </div>
                  <Badge variant={getScoreBadge(item.value) as any}>
                    {item.value}/100
                  </Badge>
                </div>
                <CardTitle className="text-lg font-semibold">
                  {item.label}
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <Progress 
                  value={item.value} 
                  className="h-2"
                />
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Score Legend */}
      <Card className="bg-gradient-to-r from-slate-50 to-gray-50 border-0">
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-8 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-emerald-500 to-green-600"></div>
              <span className="text-muted-foreground">90-100: S/A (最高・優秀)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500"></div>
              <span className="text-muted-foreground">70-89: B/C (良好・標準)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-red-500 to-rose-600"></div>
              <span className="text-muted-foreground">0-69: D (要改善)</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}