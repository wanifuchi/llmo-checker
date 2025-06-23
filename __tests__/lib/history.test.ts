import {
  getHistory,
  addToHistory,
  clearHistory,
  getHistoryItemById,
  getHistoryItemByUrl,
  HistoryItem
} from '@/lib/utils/history';
import { AnalysisResult } from '@/lib/types';

// モックデータ
const mockAnalysisResult: AnalysisResult = {
  url: 'https://example.com',
  timestamp: new Date('2024-01-01T10:00:00Z'),
  scores: {
    overall: 85,
    technical: 80,
    structuredData: 90,
    content: 85,
    eeat: 80
  },
  details: {
    llmsTxt: {
      exists: true,
      syntax: { valid: true, errors: [] },
      content: { allowed: [], disallowed: [], sitemaps: [] }
    },
    structuredData: {
      jsonLdCount: 2,
      schemas: [],
      errors: [],
      warnings: []
    },
    content: {
      headingStructure: { valid: true, issues: [] },
      semanticHtml: { score: 85, elements: [] },
      faqDetected: true,
      listElements: 5,
      summarySection: true
    },
    eeat: {
      authorInfo: { exists: true, complete: true },
      organizationInfo: { exists: true, complete: false },
      lastUpdated: '2024-01-01',
      trustSignals: ['contact-info', 'about-page']
    }
  },
  suggestions: []
};

describe('History Utility Functions', () => {
  beforeEach(() => {
    // 各テスト前に履歴をクリア
    clearHistory();
    jest.clearAllMocks();
  });

  describe('addToHistory & getHistory', () => {
    it('should add and retrieve history items', () => {
      // 履歴に追加
      addToHistory(mockAnalysisResult);
      
      // 履歴を取得
      const history = getHistory();
      
      expect(history).toHaveLength(1);
      expect(history[0].url).toBe(mockAnalysisResult.url);
      expect(history[0].score).toBe(mockAnalysisResult.scores.overall);
      expect(history[0].timestamp).toEqual(mockAnalysisResult.timestamp);
      expect(history[0].result).toEqual(mockAnalysisResult);
    });

    it('should maintain chronological order (newest first)', () => {
      const result1 = { ...mockAnalysisResult, url: 'https://example1.com', timestamp: new Date('2024-01-01T10:00:00Z') };
      const result2 = { ...mockAnalysisResult, url: 'https://example2.com', timestamp: new Date('2024-01-01T11:00:00Z') };
      
      addToHistory(result1);
      addToHistory(result2);
      
      const history = getHistory();
      
      expect(history).toHaveLength(2);
      expect(history[0].url).toBe('https://example2.com'); // 新しい方が最初
      expect(history[1].url).toBe('https://example1.com');
    });

    it('should replace existing URL with newer entry', () => {
      const originalResult = { ...mockAnalysisResult, scores: { ...mockAnalysisResult.scores, overall: 75 } };
      const updatedResult = { ...mockAnalysisResult, scores: { ...mockAnalysisResult.scores, overall: 85 } };
      
      addToHistory(originalResult);
      addToHistory(updatedResult);
      
      const history = getHistory();
      
      expect(history).toHaveLength(1); // 同じURLなので1つだけ
      expect(history[0].score).toBe(85); // 新しいスコア
    });

    it('should limit history to maximum items', () => {
      // MAX_HISTORY_ITEMS = 20 より多く追加
      for (let i = 0; i < 25; i++) {
        const result = {
          ...mockAnalysisResult,
          url: `https://example${i}.com`,
          timestamp: new Date(`2024-01-${String(i + 1).padStart(2, '0')}T10:00:00Z`)
        };
        addToHistory(result);
      }
      
      const history = getHistory();
      
      expect(history).toHaveLength(20); // 最大20件まで
      // 最新の20件が保持されているか確認
      expect(history[0].url).toBe('https://example24.com');
      expect(history[19].url).toBe('https://example5.com');
    });
  });

  describe('getHistoryItemById', () => {
    it('should find item by ID', () => {
      addToHistory(mockAnalysisResult);
      const history = getHistory();
      const firstItem = history[0];
      
      const found = getHistoryItemById(firstItem.id);
      
      expect(found).toEqual(firstItem);
    });

    it('should return null for non-existent ID', () => {
      const found = getHistoryItemById('non-existent-id');
      expect(found).toBeNull();
    });
  });

  describe('getHistoryItemByUrl', () => {
    it('should find item by URL', () => {
      addToHistory(mockAnalysisResult);
      
      const found = getHistoryItemByUrl(mockAnalysisResult.url);
      
      expect(found).toBeTruthy();
      expect(found?.url).toBe(mockAnalysisResult.url);
    });

    it('should return null for non-existent URL', () => {
      const found = getHistoryItemByUrl('https://nonexistent.com');
      expect(found).toBeNull();
    });
  });

  describe('clearHistory', () => {
    it('should remove all history items', () => {
      addToHistory(mockAnalysisResult);
      expect(getHistory()).toHaveLength(1);
      
      clearHistory();
      
      expect(getHistory()).toHaveLength(0);
    });
  });

  describe('Date handling', () => {
    it('should correctly parse stored date strings', () => {
      // localStorageに直接JSON文字列を設定（Date文字列として）
      const historyItem = {
        id: 'test-id',
        url: 'https://example.com',
        timestamp: '2024-01-01T10:00:00.000Z', // 文字列として保存
        score: 85,
        result: mockAnalysisResult
      };
      
      localStorage.setItem('llmo-checker-history', JSON.stringify([historyItem]));
      
      const history = getHistory();
      
      expect(history).toHaveLength(1);
      expect(history[0].timestamp).toBeInstanceOf(Date);
      expect(history[0].timestamp.toISOString()).toBe('2024-01-01T10:00:00.000Z');
    });
  });

  describe('Error handling', () => {
    it('should handle localStorage errors gracefully', () => {
      // localStorageのsetItemでエラーを発生させる
      const originalSetItem = Storage.prototype.setItem;
      Storage.prototype.setItem = jest.fn(() => {
        throw new Error('Storage quota exceeded');
      });

      expect(() => {
        addToHistory(mockAnalysisResult);
      }).not.toThrow();

      // 元に戻す
      Storage.prototype.setItem = originalSetItem;
    });

    it('should handle localStorage getItem errors gracefully', () => {
      // localStorageのgetItemでエラーを発生させる
      const originalGetItem = Storage.prototype.getItem;
      Storage.prototype.getItem = jest.fn(() => {
        throw new Error('Storage error');
      });

      const history = getHistory();
      expect(history).toEqual([]);

      // 元に戻す
      Storage.prototype.getItem = originalGetItem;
    });

    it('should handle invalid JSON in localStorage', () => {
      localStorage.setItem('llmo-checker-history', 'invalid-json');
      
      const history = getHistory();
      expect(history).toEqual([]);
    });
  });

  describe('Server-side rendering compatibility', () => {
    it('should return empty array when window is undefined', () => {
      // windowオブジェクトを一時的に削除
      const originalWindow = global.window;
      delete (global as any).window;

      const history = getHistory();
      expect(history).toEqual([]);

      // windowオブジェクトを復元
      global.window = originalWindow;
    });

    it('should do nothing when window is undefined for addToHistory', () => {
      // windowオブジェクトを一時的に削除
      const originalWindow = global.window;
      delete (global as any).window;

      expect(() => {
        addToHistory(mockAnalysisResult);
      }).not.toThrow();

      // windowオブジェクトを復元
      global.window = originalWindow;
    });
  });
});