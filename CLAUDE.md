@AGENTS.md

# RentAI — AIアシスタント向けコードベースガイド

## プロジェクト概要

**RentAI** は、AIを活用した日本語の賃料査定システムです。ユーザーが建物の写真をアップロードすると、ClaudeのビジョンAPIで建物を解析し、決定論的な価格モデルで間取り別の推奨月額賃料を算出します。

Vercel（`repo2026test.vercel.app`）にデプロイされています。データベースは使用しておらず、すべてのリクエストはステートレスです。

---

## 技術スタック

| レイヤー | 技術 |
|---|---|
| フレームワーク | **Next.js 16.2.6**（App Router）— AGENTS.md 参照 |
| UI | **React 19.2.4** + TypeScript strictモード |
| スタイリング | **Tailwind CSS v4** + `tailwind-merge` + `clsx` |
| アイコン | `lucide-react` ^1.16.0 |
| AI | `@anthropic-ai/sdk` ^0.99.0 — `claude-sonnet-4-6` モデル |
| フォント | Geist Sans / Geist Mono（`next/font/google` 経由） |
| デプロイ | Vercel（`vercel.json` で設定） |

> **注意:** Tailwind v4 は v3 と設定形式が異なります。CSSは `globals.css` の `@import "tailwindcss"` でインポートします。`tailwind.config.js` はありません。テーマトークンは CSS の `@theme inline` ブロックで定義します。

---

## リポジトリ構成

