// 外部API設定管理

export interface ExternalApiConfig {
  serpApi: {
    enabled: boolean;
    apiKey?: string;
    monthlyLimit: number;
    currentUsage: number;
  };
  lighthouse: {
    enabled: boolean;
    timeout: number;
    retryAttempts: number;
  };
  googlePageSpeed: {
    enabled: boolean;
    apiKey?: string;
    rateLimit: number;
  };
}

// デフォルト設定
const DEFAULT_CONFIG: ExternalApiConfig = {
  serpApi: {
    enabled: !!process.env.SERP_API_KEY,
    apiKey: process.env.SERP_API_KEY,
    monthlyLimit: 100, // 無料枠制限
    currentUsage: 0
  },
  lighthouse: {
    enabled: true, // 無料なので常に有効
    timeout: 30000, // 30秒
    retryAttempts: 2
  },
  googlePageSpeed: {
    enabled: true, // 無料なので常に有効
    apiKey: process.env.GOOGLE_PAGESPEED_API_KEY,
    rateLimit: 25000 // 1日あたりのクエリ数制限
  }
};

/**
 * 現在の外部API設定を取得
 */
export function getExternalApiConfig(): ExternalApiConfig {
  return {
    ...DEFAULT_CONFIG,
    serpApi: {
      ...DEFAULT_CONFIG.serpApi,
      enabled: DEFAULT_CONFIG.serpApi.enabled && 
               process.env.NEXT_PUBLIC_ENABLE_EXTERNAL_APIS !== 'false'
    },
    lighthouse: {
      ...DEFAULT_CONFIG.lighthouse,
      enabled: process.env.NEXT_PUBLIC_ENABLE_EXTERNAL_APIS !== 'false'
    },
    googlePageSpeed: {
      ...DEFAULT_CONFIG.googlePageSpeed,
      enabled: process.env.NEXT_PUBLIC_ENABLE_EXTERNAL_APIS !== 'false'
    }
  };
}

/**
 * 特定のAPIが使用可能かチェック
 */
export function isApiEnabled(apiName: keyof ExternalApiConfig): boolean {
  const config = getExternalApiConfig();
  return config[apiName].enabled;
}

/**
 * API使用量チェック（SerpAPI用）
 */
export function canUseSerpApi(): boolean {
  const config = getExternalApiConfig();
  return config.serpApi.enabled && 
         config.serpApi.currentUsage < config.serpApi.monthlyLimit;
}

/**
 * API設定の診断情報
 */
export function getApiDiagnostics(): {
  serpApi: { status: string; message: string; };
  lighthouse: { status: string; message: string; };
  googlePageSpeed: { status: string; message: string; };
} {
  const config = getExternalApiConfig();
  
  return {
    serpApi: {
      status: config.serpApi.enabled ? 'enabled' : 'disabled',
      message: config.serpApi.enabled 
        ? `API Key設定済み (${config.serpApi.currentUsage}/${config.serpApi.monthlyLimit} 使用済み)`
        : 'API Keyが未設定です。SERP_API_KEYを環境変数に設定してください。'
    },
    lighthouse: {
      status: config.lighthouse.enabled ? 'enabled' : 'disabled',
      message: config.lighthouse.enabled 
        ? 'Google PageSpeed Insights API (無料) 利用可能'
        : '外部API統合が無効化されています'
    },
    googlePageSpeed: {
      status: config.googlePageSpeed.enabled ? 'enabled' : 'disabled',
      message: config.googlePageSpeed.enabled
        ? config.googlePageSpeed.apiKey 
          ? 'API Key設定済み (認証あり)'
          : '認証なしモード (レート制限あり)'
        : '外部API統合が無効化されています'
    }
  };
}

/**
 * 設定状況のサマリー
 */
export function getConfigSummary(): {
  totalApis: number;
  enabledApis: number;
  freeApis: number;
  warnings: string[];
} {
  const config = getExternalApiConfig();
  const diagnostics = getApiDiagnostics();
  
  const enabledCount = Object.values(config).filter(api => api.enabled).length;
  const warnings: string[] = [];
  
  if (!config.serpApi.enabled) {
    warnings.push('SerpAPI未設定: 自動競合発見機能が制限されます');
  }
  
  if (config.serpApi.enabled && config.serpApi.currentUsage > config.serpApi.monthlyLimit * 0.8) {
    warnings.push('SerpAPI使用量が80%を超えています');
  }
  
  return {
    totalApis: 3,
    enabledApis: enabledCount,
    freeApis: 2, // Lighthouse と PageSpeed Insights
    warnings
  };
}