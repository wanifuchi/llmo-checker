'use client';

import { AnalysisResult } from '@/lib/types';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { TrendingUp, Database, FileText, Shield, Star } from 'lucide-react';

interface ScoreDashboardProps {
  result: AnalysisResult;
}

export default function ScoreDashboard({ result }: ScoreDashboardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return '#10B981'; // green
    if (score >= 60) return '#F59E0B'; // yellow
    return '#EF4444'; // red
  };

  const getScoreGrade = (score: number) => {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  };

  const scoreItems = [
    {
      label: '技術面',
      value: result.scores.technical,
      icon: Database,
      description: 'llms.txtと技術的実装'
    },
    {
      label: '構造化データ',
      value: result.scores.structuredData,
      icon: FileText,
      description: 'JSON-LDとSchema.org'
    },
    {
      label: 'コンテンツ',
      value: result.scores.content,
      icon: TrendingUp,
      description: 'コンテンツ構造と品質'
    },
    {
      label: 'E-E-A-T',
      value: result.scores.eeat,
      icon: Shield,
      description: '専門性と信頼性'
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        LLMO最適化スコア
      </h2>
      
      {/* 総合スコア */}
      <div className="flex items-center justify-center mb-8">
        <div className="text-center">
          <div className="w-32 h-32 mx-auto mb-4">
            <CircularProgressbar
              value={result.scores.overall}
              text={`${result.scores.overall}`}
              styles={buildStyles({
                textSize: '24px',
                pathColor: getScoreColor(result.scores.overall),
                textColor: getScoreColor(result.scores.overall),
                trailColor: '#E5E7EB',
                backgroundColor: '#F9FAFB',
              })}
            />
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-2">
            {getScoreGrade(result.scores.overall)}グレード
          </div>
          <div className="text-lg text-gray-600">
            総合スコア: {result.scores.overall}/100
          </div>
        </div>
      </div>

      {/* 詳細スコア */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {scoreItems.map((item, index) => {
          const IconComponent = item.icon;
          return (
            <div key={index} className="text-center">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-center mb-3">
                  <IconComponent className="h-8 w-8 text-blue-600" />
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  {item.label}
                </div>
                <div className="text-2xl font-bold mb-1" style={{color: getScoreColor(item.value)}}>
                  {item.value}
                </div>
                <div className="text-xs text-gray-500">
                  {item.description}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* スコアの範例 */}
      <div className="mt-6 text-center text-sm text-gray-500">
        <div className="flex justify-center space-x-6">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            90-100: Aグレード (優秀)
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
            60-89: B-Cグレード (良好)
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
            0-59: D-Fグレード (改善が必要)
          </div>
        </div>
      </div>
    </div>
  );
}