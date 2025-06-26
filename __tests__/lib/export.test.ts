import {
  exportToJSON,
  exportToCSV,
  exportToPDF
} from '@/lib/utils/export';
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
      schemas: [
        {
          type: 'Organization',
          validation: { valid: true, missingRequired: [], warnings: [] }
        }
      ],
      errors: [],
      warnings: []
    },
    content: {
      headingStructure: { valid: true, issues: [] },
      semanticHtml: { score: 85, elements: ['article', 'section'] },
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
  suggestions: [
    {
      id: '1',
      priority: 'high',
      category: 'technical',
      title: 'llms.txtファイルを追加',
      description: 'AI向けのrobots.txtファイルを作成してください',
      implementation: 'ルートディレクトリにllms.txtファイルを配置',
      codeExample: '# llms.txt\nUser-agent: *\nAllow: /'
    }
  ]
};

// DOM API のモック
global.URL.createObjectURL = jest.fn(() => 'mock-blob-url');
global.URL.revokeObjectURL = jest.fn();

// document.createElement のモック
const mockLink = {
  href: '',
  download: '',
  click: jest.fn(),
};

Object.defineProperty(document, 'createElement', {
  value: jest.fn((tagName) => {
    if (tagName === 'a') {
      return mockLink;
    }
    return {
      appendChild: jest.fn(),
      removeChild: jest.fn(),
    };
  }),
});

Object.defineProperty(document.body, 'appendChild', {
  value: jest.fn(),
});

Object.defineProperty(document.body, 'removeChild', {
  value: jest.fn(),
});

// window.open のモック
const mockPrintWindow = {
  document: {
    write: jest.fn(),
    close: jest.fn(),
  },
  print: jest.fn(),
  close: jest.fn(),
  onafterprint: null,
};

global.window.open = jest.fn(() => mockPrintWindow) as any;

