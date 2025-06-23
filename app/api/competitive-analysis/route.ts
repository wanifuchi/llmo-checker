import { NextRequest, NextResponse } from 'next/server';
import { performCompetitiveAnalysis } from '@/lib/analyzers/competitive-analyzer';
import { AnalysisResult } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const { targetUrl, targetAnalysis, competitorUrls } = await request.json();

    // 入力値検証
    if (!targetUrl || !targetAnalysis || !Array.isArray(competitorUrls)) {
      return NextResponse.json(
        { error: '必要なパラメータが不足しています' },
        { status: 400 }
      );
    }

    if (competitorUrls.length === 0) {
      return NextResponse.json(
        { error: '少なくとも1つの競合URLが必要です' },
        { status: 400 }
      );
    }

    if (competitorUrls.length > 5) {
      return NextResponse.json(
        { error: '競合URLは最大5つまでです' },
        { status: 400 }
      );
    }

    // 競合分析実行
    const competitiveAnalysis = await performCompetitiveAnalysis(
      targetUrl,
      targetAnalysis as AnalysisResult,
      competitorUrls
    );

    return NextResponse.json({
      success: true,
      analysis: competitiveAnalysis,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('競合分析エラー:', error);
    return NextResponse.json(
      { error: '競合分析の処理中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Competitive Analysis API',
    version: '1.0.0',
    endpoints: {
      'POST /api/competitive-analysis': '競合分析を実行'
    }
  });
}