import { NextRequest, NextResponse } from 'next/server';
import { getApiDiagnostics, getConfigSummary } from '@/lib/config/external-apis';

export async function GET() {
  try {
    const diagnostics = getApiDiagnostics();
    const summary = getConfigSummary();
    
    // APIキーの存在確認（セキュリティのため実際の値は表示しない）
    const apiStatus = {
      serpApi: {
        configured: !!process.env.SERP_API_KEY,
        keyLength: process.env.SERP_API_KEY?.length || 0,
        status: diagnostics.serpApi.status
      },
      googlePageSpeed: {
        configured: !!process.env.GOOGLE_PAGESPEED_API_KEY,
        keyLength: process.env.GOOGLE_PAGESPEED_API_KEY?.length || 0,
        status: diagnostics.googlePageSpeed.status
      },
      lighthouse: {
        status: diagnostics.lighthouse.status
      }
    };
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      apiStatus,
      summary,
      diagnostics,
      environment: {
        nodeEnv: process.env.NODE_ENV,
        enableExternalApis: process.env.NEXT_PUBLIC_ENABLE_EXTERNAL_APIS
      }
    });
  } catch (error) {
    console.error('API設定テストエラー:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'API設定の確認中にエラーが発生しました',
        details: error instanceof Error ? error.message : '不明なエラー'
      },
      { status: 500 }
    );
  }
}