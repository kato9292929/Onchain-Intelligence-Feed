# Onchain Intelligence Feed

Nansen × Claude APIで生成するAPAC日本語オンチェーンインテリジェンス。  
**x402 v2** (CAIP-2 network identifiers) + Base/USDC マイクロペイメント。

## エンドポイント

| Path | 説明 | 価格 | キャッシュ |
|------|------|------|----------|
| `GET /api/feed/apac-daily` | APAC日次スマートマネーサマリー | $0.10 | 1時間 |
| `GET /api/feed/smart-money-jp` | 日本向けスマートマネーシグナル | $0.15 | 30分 |
| `GET /api/feed/whale-alert` | クジラアラート・大口ウォレット動向 | $0.20 | なし |
| `GET /api/feed/weekly-report` | 週次オンチェーンレポート | $0.50 | 24時間 |
| `GET /api/discovery` | 全エンドポイント一覧 | 無料 | - |

## x402 v2

本プロジェクトは **x402 v2** を使用しています。

- ネットワーク識別子: CAIP-2形式 (`eip155:8453` = Base mainnet)
- 決済トークン: USDC on Base
- Facilitator: Coinbase Developer Platform (CDP)

### v1 との違い

| 項目 | v1 | v2 |
|------|----|----|
| network フィールド | `"base"` | `"eip155:8453"` |
| パッケージ | `x402-next` | `@x402/next` |
| Facilitator | x402.org | CDP API |

## セットアップ

### 1. 環境変数

`.env.example` をコピーして `.env.local` を作成:

```bash
cp .env.example .env.local
```

必須の環境変数:

| 変数名 | 説明 | 取得元 |
|--------|------|--------|
| `NANSEN_API_KEY` | Nansen APIキー | [nansen.ai](https://nansen.ai) |
| `ANTHROPIC_API_KEY` | Claude APIキー | [console.anthropic.com](https://console.anthropic.com) |
| `CDP_API_KEY_ID` | CDP APIキー ID (UUID形式) | [CDP Console](https://portal.cdp.coinbase.com) |
| `CDP_API_KEY_SECRET` | CDP APIキー Secret (base64) | 同上 |
| `FACILITATOR_URL` | `https://api.cdp.coinbase.com/platform/v2/x402` | 固定値 |
| `WALLET_ADDRESS` | 受領ウォレットアドレス (Base EVM) | 自分のウォレット |
| `KV_REST_API_URL` | Upstash Redis URL | Vercel Storage |
| `KV_REST_API_TOKEN` | Upstash Redis Token | 同上 |
| `CRON_SECRET` | Cronジョブ保護シークレット | `openssl rand -hex 32` |

### 2. CDP API キーの取得

1. [Coinbase Developer Platform](https://portal.cdp.coinbase.com) にアクセス
2. プロジェクト作成 → API Keys → Create API Key
3. Key ID (UUID) と Key Secret (base64, 末尾`==`) をコピー

### 3. 受領ウォレット

Base mainnet対応のウォレットアドレスを `WALLET_ADDRESS` に設定。  
デフォルト: `0xC67d94504696960bA0f2e7C3FeE703950734c00A`

### 4. ローカル起動

```bash
npm install
npm run dev
```

### 5. 動作確認 (x402 v2)

```bash
curl -i https://<your-url>/api/feed/apac-daily
```

期待するレスポンス:
- `HTTP 402 Payment Required`
- `X-Payment-Required` ヘッダ (base64)
- デコード後に `"x402Version": 2` と `"network": "eip155:8453"` を確認

## Vercel デプロイ

### 環境変数 (Vercel Dashboard)

```
CDP_API_KEY_ID=<UUID>
CDP_API_KEY_SECRET=<base64>
FACILITATOR_URL=https://api.cdp.coinbase.com/platform/v2/x402
WALLET_ADDRESS=0xC67d94504696960bA0f2e7C3FeE703950734c00A
NANSEN_API_KEY=<key>
ANTHROPIC_API_KEY=<key>
KV_REST_API_URL=<upstash-url>
KV_REST_API_TOKEN=<upstash-token>
CRON_SECRET=<random>
NEXT_PUBLIC_BASE_URL=https://<your-vercel-url>
```

### Vercel KV (Upstash Redis)

Vercel Dashboard → Storage → Create Database → KV でプロビジョニング後、  
環境変数が自動設定されます。

## 技術スタック

- **Next.js** 15.3.9 (App Router)
- **x402** v2 (`@x402/next`, `@x402/core`, `@x402/evm`, `@coinbase/x402`)
- **Nansen API** Smart Money / Token God Mode / Exchange Flows
- **Claude** claude-sonnet-4-20250514 (日本語サマリー生成)
- **Vercel KV** (Upstash Redis) キャッシュ
- **Vercel Cron Jobs** 毎日0時データ事前取得
