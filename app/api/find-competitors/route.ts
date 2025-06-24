import { NextRequest, NextResponse } from 'next/server';
import { findCompetitorsByKeywords } from '@/lib/analyzers/external-apis';

export async function POST(request: NextRequest) {
  try {
    const { targetUrl, industry } = await request.json();

    if (!targetUrl || !industry) {
      return NextResponse.json(
        { error: 'targetUrlとindustryパラメータが必要です' },
        { status: 400 }
      );
    }

    // 外部APIで競合を検索
    const competitors = await findCompetitorsByKeywords(targetUrl, industry);

    return NextResponse.json({
      success: true,
      competitors,
      targetUrl,
      industry,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('競合発見エラー:', error);
    return NextResponse.json(
      { 
        success: false,
        error: '競合発見の処理中にエラーが発生しました',
        competitors: [] // フォールバック
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Find Competitors API',
    version: '1.0.0',
    endpoints: {
      'POST /api/find-competitors': '競合サイトの自動発見'
    }
  });
}