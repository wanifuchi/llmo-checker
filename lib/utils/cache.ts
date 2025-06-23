import { AnalysisResult } from '@/lib/types';

interface CacheItem {
  data: AnalysisResult;
  timestamp: number;
  expires: number;
}

const CACHE_KEY = 'llmo-analysis-cache';
const DEFAULT_TTL = 1000 * 60 * 60 * 24; // 24時間のデフォルトキャッシュ期間
const MAX_CACHE_SIZE = 100; // 最大キャッシュ数

/**
 * URLをキャッシュキーに変換する
 */
function getCacheKey(url: string): string {
  try {
    const urlObj = new URL(url);
    // プロトコル、ホスト名、パス名のみを使用（クエリパラメータは除外）
    return `${urlObj.protocol}//${urlObj.hostname}${urlObj.pathname}`;
  } catch {
    return url;
  }
}

/**
 * 現在のキャッシュデータを取得する
 */
function getCacheData(): Record<string, CacheItem> {
  if (typeof window === 'undefined') return {};
  
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return {};
    
    const data = JSON.parse(cached);
    const now = Date.now();
    
    // 期限切れのアイテムを除去
    const validData: Record<string, CacheItem> = {};
    Object.entries(data).forEach(([key, item]) => {
      const cacheItem = item as CacheItem;
      if (cacheItem.expires > now) {
        validData[key] = cacheItem;
      }
    });
    
    return validData;
  } catch (error) {
    console.error('キャッシュデータの読み込みエラー:', error);
    return {};
  }
}

/**
 * キャッシュデータを保存する
 */
function setCacheData(data: Record<string, CacheItem>): void {
  if (typeof window === 'undefined') return;
  
  try {
    // キャッシュサイズ制限
    const entries = Object.entries(data);
    if (entries.length > MAX_CACHE_SIZE) {
      // 古いものから削除
      const sortedEntries = entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
      const limitedEntries = sortedEntries.slice(-MAX_CACHE_SIZE);
      data = Object.fromEntries(limitedEntries);
    }
    
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('キャッシュデータの保存エラー:', error);
  }
}

/**
 * 解析結果をキャッシュから取得する
 */
export function getCachedAnalysis(url: string): AnalysisResult | null {
  const cacheKey = getCacheKey(url);
  const cacheData = getCacheData();
  const item = cacheData[cacheKey];
  
  if (!item) return null;
  
  const now = Date.now();
  if (item.expires <= now) {
    // 期限切れの場合は削除
    delete cacheData[cacheKey];
    setCacheData(cacheData);
    return null;
  }
  
  return item.data;
}

/**
 * 解析結果をキャッシュに保存する
 */
export function setCachedAnalysis(url: string, result: AnalysisResult, ttl: number = DEFAULT_TTL): void {
  const cacheKey = getCacheKey(url);
  const cacheData = getCacheData();
  const now = Date.now();
  
  cacheData[cacheKey] = {
    data: result,
    timestamp: now,
    expires: now + ttl
  };
  
  setCacheData(cacheData);
}

/**
 * 特定のURLのキャッシュを削除する
 */
export function clearCachedAnalysis(url: string): void {
  const cacheKey = getCacheKey(url);
  const cacheData = getCacheData();
  
  if (cacheData[cacheKey]) {
    delete cacheData[cacheKey];
    setCacheData(cacheData);
  }
}

/**
 * すべてのキャッシュをクリアする
 */
export function clearAllCache(): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(CACHE_KEY);
  } catch (error) {
    console.error('キャッシュのクリアエラー:', error);
  }
}

/**
 * キャッシュ統計情報を取得する
 */
export function getCacheStats(): {
  totalItems: number;
  totalSize: string;
  oldestItem: Date | null;
  newestItem: Date | null;
} {
  const cacheData = getCacheData();
  const entries = Object.values(cacheData);
  
  if (entries.length === 0) {
    return {
      totalItems: 0,
      totalSize: '0 B',
      oldestItem: null,
      newestItem: null
    };
  }
  
  // データサイズを概算計算
  const sizeBytes = JSON.stringify(cacheData).length;
  const sizeFormatted = formatBytes(sizeBytes);
  
  // 最古と最新のタイムスタンプ
  const timestamps = entries.map(item => item.timestamp);
  const oldestTimestamp = Math.min(...timestamps);
  const newestTimestamp = Math.max(...timestamps);
  
  return {
    totalItems: entries.length,
    totalSize: sizeFormatted,
    oldestItem: new Date(oldestTimestamp),
    newestItem: new Date(newestTimestamp)
  };
}

/**
 * バイト数を人間が読みやすい形式にフォーマット
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * キャッシュの有効期限をチェックして期限切れアイテムを削除
 */
export function cleanExpiredCache(): number {
  const cacheData = getCacheData();
  const now = Date.now();
  let removedCount = 0;
  
  Object.entries(cacheData).forEach(([key, item]) => {
    if (item.expires <= now) {
      delete cacheData[key];
      removedCount++;
    }
  });
  
  if (removedCount > 0) {
    setCacheData(cacheData);
  }
  
  return removedCount;
}

/**
 * URLがキャッシュに存在するかチェック
 */
export function isCached(url: string): boolean {
  const cachedResult = getCachedAnalysis(url);
  return cachedResult !== null;
}

/**
 * キャッシュアイテムの残り有効期限を取得（ミリ秒）
 */
export function getCacheTimeRemaining(url: string): number {
  const cacheKey = getCacheKey(url);
  const cacheData = getCacheData();
  const item = cacheData[cacheKey];
  
  if (!item) return 0;
  
  const now = Date.now();
  const remaining = item.expires - now;
  
  return Math.max(0, remaining);
}

/**
 * キャッシュアイテムの残り有効期限を人間が読みやすい形式で取得
 */
export function getCacheTimeRemainingFormatted(url: string): string {
  const remaining = getCacheTimeRemaining(url);
  
  if (remaining === 0) return 'キャッシュなし';
  
  const hours = Math.floor(remaining / (1000 * 60 * 60));
  const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 0) {
    return `${hours}時間${minutes}分`;
  } else {
    return `${minutes}分`;
  }
}