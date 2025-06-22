import { AnalysisResult } from '@/lib/types';

export function generateSampleData(url: string): AnalysisResult {
  return {
    url,
    timestamp: new Date(),
    scores: {
      overall: 73,
      technical: 60,
      structuredData: 85,
      content: 75,
      eeat: 70
    },
    details: {
      llmsTxt: {
        exists: true,
        syntax: {
          valid: true,
          errors: []
        },
        content: {
          allowed: ["/blog/*", "/articles/*"],
          disallowed: ["/admin/*", "/private/*"],
          sitemaps: ["https://example.com/sitemap.xml"]
        }
      },
      structuredData: {
        jsonLdCount: 3,
        schemas: [
          {
            type: "Article",
            validation: {
              valid: true,
              missingRequired: [],
              warnings: []
            }
          },
          {
            type: "Organization",
            validation: {
              valid: true,
              missingRequired: [],
              warnings: []
            }
          },
          {
            type: "WebSite",
            validation: {
              valid: false,
              missingRequired: ["description"],
              warnings: ["publisherの詳細情報が不足"]
            }
          }
        ],
        errors: [],
        warnings: ["一部スキーマで任意フィールドが不足しています"]
      },
      content: {
        headingStructure: {
          valid: true,
          issues: []
        },
        semanticHtml: {
          score: 15,
          elements: ["main (1)個", "article (2)個", "section (3)個", "header (1)個", "footer (1)個"]
        },
        faqDetected: true,
        listElements: 5,
        summarySection: true
      },
      eeat: {
        authorInfo: {
          exists: true,
          complete: true
        },
        organizationInfo: {
          exists: true,
          complete: false
        },
        lastUpdated: "2024-01-15",
        trustSignals: ["SSL証明書", "プライバシーポリシー", "利用規約"]
      }
    },
    suggestions: [
      {
        id: "improve-org-info",
        priority: "medium",
        category: "E-E-A-T",
        title: "組織情報の連絡先を充実させる",
        description: "組織の信頼性向上のため、連絡先情報を追加してください。",
        implementation: "フッターまたは専用ページに電話番号、メールアドレス、住所を記載してください。",
        codeExample: `<footer>\n  <div class="contact-info">\n    <h3>お問い合わせ</h3>\n    <p>電話: 03-1234-5678</p>\n    <p>メール: info@example.com</p>\n    <p>住所: 東京都渋谷区...</p>\n  </div>\n</footer>`
      },
      {
        id: "fix-website-schema",
        priority: "high",
        category: "構造化データ",
        title: "WebSiteスキーマの必須フィールドを追加",
        description: "WebSiteスキーマにdescriptionフィールドが不足しています。",
        implementation: "JSON-LDのWebSiteスキーマにdescriptionプロパティを追加してください。",
        codeExample: `{\n  \"@context\": \"https://schema.org\",\n  \"@type\": \"WebSite\",\n  \"name\": \"サイト名\",\n  \"description\": \"サイトの説明文\",\n  \"url\": \"https://example.com\"\n}`
      },
      {
        id: "enhance-semantic-html",
        priority: "low",
        category: "コンテンツ構造",
        title: "セマンティックHTML要素を追加",
        description: "nav、aside要素を追加してコンテンツ構造を改善できます。",
        implementation: "ナビゲーションエリアにnav要素、サイドバーにaside要素を使用してください。",
        codeExample: `<nav aria-label=\"メインナビゲーション\">\n  <ul>\n    <li><a href=\"/\">ホーム</a></li>\n    <li><a href=\"/about\">会社概要</a></li>\n  </ul>\n</nav>\n\n<aside aria-label=\"関連リンク\">\n  <h3>関連記事</h3>\n  <!-- 関連コンテンツ -->\n</aside>`
      }
    ]
  };
}