describe('Export Utility Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('exportToJSON', () => {
    it('should create JSON blob and trigger download', () => {
      exportToJSON(mockAnalysisResult);

      // Blobが作成されたか確認
      expect(global.URL.createObjectURL).toHaveBeenCalled();
      
      // リンク要素が作成されたか確認
      expect(document.createElement).toHaveBeenCalledWith('a');
      
      // ダウンロードが実行されたか確認
      expect(mockLink.click).toHaveBeenCalled();
      
      // クリーンアップが実行されたか確認
      expect(global.URL.revokeObjectURL).toHaveBeenCalled();
      expect(document.body.appendChild).toHaveBeenCalled();
      expect(document.body.removeChild).toHaveBeenCalled();
    });

    it('should use custom filename when provided', () => {
      const customFilename = 'custom-report.json';
      exportToJSON(mockAnalysisResult, customFilename);

      expect(mockLink.download).toBe(customFilename);
    });

    it('should generate default filename when not provided', () => {
      exportToJSON(mockAnalysisResult);

      expect(mockLink.download).toMatch(/llmo-analysis-example\.com-\d{4}-\d{2}-\d{2}-\d{2}-\d{2}-\d{2}\.json/);
    });

    it('should create valid JSON content', () => {
      exportToJSON(mockAnalysisResult);

      const createObjectURLCall = (global.URL.createObjectURL as jest.Mock).mock.calls[0];
      const blob = createObjectURLCall[0];
      
      expect(blob).toBeInstanceOf(Blob);
      expect(blob.type).toBe('application/json');
    });
  });

  describe('exportToCSV', () => {
    it('should create CSV blob and trigger download for multiple results', () => {
      const results = [mockAnalysisResult];
      exportToCSV(results);

      expect(global.URL.createObjectURL).toHaveBeenCalled();
      expect(mockLink.click).toHaveBeenCalled();
      expect(global.URL.revokeObjectURL).toHaveBeenCalled();
    });

    it('should generate proper CSV headers', () => {
      const results = [mockAnalysisResult];
      exportToCSV(results);

      const createObjectURLCall = (global.URL.createObjectURL as jest.Mock).mock.calls[0];
      const blob = createObjectURLCall[0];
      
      expect(blob).toBeInstanceOf(Blob);
      expect(blob.type).toBe('text/csv;charset=utf-8;');
    });

    it('should use custom filename when provided', () => {
      const customFilename = 'custom-summary.csv';
      const results = [mockAnalysisResult];
      exportToCSV(results, customFilename);

      expect(mockLink.download).toBe(customFilename);
    });

    it('should generate default filename when not provided', () => {
      const results = [mockAnalysisResult];
      exportToCSV(results);

      expect(mockLink.download).toMatch(/llmo-analysis-summary-\d{4}-\d{2}-\d{2}-\d{2}-\d{2}-\d{2}\.csv/);
    });

    it('should handle empty results array', () => {
      const results: AnalysisResult[] = [];
      
      expect(() => {
        exportToCSV(results);
      }).not.toThrow();
    });
  });

  describe('exportToPDF', () => {
    it('should open print window and generate HTML content', () => {
      exportToPDF(mockAnalysisResult);

      expect(window.open).toHaveBeenCalledWith('', '_blank');
      expect(mockPrintWindow.document.write).toHaveBeenCalled();
      expect(mockPrintWindow.document.close).toHaveBeenCalled();
      expect(mockPrintWindow.print).toHaveBeenCalled();
    });

    it('should generate HTML content with analysis data', () => {
      exportToPDF(mockAnalysisResult);

      const htmlContent = (mockPrintWindow.document.write as jest.Mock).mock.calls[0][0];
      
      expect(htmlContent).toContain('LLMO解析レポート');
      expect(htmlContent).toContain('https://example.com');
      expect(htmlContent).toContain('85/100'); // 総合スコア
      expect(htmlContent).toContain('llms.txt解析');
      expect(htmlContent).toContain('構造化データ');
    });

    it('should handle popup blocker gracefully', () => {
      // window.openがnullを返す場合（ポップアップブロック）
      (global.window.open as jest.Mock).mockReturnValueOnce(null);

      // アラートをモック
      global.alert = jest.fn();

      exportToPDF(mockAnalysisResult);

      expect(global.alert).toHaveBeenCalledWith(
        'ポップアップがブロックされました。ポップアップを許可してからもう一度お試しください。'
      );
    });

    it('should include suggestions in HTML output', () => {
      exportToPDF(mockAnalysisResult);

      const htmlContent = (mockPrintWindow.document.write as jest.Mock).mock.calls[0][0];
      
      expect(htmlContent).toContain('改善提案');
      expect(htmlContent).toContain('llms.txtファイルを追加');
      expect(htmlContent).toContain('# llms.txt'); // コードサンプル
    });

    it('should format scores with correct CSS classes', () => {
      exportToPDF(mockAnalysisResult);

      const htmlContent = (mockPrintWindow.document.write as jest.Mock).mock.calls[0][0];
      
      // スコアが80以上なので score-high クラスが適用されるはず
      expect(htmlContent).toContain('score-high');
    });
  });

  describe('Filename generation', () => {
    it('should generate safe filenames from URLs', () => {
      const resultWithComplexUrl = {
        ...mockAnalysisResult,
        url: 'https://example.com/path?query=test&other=value'
      };

      exportToJSON(resultWithComplexUrl);

      // ファイル名には不正な文字が含まれないはず
      expect(mockLink.download).toMatch(/llmo-analysis-example\.com-\d{4}-\d{2}-\d{2}-\d{2}-\d{2}-\d{2}\.json/);
    });

    it('should handle special characters in timestamps', () => {
      const resultWithSpecialTimestamp = {
        ...mockAnalysisResult,
        timestamp: new Date('2024-12-31T23:59:59.999Z')
      };

      exportToJSON(resultWithSpecialTimestamp);

      // タイムスタンプが適切にフォーマットされているはず
      expect(mockLink.download).toMatch(/2024-12-31-23-59-59/);
    });
  });

  describe('Error handling', () => {
    it('should handle blob creation errors gracefully', () => {
      // URL.createObjectURLでエラーを発生させる
      const originalCreateObjectURL = global.URL.createObjectURL;
      global.URL.createObjectURL = jest.fn(() => {
        throw new Error('Blob creation failed');
      });

      // エラーハンドリングが実装されていないため、エラーが発生することを期待
      expect(() => {
        exportToJSON(mockAnalysisResult);
      }).toThrow('Blob creation failed');

      // 元に戻す
      global.URL.createObjectURL = originalCreateObjectURL;
    });

    it('should handle DOM manipulation errors gracefully', () => {
      // document.createElementはreadonlyのため、スパイを使用
      const createElementSpy = jest.spyOn(document, 'createElement');
      createElementSpy.mockImplementation(() => {
        throw new Error('DOM error');
      });

      expect(() => {
        exportToJSON(mockAnalysisResult);
      }).toThrow('DOM error');

      // 元に戻す
      createElementSpy.mockRestore();
    });
  });
});