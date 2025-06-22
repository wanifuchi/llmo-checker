# LLMO最適化チェックツール

ウェブサイトのLLMO（Large Language Model Optimization）最適化状況を分析し、改善提案を提供するWebアプリケーションです。

## 機能

### ✅ 実装済み機能

- **llms.txt解析**: robots.txtのAI版ファイルの存在確認と構文チェック
- **構造化データ解析**: JSON-LD形式のschema.orgデータの検証
- **コンテンツ構造解析**: 見出し階層、セマンティックHTML、FAQ要素の評価
- **E-E-A-T評価**: 専門性、権威性、信頼性の要素チェック
- **スコアリングシステム**: 各項目の点数化と総合評価
- **改善提案**: 具体的な実装方法とコードサンプル提供
- **日本語対応**: 完全日本語インターフェース

### 🔄 今後の機能拡張

- **レポート生成**: PDF/HTMLレポートのダウンロード機能
- **複数URL比較**: サイト間の最適化状況比較
- **履歴管理**: 解析結果の保存と追跡

## 技術スタック

- **フロントエンド**: React 18 + TypeScript + Tailwind CSS
- **バックエンド**: Next.js 14 (App Router)
- **解析エンジン**: Cheerio (HTML解析) + 独自解析ロジック
- **UI コンポーネント**: Lucide React (アイコン) + React Circular Progressbar

## セットアップ

### 前提条件

- Node.js 18.0以上
- npm または yarn

### インストール

```bash
# リポジトリをクローン
git clone <repository-url>
cd llmo-checker

# 依存関係をインストール
npm install

# 開発サーバーを起動
npm run dev
```

アプリケーションは `http://localhost:3000` で利用できます。

### ビルド

```bash
# プロダクションビルド
npm run build

# プロダクションサーバー起動
npm start
```

## 使用方法

1. **URL入力**: 解析したいウェブサイトのURLを入力
2. **解析開始**: 「解析開始」ボタンをクリック
3. **結果確認**: スコアダッシュボードで総合評価を確認
4. **詳細分析**: 各項目の詳細な解析結果を確認
5. **改善実装**: 提案された改善策を実装

## 評価項目

### 技術面 (30%)
- llms.txtファイルの存在と構文
- サイトマップの設定
- クローラー向け設定

### 構造化データ (25%)
- JSON-LDスキーマの実装
- Schema.orgの適切な利用
- 必須フィールドの完全性

### コンテンツ構造 (25%)
- 見出しの階層構造
- セマンティックHTMLの利用
- FAQ・リスト要素の存在

### E-E-A-T (20%)
- 著者情報の明記
- 組織情報の充実
- 更新日時の表示
- 信頼シグナルの存在

## 開発情報

### プロジェクト構造

```
llmo-checker/
├── app/                    # Next.js App Router
│   ├── api/analyze/       # URL解析API
│   ├── globals.css        # グローバルスタイル
│   ├── layout.tsx         # ルートレイアウト
│   └── page.tsx          # メインページ
├── components/            # Reactコンポーネント
│   ├── Header.tsx
│   ├── UrlInput.tsx
│   ├── ProgressIndicator.tsx
│   ├── ScoreDashboard.tsx
│   ├── DetailedAnalysis.tsx
│   └── SuggestionsList.tsx
├── lib/                   # ライブラリとユーティリティ
│   ├── types/            # TypeScript型定義
│   └── analyzers/        # 解析エンジン
│       ├── url-analyzer.ts
│       ├── llms-analyzer.ts
│       ├── structured-data-analyzer.ts
│       ├── content-analyzer.ts
│       ├── eeat-analyzer.ts
│       ├── score-calculator.ts
│       └── suggestion-generator.ts
└── public/               # 静的ファイル
```

### スクリプト

```bash
npm run dev         # 開発サーバー起動
npm run build       # プロダクションビルド
npm run start       # プロダクションサーバー起動
npm run lint        # ESLint実行
npm run type-check  # TypeScript型チェック
```

## ライセンス

ISC

## 開発者

Claude Code を使用して開発されました。

---

**Claude Code 🤖**  
Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>