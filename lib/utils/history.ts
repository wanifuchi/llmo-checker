import { AnalysisResult } from '@/lib/types';

export interface HistoryItem {
  id: string;
  url: string;
  timestamp: Date;
  score: number;
  result?: AnalysisResult; // 完全な解析結果を保存
}

const HISTORY_KEY = 'llmo-checker-history';
const MAX_HISTORY_ITEMS = 20;

export function getHistory(): HistoryItem[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(HISTORY_KEY);
    if (!stored) return [];
    
    const items = JSON.parse(stored);
    // Date文字列をDateオブジェクトに変換
    return items.map((item: any) => ({
      ...item,
      timestamp: new Date(item.timestamp)
    }));
  } catch (error) {
    console.error('履歴の読み込みエラー:', error);
    return [];
  }
}

export function addToHistory(result: AnalysisResult): void {
  if (typeof window === 'undefined') return;
  
  try {
    const history = getHistory();
    
    // 新しい履歴項目を作成
    const newItem: HistoryItem = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      url: result.url,
      timestamp: result.timestamp,
      score: result.scores.overall,
      result: result // 完全な解析結果を保存
    };
    
    // 同じURLの古い項目を削除
    const filteredHistory = history.filter(item => item.url !== result.url);
    
    // 新しい項目を先頭に追加
    const updatedHistory = [newItem, ...filteredHistory];
    
    // 最大数を超えたら古い項目を削除
    const limitedHistory = updatedHistory.slice(0, MAX_HISTORY_ITEMS);
    
    // LocalStorageに保存
    localStorage.setItem(HISTORY_KEY, JSON.stringify(limitedHistory));
  } catch (error) {
    console.error('履歴の保存エラー:', error);
  }
}

export function getHistoryItemById(id: string): HistoryItem | null {
  const history = getHistory();
  return history.find(item => item.id === id) || null;
}

export function getHistoryItemByUrl(url: string): HistoryItem | null {
  const history = getHistory();
  return history.find(item => item.url === url) || null;
}

export function clearHistory(): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch (error) {
    console.error('履歴のクリアエラー:', error);
  }
}