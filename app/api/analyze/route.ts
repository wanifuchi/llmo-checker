import { NextRequest, NextResponse } from 'next/server';
import { analyzeUrl } from '@/lib/analyzers/url-analyzer';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'URLが指定されていません' },
        { status: 400 }
      );
    }

    // URLの形式をチェック
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { error: '無効なURL形式です' },
        { status: 400 }
      );
    }

    // URLを解析
    const result = await analyzeUrl(url);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('解析エラー:', error);
    return NextResponse.json(
      { error: '解析中にエラーが発生しました' },
      { status: 500 }
    );
  }
}