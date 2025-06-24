# デプロイメントガイド

## 🔒 セキュリティ重要事項

**⚠️ APIキーは絶対にGitHubにコミットしないでください**

## 本番環境への環境変数設定

### 1. Vercel環境での設定

```bash
# Vercelダッシュボードの Environment Variables セクションで設定
SERP_API_KEY=your_actual_serpapi_key_here
GOOGLE_PAGESPEED_API_KEY=your_actual_google_api_key_here
NEXT_PUBLIC_ENABLE_EXTERNAL_APIS=true
NEXT_PUBLIC_MAX_COMPETITOR_SITES=5
NEXT_PUBLIC_ANALYSIS_TIMEOUT=30000
NODE_ENV=production
```

### 2. Docker環境での設定

```dockerfile
# docker-compose.yml
version: '3.8'
services:
  llmo-checker:
    build: .
    environment:
      - SERP_API_KEY=your_actual_serpapi_key_here
      - GOOGLE_PAGESPEED_API_KEY=your_actual_google_api_key_here
      - NEXT_PUBLIC_ENABLE_EXTERNAL_APIS=true
      - NODE_ENV=production
    ports:
      - "3000:3000"
```

### 3. AWS/GCP環境での設定

```bash
# 環境変数として設定
export SERP_API_KEY="your_actual_serpapi_key_here"
export GOOGLE_PAGESPEED_API_KEY="your_actual_google_api_key_here"
export NEXT_PUBLIC_ENABLE_EXTERNAL_APIS="true"
```

## 🚀 デプロイ手順

### Vercelでのデプロイ

1. **GitHubリポジトリ連携**
   ```bash
   # Vercelダッシュボードで「New Project」
   # GitHubリポジトリを選択
   ```

2. **環境変数設定**
   - Settings → Environment Variables
   - 上記のAPIキーを設定

3. **自動デプロイ**
   ```bash
   git push origin main
   # 自動的にVercelにデプロイされる
   ```

### 手動デプロイ

1. **ビルド**
   ```bash
   npm run build
   ```

2. **環境変数設定**
   ```bash
   # 本番サーバーで環境変数を設定
   ```

3. **起動**
   ```bash
   npm start
   ```

## 🔍 設定確認

### API設定の確認
```bash
# デプロイ後、以下のエンドポイントで確認
curl https://your-domain.com/api/test-apis
```

### 期待する応答
```json
{
  "success": true,
  "apiStatus": {
    "serpApi": {
      "configured": true,
      "status": "enabled"
    },
    "googlePageSpeed": {
      "configured": true,
      "status": "enabled"
    }
  }
}
```

## 📊 使用量監視

### SerpAPI
- ダッシュボード: https://serpapi.com/dashboard
- 無料枠: 月100回
- 使用量をアプリ内で監視可能

### Google PageSpeed Insights
- 無料枠: 1日25,000回
- APIキー設定で制限が緩和

## 🛡️ セキュリティベストプラクティス

### 1. APIキー管理
- ✅ `.env.local` は `.gitignore` で除外
- ✅ 本番環境は環境変数で設定
- ❌ ソースコードにハードコーディング禁止

### 2. アクセス制限
```bash
# 必要に応じてAPIキーのリファラー制限を設定
# Google Cloud Console → Credentials で設定
```

### 3. 定期的なローテーション
```bash
# 3-6ヶ月ごとにAPIキーを更新
# 古いキーを無効化
```

## 🚨 緊急時の対応

### APIキーが漏洩した場合
1. **即座に無効化**
   - SerpAPI: ダッシュボードでキー削除
   - Google: Cloud Console でキー無効化

2. **新しいキー生成**
   - 新しいAPIキーを生成
   - 環境変数を更新

3. **再デプロイ**
   ```bash
   # 新しいキーで再デプロイ
   ```

## 💰 コスト管理

### 無料枠の活用
- SerpAPI: 月100回まで無料
- PageSpeed: 完全無料

### 使用量アラート
```bash
# SerpAPIで使用量アラートを設定
# 80%到達時に通知
```

## 📈 パフォーマンス最適化

### キャッシュ戦略
- API応答を1時間キャッシュ
- 重複リクエストを防止

### レート制限対応
- 自動リトライ機能
- フォールバック機能