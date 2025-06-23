import { NextRequest, NextResponse } from 'next/server';
import { analyzeUrl } from '@/lib/analyzers/url-analyzer';
import { generateSampleData } from '@/lib/utils/sample-data';

// サーバーサイドキャッシュ（メモリ内）
const serverCache = new Map<string, { data: any; expires: number }>();
const CACHE_TTL = 1000 * 60 * 60; // 1時間4キャッシュ

function getCacheKey(url: string): string {
  try {
    const urlObj = new URL(url);
    return `${urlObj.protocol}//${urlObj.hostname}${urlObj.pathname}`;
  } catch {
    return url;
  }
}

function cleanExpiredCache(): void {
  const now = Date.now();
  for (const [key, item] of serverCache.entries()) {
    if (item.expires <= now) {
      serverCache.delete(key);
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const { url, bypassCache = false } = await request.json();

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

    // 期限切れキャッシュをクリーンアップ
    cleanExpiredCache();

    // キャッシュチェック（bypassCacheがfalseの場合のみ）
    const cacheKey = getCacheKey(url);
    if (!bypassCache && serverCache.has(cacheKey)) {
      const cached = serverCache.get(cacheKey)!;
      if (cached.expires > Date.now()) {
        console.log(`キャッシュヒット: ${url}`);
        return NextResponse.json({
          ...cached.data,
          fromCache: true,
          cacheHit: true
        });
      } else {
        serverCache.delete(cacheKey);
      }
    }

    // URLを解析
    let result;
    let isUsingFallback = false;
    try {
      console.log(`解析開始: ${url}`);
      // 実際の解析を試みる
      result = await analyzeUrl(url);
      console.log(`解析成功: ${url}`);
    } catch (analysisError) {
      console.error('実解析エラー、サンプルデータで代替:', analysisError);
      console.error('エラー詳細:', analysisError instanceof Error ? analysisError.stack : analysisError);
      isUsingFallback = true;
      // 解析に失敗した場合はサンプルデータで代替
      result = generateSampleData(url);
      
      // フロントエンドにフォールバック使用を通知
      (result as any).isFallbackData = true;
      (result as any).fallbackReason = analysisError instanceof Error ? analysisError.message : '不明なエラー';
      (result as any).originalUrl = url;
    }

    // 成功した結果をキャッシュに保存（フォールバックデータはキャッシュしない）
    if (!isUsingFallback) {
      serverCache.set(cacheKey, {
        data: result,
        expires: Date.now() + CACHE_TTL
      });
      console.log(`キャッシュに保存: ${url}`);
    }
    
    return NextResponse.json({
      ...result,
      fromCache: false,
      cacheHit: false
    });
  } catch (error) {
    console.error('解析エラー:', error);
    return NextResponse.json(
      { error: '解析中にエラーが発生しました' },
      { status: 500 }
    );
  }
}