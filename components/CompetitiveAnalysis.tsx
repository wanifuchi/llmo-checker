'use client';

import { useState } from 'react';
import { CompetitiveAnalysis, CompetitorSite, CompetitorGap, CompetitiveRecommendation } from '@/lib/types';
import { 
  Trophy, 
  TrendingUp, 
  Target, 
  Users, 
  BarChart3, 
  Zap,
  ArrowUp,
  ArrowDown,
  Minus,
  Crown,
  Award,
  Medal,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface CompetitiveAnalysisProps {
  analysis: CompetitiveAnalysis;
  targetAnalysis?: any; // 解析対象サイトの実際の解析結果
}

export default function CompetitiveAnalysisComponent({ analysis, targetAnalysis }: CompetitiveAnalysisProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['ranking']));

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const getPositionIcon = (position: 'leader' | 'challenger' | 'follower') => {
    switch (position) {
      case 'leader': return <Crown className="h-5 w-5 text-yellow-500" />;
      case 'challenger': return <Award className="h-5 w-5 text-gray-400" />;
      case 'follower': return <Medal className="h-5 w-5 text-orange-500" />;
    }
  };

  const getPositionColor = (position: 'leader' | 'challenger' | 'follower') => {
    switch (position) {
      case 'leader': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'challenger': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'follower': return 'bg-orange-100 text-orange-800 border-orange-200';
    }
  };

  const getGapIcon = (gap: number) => {
    if (gap > 15) return <ArrowUp className="h-4 w-4 text-red-500" />;
    if (gap > 5) return <ArrowUp className="h-4 w-4 text-yellow-500" />;
    if (gap > -5) return <Minus className="h-4 w-4 text-gray-500" />;
    return <ArrowDown className="h-4 w-4 text-green-500" />;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'quick-win': return <Zap className="h-4 w-4 text-green-500" />;
      case 'strategic': return <Target className="h-4 w-4 text-blue-500" />;
      case 'long-term': return <TrendingUp className="h-4 w-4 text-purple-500" />;
      default: return <BarChart3 className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* 解析対象サイト表示 */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg p-6 text-white mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="p-3 bg-white/20 rounded-full mr-4">
              <Target className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-1">解析対象サイト</h2>
              <p className="text-blue-100 text-lg font-medium break-all">{analysis.targetUrl}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">
              #{analysis.ranking.position}
            </div>
            <div className="text-blue-100 text-sm">
              {analysis.ranking.outOf}サイト中
            </div>
          </div>
        </div>
      </div>

      {/* 市場ポジション・ランキング */}
      <div className="bg-white rounded-lg shadow p-6">
        <button
          onClick={() => toggleSection('ranking')}
          className="w-full flex items-center justify-between mb-4"
        >
          <div className="flex items-center">
            <Trophy className="h-6 w-6 text-yellow-600 mr-2" />
            <h3 className="text-xl font-semibold text-gray-900">市場ポジション詳細</h3>
          </div>
          {expandedSections.has('ranking') ? 
            <ChevronUp className="h-5 w-5 text-gray-400" /> : 
            <ChevronDown className="h-5 w-5 text-gray-400" />
          }
        </button>
        
        {expandedSections.has('ranking') && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-3xl font-bold text-blue-600">#{analysis.ranking.position}</div>
                <div className="text-sm text-blue-800">
                  {analysis.ranking.outOf}サイト中の順位
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  {analysis.ranking.category}業界
                </div>
              </div>
              
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {Math.round((analysis.ranking.outOf - analysis.ranking.position + 1) / analysis.ranking.outOf * 100)}%
                </div>
                <div className="text-sm text-green-800">上位パーセンタイル</div>
              </div>
              
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-lg font-bold text-purple-600">
                  {analysis.benchmarks.industry}
                </div>
                <div className="text-sm text-purple-800">業界カテゴリ</div>
              </div>
            </div>

            {/* 業界ベンチマーク比較 */}
            <div className="mt-6">
              <h4 className="font-medium text-gray-900 mb-3">業界ベンチマーク比較</h4>
              <div className="space-y-3">
                {Object.entries(analysis.benchmarks.averageScores).map(([area, score]) => {
                  if (area === 'overall') return null;
                  const topScore = analysis.benchmarks.topPerformerScores[area as keyof typeof analysis.benchmarks.topPerformerScores];
                  
                  return (
                    <div key={area} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 capitalize">
                        {area === 'structuredData' ? '構造化データ' : 
                         area === 'eeat' ? 'E-E-A-T' : 
                         area === 'technical' ? '技術的' : 'コンテンツ'}
                      </span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${score}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600 w-12">{score}</span>
                        <span className="text-xs text-gray-500">
                          (トップ: {topScore})
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 競合サイト一覧 */}
      <div className="bg-white rounded-lg shadow p-6">
        <button
          onClick={() => toggleSection('competitors')}
          className="w-full flex items-center justify-between mb-4"
        >
          <div className="flex items-center">
            <Users className="h-6 w-6 text-blue-600 mr-2" />
            <h3 className="text-xl font-semibold text-gray-900">
              競合サイト分析 ({analysis.competitors.length}サイト)
            </h3>
          </div>
          {expandedSections.has('competitors') ? 
            <ChevronUp className="h-5 w-5 text-gray-400" /> : 
            <ChevronDown className="h-5 w-5 text-gray-400" />
          }
        </button>
        
        {expandedSections.has('competitors') && (
          <div className="space-y-4">
            {/* 解析対象サイトを特別表示 */}
            <div className="border-2 border-blue-500 bg-blue-50 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <div className="p-1 bg-blue-500 rounded-full mr-2">
                      <Target className="h-4 w-4 text-white" />
                    </div>
                    <h4 className="font-bold text-blue-900">
                      【解析対象】 あなたのサイト
                    </h4>
                    <span className="ml-2 px-3 py-1 text-xs font-bold rounded-full bg-blue-500 text-white">
                      TARGET SITE
                    </span>
                  </div>
                  <div className="text-sm text-blue-700 mb-2 font-medium">{analysis.targetUrl}</div>
                  <div className="text-2xl font-bold text-blue-900">
                    {targetAnalysis?.scores?.overall?.toFixed(1) || '85.0'}
                    <span className="text-sm font-normal text-blue-600 ml-1">/ 100</span>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <div className="text-blue-600">技術</div>
                      <div className="font-bold text-blue-900">{targetAnalysis?.scores?.technical?.toFixed(0) || '85'}</div>
                    </div>
                    <div>
                      <div className="text-blue-600">コンテンツ</div>
                      <div className="font-bold text-blue-900">{targetAnalysis?.scores?.content?.toFixed(0) || '80'}</div>
                    </div>
                    <div>
                      <div className="text-blue-600">構造化</div>
                      <div className="font-bold text-blue-900">{targetAnalysis?.scores?.structuredData?.toFixed(0) || '90'}</div>
                    </div>
                    <div>
                      <div className="text-blue-600">E-E-A-T</div>
                      <div className="font-bold text-blue-900">{targetAnalysis?.scores?.eeat?.toFixed(0) || '82'}</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-3 p-3 bg-blue-100 rounded border border-blue-200">
                <div className="text-xs font-medium text-blue-800 mb-1">🏆 あなたのサイトの特徴</div>
                <div className="text-sm text-blue-700">
                  競合{analysis.competitors.length}サイトとの比較で、
                  {analysis.ranking.position === 1 ? 'トップポジション' : 
                   analysis.ranking.position <= 2 ? '上位グループ' : '改善の余地あり'}です。
                </div>
              </div>
            </div>
            
            {/* 競合サイト一覧 */}
            <div className="mt-6">
              <h5 className="font-medium text-gray-700 mb-3 flex items-center">
                <Users className="h-4 w-4 mr-2" />
                競合サイト ({analysis.competitors.length}サイト)
              </h5>
              <div className="space-y-3">
                {analysis.competitors.map((competitor, index) => (
                  <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          {getPositionIcon(competitor.marketPosition)}
                          <h4 className="font-medium text-gray-900 ml-2">
                            {competitor.name}
                          </h4>
                          <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full border ${getPositionColor(competitor.marketPosition)}`}>
                            {competitor.marketPosition === 'leader' ? 'リーダー' :
                             competitor.marketPosition === 'challenger' ? 'チャレンジャー' : 'フォロワー'}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 mb-2">{competitor.url}</div>
                        <div className="text-2xl font-bold text-gray-900">
                          {competitor.analysis.scores.overall.toFixed(1)}
                          <span className="text-sm font-normal text-gray-500 ml-1">/ 100</span>
                        </div>
                      </div>
                    
                    <div className="text-right">
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <div className="text-gray-500">技術</div>
                          <div className="font-medium">{competitor.analysis.scores.technical.toFixed(0)}</div>
                        </div>
                        <div>
                          <div className="text-gray-500">コンテンツ</div>
                          <div className="font-medium">{competitor.analysis.scores.content.toFixed(0)}</div>
                        </div>
                        <div>
                          <div className="text-gray-500">構造化</div>
                          <div className="font-medium">{competitor.analysis.scores.structuredData.toFixed(0)}</div>
                        </div>
                        <div>
                          <div className="text-gray-500">E-E-A-T</div>
                          <div className="font-medium">{competitor.analysis.scores.eeat.toFixed(0)}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="font-medium text-green-700 mb-1">強み</div>
                      <ul className="list-disc list-inside text-gray-600 space-y-1">
                        {competitor.strengths.map((strength, i) => (
                          <li key={i}>{strength}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <div className="font-medium text-red-700 mb-1">弱み</div>
                      <ul className="list-disc list-inside text-gray-600 space-y-1">
                        {competitor.weaknesses.map((weakness, i) => (
                          <li key={i}>{weakness}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ギャップ分析 */}
      <div className="bg-white rounded-lg shadow p-6">
        <button
          onClick={() => toggleSection('gaps')}
          className="w-full flex items-center justify-between mb-4"
        >
          <div className="flex items-center">
            <BarChart3 className="h-6 w-6 text-red-600 mr-2" />
            <h3 className="text-xl font-semibold text-gray-900">ギャップ分析</h3>
          </div>
          {expandedSections.has('gaps') ? 
            <ChevronUp className="h-5 w-5 text-gray-400" /> : 
            <ChevronDown className="h-5 w-5 text-gray-400" />
          }
        </button>
        
        {expandedSections.has('gaps') && (
          <div className="space-y-4">
            {analysis.gapAnalysis.map((gap, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    {getGapIcon(gap.gap)}
                    <h4 className="font-medium text-gray-900 ml-2">
                      {gap.area === 'technical' ? '技術的最適化' :
                       gap.area === 'structuredData' ? '構造化データ' :
                       gap.area === 'content' ? 'コンテンツ品質' : 'E-E-A-T'}
                    </h4>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-red-600">
                      -{gap.gap.toFixed(1)}pt
                    </div>
                    <div className="text-xs text-gray-500">差分</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="text-center p-3 bg-blue-50 rounded border border-blue-200">
                    <div className="text-lg font-bold text-blue-600">
                      {gap.currentScore.toFixed(1)}
                    </div>
                    <div className="text-xs text-blue-700 font-medium">🏆 あなたのサイト</div>
                    <div className="text-xs text-blue-600">（解析対象）</div>
                  </div>
                  <div className="text-center p-3 bg-yellow-50 rounded border border-yellow-200">
                    <div className="text-lg font-medium text-yellow-600">
                      {gap.competitorAverage.toFixed(1)}
                    </div>
                    <div className="text-xs text-yellow-700">競合平均</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded border border-green-200">
                    <div className="text-lg font-medium text-green-600">
                      {gap.topCompetitorScore.toFixed(1)}
                    </div>
                    <div className="text-xs text-green-700">トップ競合</div>
                  </div>
                </div>
                
                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className={`px-2 py-1 rounded-full ${
                    gap.impact === 'high' ? 'bg-red-100 text-red-800' :
                    gap.impact === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    インパクト: {gap.impact === 'high' ? '高' : gap.impact === 'medium' ? '中' : '低'}
                  </span>
                  <span className={`px-2 py-1 rounded-full ${
                    gap.effort === 'high' ? 'bg-red-100 text-red-800' :
                    gap.effort === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    工数: {gap.effort === 'high' ? '高' : gap.effort === 'medium' ? '中' : '低'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 競合基準の推奨事項 */}
      <div className="bg-white rounded-lg shadow p-6">
        <button
          onClick={() => toggleSection('recommendations')}
          className="w-full flex items-center justify-between mb-4"
        >
          <div className="flex items-center">
            <Target className="h-6 w-6 text-purple-600 mr-2" />
            <h3 className="text-xl font-semibold text-gray-900">
              競合基準の改善提案 ({analysis.recommendations.length}件)
            </h3>
          </div>
          {expandedSections.has('recommendations') ? 
            <ChevronUp className="h-5 w-5 text-gray-400" /> : 
            <ChevronDown className="h-5 w-5 text-gray-400" />
          }
        </button>
        
        {expandedSections.has('recommendations') && (
          <div className="space-y-4">
            {analysis.recommendations.map((rec, index) => (
              <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      {getTypeIcon(rec.type)}
                      <h4 className="font-medium text-gray-900 ml-2">{rec.title}</h4>
                      <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(rec.priority)}`}>
                        {rec.priority === 'critical' ? '最重要' :
                         rec.priority === 'high' ? '重要' :
                         rec.priority === 'medium' ? '中程度' : '低'}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-2">{rec.description}</p>
                    <div className="text-xs text-gray-500">
                      参考: {rec.competitorExample}
                    </div>
                  </div>
                  
                  <div className="text-right ml-4">
                    <div className="text-lg font-bold text-green-600">
                      {rec.roi.score.toFixed(1)}
                    </div>
                    <div className="text-xs text-gray-500">ROIスコア</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="text-center p-2 bg-blue-50 rounded">
                    <div className="font-medium text-blue-600">
                      +{rec.expectedImpact.scoreImprovement.toFixed(1)}pt
                    </div>
                    <div className="text-xs text-gray-600">スコア向上</div>
                  </div>
                  <div className="text-center p-2 bg-green-50 rounded">
                    <div className="font-medium text-green-600">
                      +{rec.expectedImpact.rankingImprovement}位
                    </div>
                    <div className="text-xs text-gray-600">順位向上</div>
                  </div>
                  <div className="text-center p-2 bg-purple-50 rounded">
                    <div className="font-medium text-purple-600">
                      {rec.expectedImpact.timeToImplement}
                    </div>
                    <div className="text-xs text-gray-600">実装期間</div>
                  </div>
                </div>
                
                <div className="mt-3 text-sm text-gray-700">
                  <div className="font-medium mb-1">実装方法:</div>
                  <p>{rec.implementation}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}