# LLMO Checker

**AI時代のウェブサイト最適化分析ツール**

LLMO Checkerは、大規模言語モデル（LLM）によるクロールとインデックスを想定した、次世代ウェブサイト最適化度を包括的に分析するWebアプリケーションです。

![LLMO Checker Screenshot](https://via.placeholder.com/800x400?text=LLMO+Checker+Interface)

## 🌟 主な機能

### 📊 包括的な解析機能
- **llms.txt解析**: AI向けrobots.txt仕様の実装状況
- **構造化データ評価**: JSON-LDとSchema.orgの最適化度
- **コンテンツ構造分析**: 見出し構造、セマンティックHTML、FAQセクション
- **E-E-A-T評価**: 専門性・権威性・信頼性の総合評価

### 🚀 高度な機能
- **AI競合分析**: 自動競合発見とベンチマーク比較
- **外部API統合**: Lighthouse、SerpAPI による高精度分析
- **履歴管理**: 解析結果を自動保存し、過去の分析を簡単に参照
- **一括解析**: 複数URLを順次解析してまとめてレポート生成
- **エクスポート**: JSON、PDF、CSVでの詳細レポート出力
- **高速キャッシュ**: 解析結果をキャッシュして高速表示
- **リアルタイム進捗**: 解析中の進捗をリアルタイムで表示

### 🎯 具体的な改善提案
- 優先度付きの実装案
- コードサンプル付きの詳細説明
- 実行可能な技術的ガイダンス

## 🏗️ 技術スタック

- **フロントエンド**: Next.js 15 (App Router)、React 19、TypeScript
- **スタイリング**: Tailwind CSS、shadcn/ui
- **解析エンジン**: Puppeteer、Cheerio
- **外部API**: Google PageSpeed Insights、SerpAPI
- **デプロイ**: Vercel、Railway対応
- **テスト**: Jest、Testing Library

## 📦 インストール

### 前提条件
- Node.js 18.0以上
- npm または yarn

### セットアップ

```bash
# リポジトリをクローン
git clone https://github.com/your-username/llmo-checker.git
cd llmo-checker

# 依存関係をインストール
npm install

# 開発サーバーを起動
npm run dev
```

開発サーバーが起動したら、[http://localhost:3000](http://localhost:3000) でアプリケーションにアクセスできます。

## 🔧 使用方法

### 基本的な解析

1. **URLを入力**: ホームページの入力欄に解析したいウェブサイトのURLを入力
2. **解析開始**: 「今すぐ解析開始」ボタンをクリック
3. **結果確認**: 詳細な解析結果とスコアを確認
4. **改善実施**: 提案された改善案を参考にサイトを最適化

### 一括解析

1. **一括解析タブ**: ページ上部の「一括解析」タブを選択
2. **URL追加**: 複数のURLを入力欄から追加
3. **一括実行**: 「一括解析を開始」ボタンで全URLを順次解析
4. **結果エクスポート**: CSVファイルで結果をダウンロード

### 履歴管理

- 過去の解析結果は自動的に履歴に保存
- ホームページで履歴パネルから過去の結果を参照
- キャッシュされた結果は高速で表示

## 📊 解析項目詳細

### 1. llms.txt解析 🤖
- **ファイル存在確認**: `/llms.txt`の存在
- **構文チェック**: 正しいrobots.txt形式の検証
- **指示内容**: AI向けの適切な指示の有無

### 2. 構造化データ 📈
- **JSON-LD**: 実装されているJSON-LDの数と品質
- **Schema.org**: 使用されているスキーマタイプ
- **バリデーション**: 構造化データの検証エラー

### 3. コンテンツ構造 📝
- **見出し階層**: H1-H6の適切な構造
- **セマンティックHTML**: article、section等の使用
- **FAQセクション**: よくある質問の実装
- **リスト要素**: 構造化された情報の表現

### 4. E-E-A-T評価 🏆
- **専門性**: 著者情報、専門的コンテンツ
- **権威性**: 組織情報、信頼できるソース
- **信頼性**: 連絡先、更新日時、信頼シグナル

## 🎨 スコアリング

各項目は0-100点で評価され、以下の基準で表示されます：

- 🟢 **80-100点**: 優秀 - AI最適化が十分
- 🟡 **60-79点**: 良好 - 改善余地あり
- 🔴 **0-59点**: 要改善 - 早急な対応が必要

## 📁 プロジェクト構造

```
llmo-checker/
├── app/                    # Next.js App Router
│   ├── api/               # APIエンドポイント
│   ├── page.tsx           # メインページ
│   └── layout.tsx         # ルートレイアウト
├── components/            # Reactコンポーネント
│   ├── ui/               # 基本UIコンポーネント
│   ├── UrlInput.tsx      # URL入力フォーム
│   ├── ScoreDashboard.tsx # スコア表示
│   ├── DetailedAnalysis.tsx # 詳細解析結果
│   ├── BatchAnalysis.tsx  # 一括解析
│   └── ExportMenu.tsx    # エクスポート機能
├── lib/                   # ライブラリとユーティリティ
│   ├── analyzers/        # 解析エンジン
│   ├── utils/            # ユーティリティ関数
│   └── types/            # TypeScript型定義
└── __tests__/            # テストファイル
```

## 🧪 テスト

```bash
# テスト実行
npm run test

# テスト（監視モード）
npm run test:watch

# カバレッジ付きテスト
npm run test:coverage
```

## 🚀 デプロイ

### Vercel
```bash
# Vercelにデプロイ
npx vercel
```

### Railway
```bash
# Railwayにデプロイ
railway login
railway init
railway up
```

### 環境変数

#### 基本機能（環境変数なしでも動作）
基本的なLLMO解析は追加設定なしで利用可能です。

#### 高精度分析（外部API統合）
競合分析の精度向上のため、以下の外部APIキーを設定できます：

```env
# .env.local（ローカル開発用）
SERP_API_KEY=your_serpapi_key_here
GOOGLE_PAGESPEED_API_KEY=your_google_api_key_here
NEXT_PUBLIC_ENABLE_EXTERNAL_APIS=true
```

#### 本番環境設定
```bash
# Vercel / Railway の環境変数として設定
SERP_API_KEY=your_serpapi_key_here
GOOGLE_PAGESPEED_API_KEY=your_google_api_key_here
NEXT_PUBLIC_ENABLE_EXTERNAL_APIS=true
NODE_ENV=production
```

**⚠️ セキュリティ重要事項**
- APIキーは絶対にソースコードにコミットしないでください
- `.env.local` ファイルは `.gitignore` で除外されています
- 本番環境では環境変数管理システムを使用してください

詳細な設定方法は [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) をご参照ください。

## 🛠️ カスタマイズ

### 新しい解析項目の追加

1. `lib/analyzers/`に新しい解析クラスを作成
2. `lib/types/index.ts`に型定義を追加
3. `lib/analyzers/url-analyzer.ts`でメイン解析に統合
4. フロントエンドコンポーネントで表示を実装

### UI のカスタマイズ

- `tailwind.config.ts`: カラーテーマとスタイル
- `components/ui/`: 基本UIコンポーネント
- `app/globals.css`: グローバルスタイル

## 🤝 コントリビューション

1. このリポジトリをフォーク
2. 機能ブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

### 開発ガイドライン

- [CLAUDE.md](./CLAUDE.md)の規約に従う
- TypeScriptの厳密な型チェックを使用
- 新機能にはテストを追加
- ESLintとPrettierでコード品質を維持

## 📊 パフォーマンス

- **初回表示**: < 2秒
- **キャッシュヒット**: < 500ms
- **解析速度**: 1サイト約30秒
- **同時解析**: 最大1件（サーバー負荷軽減）

## 🔒 セキュリティ

### 基本セキュリティ
- ユーザー入力のサニタイゼーション
- XSS攻撃の防止
- 機密情報のログ出力なし
- 外部リクエストの制限

### APIキー管理
- `.env.local` ファイルは Git 除外済み
- ソースコードにAPIキーのハードコーディング禁止
- 本番環境では環境変数で安全管理
- セキュリティチェックスクリプトによる検証

### セキュリティチェック
```bash
# コミット前のセキュリティチェック
./scripts/security-check.sh
```

## 📝 ライセンス

このプロジェクトは [MIT License](LICENSE) の下で公開されています。

## 📞 サポート

- **バグレポート**: [Issues](https://github.com/your-username/llmo-checker/issues)
- **機能リクエスト**: [Discussions](https://github.com/your-username/llmo-checker/discussions)
- **ドキュメント**: [Wiki](https://github.com/your-username/llmo-checker/wiki)

## 🙏 謝辞

- [Next.js](https://nextjs.org/) - Reactフレームワーク
- [Tailwind CSS](https://tailwindcss.com/) - ユーティリティファーストCSS
- [shadcn/ui](https://ui.shadcn.com/) - 美しいUIコンポーネント
- [Puppeteer](https://pptr.dev/) - ブラウザ自動化
- [Vercel](https://vercel.com/) - デプロイプラットフォーム

---

**AI時代のウェブサイト最適化を、今すぐ始めましょう！** 🚀

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/llmo-checker)
[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template?template=https://github.com/your-username/llmo-checker)