```
repo2026test/
├── src/
│   ├── app/
│   │   ├── page.tsx              # メインページ — アップロード＋結果UI（"use client"）
│   │   ├── layout.tsx            # ルートレイアウト: フォント・メタデータ・ビューポート
│   │   ├── globals.css           # Tailwind v4 インポート + CSS変数
│   │   ├── favicon.ico
│   │   └── api/
│   │       └── analyze/
│   │           └── route.ts      # POST /api/analyze — メインAPIハンドラ
│   ├── components/
│   │   ├── ImageUpload.tsx       # ドラッグ＆ドロップ＋モバイル向けカメラ/ギャラリー
│   │   ├── BuildingCard.tsx      # 建物分析結果の表示
│   │   ├── PopulationCard.tsx    # 人口・需要指標の表示
│   │   └── PricingDashboard.tsx  # 最適賃料・間取り別賃料・AIサマリー
│   ├── lib/
│   │   ├── claude.ts             # Anthropic SDK呼び出し（ビジョン＋テキスト）
│   │   └── pricing.ts            # 決定論的な賃料計算ロジック
│   └── types/
│       └── index.ts              # 共有TypeScriptインターフェース一覧
├── public/
│   └── architecture.html         # システム構成図（静的HTML）
├── .env.local.example            # 必要な環境変数のドキュメント
├── next.config.ts                # 最小限のNext.js設定（現時点では上書きなし）
├── tsconfig.json                 # strict TS、`@/*` → `./src/*` パスエイリアス
├── vercel.json                   # Vercelデプロイ設定
└── package.json
```

---

## データフロー

```
ユーザーが画像をアップロード
      │
      ▼
POST /api/analyze（route.ts）
      │
      ├─► analyzeBuildingImage()     [claude.ts]
      │       Claudeビジョン API → BuildingAnalysis JSON
      │
      ├─► calculatePopulationData()  [pricing.ts]
      │       決定論的: 都市タイプ → 密度・流入スコア
      │
      ├─► calculatePricing()         [pricing.ts]
      │       乗数モデル → PricingResult（下限/最適/上限賃料）
      │
      ├─► generateRoomTypePricing()  [pricing.ts]
      │       最適賃料を5つの間取りにスケーリング
      │
      └─► generatePricingInsight()   [claude.ts]
              Claudeテキスト API → 日本語戦略サマリー（200〜300文字）
                    │
                    ▼
            AnalysisResponse → JSONをクライアントへ返却
```

---

## 主要インターフェース（`src/types/index.ts`）

- **`BuildingAnalysis`** — Claudeのビジョン出力: `buildingType`, `estimatedAge`, `condition`, `floors`, `structure`, `prefecture`, `cityType`（`都心|副都心|近郊|郊外|地方`）など
- **`PopulationData`** — `BuildingAnalysis` から導出: 密度スコア、流入スコア、需要レベル、平均年収、ウォーカビリティ
- **`PricingResult`** — 賃料レンジ + 信頼度スコア + `PriceFactor[]` + `RentComparison`
- **`AnalysisResponse`** — API全体のレスポンス: 上記すべて + `roomTypes: RoomTypePricing[]` + `summary: string`

---

## 環境セットアップ

`.env.local.example` を `.env.local` にコピーして設定:

```
ANTHROPIC_API_KEY=sk-ant-...
```

`src/lib/claude.ts` の Anthropic クライアントは `new Anthropic()` で初期化されており、SDKが自動的に `ANTHROPIC_API_KEY` を環境変数から読み取ります（明示的なキーの受け渡しは不要）。

---

## 開発コマンド

```bash
npm install       # 依存パッケージのインストール
npm run dev       # 開発サーバー起動 (http://localhost:3000)
npm run build     # プロダクションビルド
npm run start     # プロダクションビルドをローカルで実行
```

テストスイートは設定されていません。リンター設定（`.eslintrc`）もありません。型チェックは `npx tsc --noEmit` で実行できます。

---

## コーディング規約

### パスエイリアス
`@/` は `./src/` にマッピングされています。相対パス（`../../`）は使わず、常に `@/` インポートを使用してください。

### クライアントコンポーネント vs サーバーコンポーネント
- `src/components/` 内の全コンポーネントは `"use client"` — フックまたはブラウザイベントを使用します。
- `src/app/page.tsx` は `"use client"` — アップロード/分析のステートを管理します。
- `src/app/layout.tsx` はサーバーコンポーネントです（ディレクティブ不要）。
- APIルート（`route.ts`）はサーバーで実行されます。Anthropic SDKをクライアントコンポーネントにインポートしないでください。

### TypeScript
- strictモードが有効です。`any` は正当な理由なく使用しないでください。
- エクスポートする関数には明示的な戻り値の型を指定することを推奨します。
- 共有型はすべて `src/types/index.ts` に定義します。

### スタイリング
- Tailwindユーティリティクラスのみ使用 — CSSモジュール、styled-componentsは使いません。
- 条件付きクラス合成には `clsx` / `tailwind-merge` を使用してください。
- モバイルファースト: デフォルトスタイルはモバイル向け、`sm:` プレフィックスでデスクトップ対応。
- ブランドグラデーションは `from-indigo-600 to-violet-600`（インジゴ/バイオレット）です。
- カードには `rounded-2xl border border-slate-200 shadow-sm` パターンを統一して使用します。

### ローカライゼーション
- UIテキストはすべて日本語です。エラーメッセージ、ラベル、AIプロンプトも日本語で記述します。
- 英語のUIテキストを追加しないでください。

### 画像アップロードの制約
- 対応形式: `image/jpeg`, `image/png`, `image/webp`, `image/gif`
- 最大ファイルサイズ: **5 MB**
- `FormData` にキー `"image"` として `/api/analyze` へ送信します。

### AI モデルの使用
- `src/lib/claude.ts` の両方のClaude呼び出しには `claude-sonnet-4-6` を使用しています。
- `analyzeBuildingImage`: ビジョン呼び出し — 建物写真から構造化JSONを抽出します。
- `generatePricingInsight`: テキスト呼び出し — 200〜300文字の日本語アドバイスを生成します。
- ビジョン呼び出しではClaudeが生のJSONを返すことを想定しており、正規表現（`/\{[\s\S]*\}/`）でレスポンスから抽出します。

### 価格モデル
`src/lib/pricing.ts` は完全に決定論的です（AIなし）:
- 基準賃料（円/m²）は `cityType` で決定（都心: ¥3,800/m² → 地方: ¥900/m²）。
- 人口密度・流入・建物状態・構造・建物タイプの乗数を適用します。
- 標準専有面積は25m²（1K/1DK基準）。
- 賃料は1,000円単位で丸めます。

---

## デプロイ

Vercelにデプロイされています。`vercel.json` でフレームワークを `nextjs` に設定し、標準のビルド/devコマンドを使用しています。カスタムのリライトやヘッダーは設定していません。

本番環境へのデプロイには、Vercelプロジェクト設定で `ANTHROPIC_API_KEY` 環境変数を設定する必要があります。
