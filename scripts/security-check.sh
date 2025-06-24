#!/bin/bash

# セキュリティチェックスクリプト
# APIキーやシークレットがコミットされていないかチェック

echo "🔒 セキュリティチェックを実行中..."

# チェック対象のパターン
PATTERNS=(
    "SERP_API_KEY.*=.*[a-fA-F0-9]{32,}"
    "GOOGLE_PAGESPEED_API_KEY.*=.*AIza[a-zA-Z0-9_-]{35}"
    "API_KEY.*=.*[a-fA-F0-9]{20,}"
    "SECRET.*=.*[a-fA-F0-9]{20,}"
    "TOKEN.*=.*[a-fA-F0-9]{20,}"
    "PASSWORD.*=.*[a-zA-Z0-9]{8,}"
)

ERRORS=0

echo "📁 ステージングされたファイルをチェック中..."

# Gitでステージングされたファイルをチェック
for file in $(git diff --cached --name-only); do
    if [[ -f "$file" ]]; then
        echo "  チェック中: $file"
        
        for pattern in "${PATTERNS[@]}"; do
            if grep -qE "$pattern" "$file"; then
                echo "  ❌ 危険: $file にAPIキーまたはシークレットが含まれている可能性があります"
                echo "     パターン: $pattern"
                ERRORS=$((ERRORS + 1))
            fi
        done
    fi
done

# .env.localファイルがステージングされていないかチェック
if git diff --cached --name-only | grep -q "\.env\.local"; then
    echo "❌ 危険: .env.local ファイルがステージングされています"
    echo "   これにはAPIキーが含まれている可能性があります"
    ERRORS=$((ERRORS + 1))
fi

# .gitignoreのチェック
if [[ -f ".gitignore" ]]; then
    if ! grep -q "\.env\*\.local" .gitignore; then
        echo "❌ 警告: .gitignore に .env*.local が含まれていません"
        ERRORS=$((ERRORS + 1))
    else
        echo "✅ .gitignore は適切に設定されています"
    fi
else
    echo "❌ 危険: .gitignore ファイルが見つかりません"
    ERRORS=$((ERRORS + 1))
fi

# 結果の表示
if [[ $ERRORS -eq 0 ]]; then
    echo ""
    echo "✅ セキュリティチェック完了: 問題は見つかりませんでした"
    echo "🚀 安全にコミット可能です"
    exit 0
else
    echo ""
    echo "❌ セキュリティチェック失敗: $ERRORS 個の問題が見つかりました"
    echo "🛑 APIキーやシークレットを削除してから再度コミットしてください"
    echo ""
    echo "💡 対処方法:"
    echo "   1. APIキーをファイルから削除"
    echo "   2. .env.local ファイルで環境変数として設定"
    echo "   3. .gitignore に機密ファイルを追加"
    exit 1
fi