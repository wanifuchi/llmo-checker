import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import UrlInput from '@/components/UrlInput';

// キャッシュ関数をモック
jest.mock('@/lib/utils/cache', () => ({
  isCached: jest.fn(() => false),
  getCacheTimeRemainingFormatted: jest.fn(() => ''),
}));

describe('UrlInput Component', () => {
  const mockOnAnalyze = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render input form correctly', () => {
    render(<UrlInput onAnalyze={mockOnAnalyze} />);

    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByText('今すぐ解析開始')).toBeInTheDocument();
    expect(screen.getByText('AI時代の')).toBeInTheDocument();
    expect(screen.getByText('ウェブ最適化')).toBeInTheDocument();
  });

  it('should accept URL input', async () => {
    const user = userEvent.setup();
    render(<UrlInput onAnalyze={mockOnAnalyze} />);

    const input = screen.getByRole('textbox');
    await user.type(input, 'https://example.com');

    expect(input).toHaveValue('https://example.com');
  });

  it('should call onAnalyze with valid URL', async () => {
    const user = userEvent.setup();
    render(<UrlInput onAnalyze={mockOnAnalyze} />);

    const input = screen.getByRole('textbox');
    const button = screen.getByText('今すぐ解析開始');

    await user.type(input, 'https://example.com');
    await user.click(button);

    expect(mockOnAnalyze).toHaveBeenCalledWith('https://example.com', false);
  });

  it('should show error for invalid URL', async () => {
    const user = userEvent.setup();
    render(<UrlInput onAnalyze={mockOnAnalyze} />);

    const input = screen.getByRole('textbox');
    const button = screen.getByText('今すぐ解析開始');

    await user.type(input, 'invalid-url');
    await user.click(button);

    expect(screen.getByText('正しいURL形式で入力してください')).toBeInTheDocument();
    expect(mockOnAnalyze).not.toHaveBeenCalled();
  });

  it('should show error for empty input', async () => {
    const user = userEvent.setup();
    render(<UrlInput onAnalyze={mockOnAnalyze} />);

    const button = screen.getByText('今すぐ解析開始');
    await user.click(button);

    expect(screen.getByText('URLを入力してください')).toBeInTheDocument();
    expect(mockOnAnalyze).not.toHaveBeenCalled();
  });

  it('should disable input and button when analyzing', () => {
    render(<UrlInput onAnalyze={mockOnAnalyze} isAnalyzing={true} />);

    expect(screen.getByRole('textbox')).toBeDisabled();
    expect(screen.getByText('AI解析実行中...')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('should set initialUrl when provided', () => {
    const initialUrl = 'https://initial.example.com';
    render(<UrlInput onAnalyze={mockOnAnalyze} initialUrl={initialUrl} />);

    expect(screen.getByRole('textbox')).toHaveValue(initialUrl);
  });

  it('should update input when initialUrl changes', () => {
    const { rerender } = render(<UrlInput onAnalyze={mockOnAnalyze} initialUrl="https://first.com" />);
    
    expect(screen.getByRole('textbox')).toHaveValue('https://first.com');

    rerender(<UrlInput onAnalyze={mockOnAnalyze} initialUrl="https://second.com" />);
    
    expect(screen.getByRole('textbox')).toHaveValue('https://second.com');
  });

  it('should handle Enter key submission', async () => {
    const user = userEvent.setup();
    render(<UrlInput onAnalyze={mockOnAnalyze} />);

    const input = screen.getByRole('textbox');
    await user.type(input, 'https://example.com');
    await user.keyboard('{Enter}');

    expect(mockOnAnalyze).toHaveBeenCalledWith('https://example.com', false);
  });

  it('should render example sites', () => {
    render(<UrlInput onAnalyze={mockOnAnalyze} />);

    expect(screen.getByText('サンプルサイトで試す')).toBeInTheDocument();
    expect(screen.getByText('企業サイト')).toBeInTheDocument();
    expect(screen.getByText('ブログ')).toBeInTheDocument();
    expect(screen.getByText('ECサイト')).toBeInTheDocument();
  });

  it('should set example URL when clicked', async () => {
    const user = userEvent.setup();
    render(<UrlInput onAnalyze={mockOnAnalyze} />);

    const exampleButton = screen.getByText('企業サイト');
    await user.click(exampleButton);

    expect(screen.getByRole('textbox')).toHaveValue('https://company.example.com');
  });

  it('should disable example buttons when analyzing', () => {
    render(<UrlInput onAnalyze={mockOnAnalyze} isAnalyzing={true} />);

    const exampleButtons = screen.getAllByRole('button');
    exampleButtons.forEach(button => {
      if (button.textContent !== 'AI解析実行中...') {
        expect(button).toBeDisabled();
      }
    });
  });

  describe('Cache functionality', () => {
    const { isCached, getCacheTimeRemainingFormatted } = require('@/lib/utils/cache');

    it('should show cache info when URL is cached', async () => {
      isCached.mockReturnValue(true);
      getCacheTimeRemainingFormatted.mockReturnValue('1時間30分');

      const user = userEvent.setup();
      render(<UrlInput onAnalyze={mockOnAnalyze} />);

      const input = screen.getByRole('textbox');
      await user.type(input, 'https://example.com');

      await waitFor(() => {
        expect(screen.getByText('キャッシュから表示')).toBeInTheDocument();
        expect(screen.getByText('キャッシュ有効: 1時間30分')).toBeInTheDocument();
        expect(screen.getByText('強制更新')).toBeInTheDocument();
      });
    });

    it('should call onAnalyze with forceRefresh when force refresh is clicked', async () => {
      isCached.mockReturnValue(true);
      getCacheTimeRemainingFormatted.mockReturnValue('1時間30分');

      const user = userEvent.setup();
      render(<UrlInput onAnalyze={mockOnAnalyze} />);

      const input = screen.getByRole('textbox');
      await user.type(input, 'https://example.com');

      await waitFor(() => {
        expect(screen.getByText('強制更新')).toBeInTheDocument();
      });

      const forceRefreshButton = screen.getByText('強制更新');
      await user.click(forceRefreshButton);

      expect(mockOnAnalyze).toHaveBeenCalledWith('https://example.com', true);
    });

    it('should not show cache info for invalid URLs', async () => {
      isCached.mockReturnValue(false);

      const user = userEvent.setup();
      render(<UrlInput onAnalyze={mockOnAnalyze} />);

      const input = screen.getByRole('textbox');
      await user.type(input, 'invalid-url');

      expect(screen.queryByText('キャッシュから表示')).not.toBeInTheDocument();
      expect(screen.queryByText('強制更新')).not.toBeInTheDocument();
    });
  });

  describe('Input validation', () => {
    it('should accept HTTP URLs', async () => {
      const user = userEvent.setup();
      render(<UrlInput onAnalyze={mockOnAnalyze} />);

      const input = screen.getByRole('textbox');
      const button = screen.getByText('今すぐ解析開始');

      await user.type(input, 'http://example.com');
      await user.click(button);

      expect(mockOnAnalyze).toHaveBeenCalledWith('http://example.com', false);
      expect(screen.queryByText('正しいURL形式で入力してください')).not.toBeInTheDocument();
    });

    it('should accept HTTPS URLs', async () => {
      const user = userEvent.setup();
      render(<UrlInput onAnalyze={mockOnAnalyze} />);

      const input = screen.getByRole('textbox');
      const button = screen.getByText('今すぐ解析開始');

      await user.type(input, 'https://example.com');
      await user.click(button);

      expect(mockOnAnalyze).toHaveBeenCalledWith('https://example.com', false);
      expect(screen.queryByText('正しいURL形式で入力してください')).not.toBeInTheDocument();
    });

    it('should reject URLs without protocol', async () => {
      const user = userEvent.setup();
      render(<UrlInput onAnalyze={mockOnAnalyze} />);

      const input = screen.getByRole('textbox');
      const button = screen.getByText('今すぐ解析開始');

      await user.type(input, 'example.com');
      await user.click(button);

      expect(screen.getByText('正しいURL形式で入力してください')).toBeInTheDocument();
      expect(mockOnAnalyze).not.toHaveBeenCalled();
    });

    it('should reject invalid protocols', async () => {
      const user = userEvent.setup();
      render(<UrlInput onAnalyze={mockOnAnalyze} />);

      const input = screen.getByRole('textbox');
      const button = screen.getByText('今すぐ解析開始');

      await user.type(input, 'ftp://example.com');
      await user.click(button);

      expect(screen.getByText('正しいURL形式で入力してください')).toBeInTheDocument();
      expect(mockOnAnalyze).not.toHaveBeenCalled();
    });
  });

  describe('Focus management', () => {
    it('should show focus styles when input is focused', async () => {
      const user = userEvent.setup();
      render(<UrlInput onAnalyze={mockOnAnalyze} />);

      const input = screen.getByRole('textbox');
      await user.click(input);

      // フォーカス時のスタイルは実際のDOM要素でテストするのが困難なため、
      // フォーカスイベントが正常に動作することを確認
      expect(document.activeElement).toBe(input);
    });
  });
});