"use client";

import { useState } from "react";

const endpoints = [
  {
    method: "GET",
    path: "/api/feed/apac-daily",
    label: "APAC日次サマリー",
    price: "$0.10",
    cache: "1時間キャッシュ",
    description: "Binance・OKX・Bybitのネットフロー、スマートマネー動向、トップゲイナー/ルーザーをClaudeが日本語で解説。",
    color: "#3b82f6",
  },
  {
    method: "GET",
    path: "/api/feed/smart-money-jp",
    label: "日本スマートマネー",
    price: "$0.15",
    cache: "30分キャッシュ",
    description: "bitFlyer・Coincheck・bitbankへの流出入をトラッキング。注目アクションをスコアリングして返す。",
    color: "#00ff87",
  },
  {
    method: "GET",
    path: "/api/feed/whale-alert",
    label: "クジラアラート",
    price: "$0.20",
    cache: "リアルタイム",
    description: "$100K以上の大口移動を検知。Smart Moneyラベル付きウォレットを優先してソート。",
    color: "#f59e0b",
  },
  {
    method: "GET",
    path: "/api/feed/weekly-report",
    label: "週次詳細レポート",
    price: "$0.50",
    cache: "24時間キャッシュ",
    description: "過去7日間のAPACオンチェーンデータをClaudeが詳細分析。マークダウン形式で返す。",
    color: "#a855f7",
  },
];

const features = [
  {
    icon: "◈",
    title: "Nansen Smart Money",
    body: "Token God Mode・Exchange Flows・Smart Moneyラベルを活用。プロ投資家と同じオンチェーンシグナルを取得。",
  },
  {
    icon: "◆",
    title: "Claude AI 日本語解析",
    body: "claude-sonnet-4-20250514がオンチェーンデータを読み込み、日本語で200文字以内の簡潔なサマリーを生成。",
  },
  {
    icon: "⬡",
    title: "x402 マイクロペイメント",
    body: "APIキー不要。Base上のUSDCで1リクエストごとに自動決済。サブスクリプションなし・従量課金のみ。",
  },
  {
    icon: "◉",
    title: "Vercel KV キャッシュ",
    body: "エンドポイントごとに最適なTTLを設定。Cronジョブが毎日0時にデータを事前取得しレイテンシを最小化。",
  },
];

const responseExample = `{
  "date": "2026-05-16",
  "region": "APAC",
  "summary_ja": "本日のAPACオンチェーンサマリー：\nBinanceへの純流入が+$12.5Mと強い資金流入。\nスマートマネーはETH・SOLを積極買い。",
  "exchange_flows": {
    "net_inflow_usd": 15000000,
    "top_inflow_exchange": "binance",
    "top_outflow_exchange": "okx"
  },
  "smart_money": {
    "top_buys": ["ETH", "SOL", "AVAX"],
    "top_sells": ["BTC", "MATIC"],
    "active_wallets": 323
  },
  "market_signal": "bullish",
  "data_sources": ["nansen", "dune"]
}`;

export default function Home() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(responseExample);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ background: "#0a0a0a", color: "#ededed", fontFamily: "Arial, Helvetica, sans-serif", minHeight: "100vh" }}>

      {/* Hero */}
      <section style={{ maxWidth: 900, margin: "0 auto", padding: "80px 24px 60px" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 20, padding: "6px 14px", marginBottom: 32 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#00ff87", display: "inline-block", boxShadow: "0 0 6px #00ff87" }} />
          <span style={{ fontSize: 13, color: "#888" }}>Powered by Nansen × Claude AI × x402</span>
        </div>

        <h1 style={{ fontSize: "clamp(36px, 6vw, 64px)", fontWeight: 800, lineHeight: 1.1, marginBottom: 24, letterSpacing: "-0.02em" }}>
          APAC<br />
          <span style={{ color: "#3b82f6" }}>Onchain Intelligence</span><br />
          Feed
        </h1>

        <p style={{ fontSize: 18, color: "#888", lineHeight: 1.7, maxWidth: 560, marginBottom: 40 }}>
          Nansenのスマートマネーデータを Claude AI が日本語で解析。<br />
          APACの取引所フロー・クジラ動向・週次レポートを<br />
          1リクエストから従量課金で取得。
        </p>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <a
            href="/api/discovery"
            style={{ background: "#3b82f6", color: "#fff", padding: "12px 28px", borderRadius: 8, fontWeight: 700, fontSize: 15, textDecoration: "none", display: "inline-block" }}
          >
            Discovery Document →
          </a>
          <a
            href="#endpoints"
            style={{ background: "#1a1a1a", color: "#ededed", padding: "12px 28px", borderRadius: 8, fontWeight: 700, fontSize: 15, textDecoration: "none", border: "1px solid #2a2a2a", display: "inline-block" }}
          >
            APIを見る
          </a>
        </div>
      </section>

      {/* Stats bar */}
      <section style={{ borderTop: "1px solid #1a1a1a", borderBottom: "1px solid #1a1a1a" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "28px 24px", display: "flex", gap: 40, flexWrap: "wrap" }}>
          {[
            { label: "対応取引所", value: "6" },
            { label: "最安値", value: "$0.10" },
            { label: "決済トークン", value: "USDC" },
            { label: "決済ネットワーク", value: "Base" },
            { label: "AI エンジン", value: "Claude" },
          ].map((stat) => (
            <div key={stat.label}>
              <div style={{ fontSize: 26, fontWeight: 800, color: "#00ff87" }}>{stat.value}</div>
              <div style={{ fontSize: 13, color: "#555", marginTop: 2 }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Endpoints */}
      <section id="endpoints" style={{ maxWidth: 900, margin: "0 auto", padding: "72px 24px 0" }}>
        <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>APIエンドポイント</h2>
        <p style={{ color: "#555", marginBottom: 40, fontSize: 15 }}>
          全エンドポイントはx402プロトコルでゲート。APIキー不要、USDCで自動決済。
        </p>

        <div style={{ display: "grid", gap: 16 }}>
          {endpoints.map((ep) => (
            <div
              key={ep.path}
              style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: 12, padding: "24px 28px", display: "flex", gap: 24, alignItems: "flex-start", flexWrap: "wrap" }}
            >
              <div style={{ flexShrink: 0 }}>
                <span style={{ background: "#1a2a1a", color: "#00ff87", fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 4, fontFamily: "monospace" }}>
                  {ep.method}
                </span>
              </div>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ fontFamily: "monospace", fontSize: 14, color: ep.color, marginBottom: 6 }}>{ep.path}</div>
                <div style={{ fontWeight: 600, marginBottom: 8 }}>{ep.label}</div>
                <div style={{ fontSize: 14, color: "#666", lineHeight: 1.6 }}>{ep.description}</div>
              </div>
              <div style={{ flexShrink: 0, textAlign: "right" }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: ep.color }}>{ep.price}</div>
                <div style={{ fontSize: 12, color: "#444", marginTop: 4 }}>{ep.cache}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ maxWidth: 900, margin: "0 auto", padding: "72px 24px 0" }}>
        <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 40 }}>機能</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))", gap: 20 }}>
          {features.map((f) => (
            <div key={f.title} style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: 12, padding: "28px" }}>
              <div style={{ fontSize: 28, marginBottom: 14, color: "#3b82f6" }}>{f.icon}</div>
              <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 10 }}>{f.title}</div>
              <div style={{ color: "#666", fontSize: 14, lineHeight: 1.7 }}>{f.body}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Coverage */}
      <section style={{ maxWidth: 900, margin: "0 auto", padding: "72px 24px 0" }}>
        <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>対応取引所</h2>
        <p style={{ color: "#555", marginBottom: 32, fontSize: 15 }}>APAC主要取引所を横断的にカバー</p>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {[
            { name: "Binance", tag: "APAC", color: "#f0b90b" },
            { name: "OKX", tag: "APAC", color: "#3b82f6" },
            { name: "Bybit", tag: "APAC", color: "#f7a600" },
            { name: "bitFlyer", tag: "Japan", color: "#00ff87" },
            { name: "Coincheck", tag: "Japan", color: "#00ff87" },
            { name: "bitbank", tag: "Japan", color: "#00ff87" },
          ].map((ex) => (
            <div
              key={ex.name}
              style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: 10, padding: "14px 20px", display: "flex", alignItems: "center", gap: 10 }}
            >
              <span style={{ fontWeight: 700 }}>{ex.name}</span>
              <span style={{ fontSize: 11, color: ex.color, background: ex.color + "1a", padding: "2px 7px", borderRadius: 4, fontWeight: 600 }}>{ex.tag}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Payment */}
      <section style={{ maxWidth: 900, margin: "0 auto", padding: "72px 24px 0" }}>
        <div style={{ background: "#0d1117", border: "1px solid #1e2a1e", borderRadius: 16, padding: "40px" }}>
          <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 260 }}>
              <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>
                <span style={{ color: "#00ff87" }}>x402</span> マイクロペイメント
              </h2>
              <p style={{ color: "#666", lineHeight: 1.7, fontSize: 15 }}>
                1リクエストごとにBase上のUSDCで自動決済。<br />
                サブスクリプションなし・APIキー不要。<br />
                エージェントもそのまま組み込み可能。
              </p>
            </div>
            <div style={{ flexShrink: 0 }}>
              <div style={{ background: "#111", border: "1px solid #1e2a1e", borderRadius: 10, padding: "16px 24px", fontFamily: "monospace", fontSize: 13 }}>
                <div style={{ color: "#444", marginBottom: 8 }}># HTTP 402 → 自動決済 → データ取得</div>
                <div><span style={{ color: "#00ff87" }}>network</span>: <span style={{ color: "#f59e0b" }}>Base</span></div>
                <div><span style={{ color: "#00ff87" }}>token</span>: <span style={{ color: "#f59e0b" }}>USDC</span></div>
                <div><span style={{ color: "#00ff87" }}>protocol</span>: <span style={{ color: "#f59e0b" }}>x402</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Response Example */}
      <section style={{ maxWidth: 900, margin: "0 auto", padding: "72px 24px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
          <div>
            <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>レスポンス例</h2>
            <p style={{ color: "#555", fontSize: 14 }}><span style={{ fontFamily: "monospace", color: "#3b82f6" }}>GET /api/feed/apac-daily</span></p>
          </div>
          <button
            onClick={handleCopy}
            style={{ background: copied ? "#1a2a1a" : "#1a1a1a", border: "1px solid #2a2a2a", color: copied ? "#00ff87" : "#888", borderRadius: 8, padding: "8px 16px", cursor: "pointer", fontSize: 13, fontFamily: "inherit" }}
          >
            {copied ? "✓ コピー済み" : "コピー"}
          </button>
        </div>

        <div style={{ background: "#080808", border: "1px solid #1a1a1a", borderRadius: 12, padding: "28px", overflowX: "auto" }}>
          <pre style={{ fontFamily: "monospace", fontSize: 13, lineHeight: 1.7, color: "#ccc", margin: 0, whiteSpace: "pre" }}>
            {responseExample}
          </pre>
        </div>
      </section>

      {/* How it works */}
      <section style={{ maxWidth: 900, margin: "0 auto", padding: "72px 24px 0" }}>
        <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 40 }}>仕組み</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {[
            { step: "01", title: "リクエスト送信", body: "エンドポイントにGETリクエストを送る。x402プロトコルがHTTP 402を返す。", color: "#3b82f6" },
            { step: "02", title: "USDC自動決済", body: "ウォレットがBase上のUSDCで指定金額を自動送金。承認後リクエストが通過。", color: "#00ff87" },
            { step: "03", title: "Nansenデータ取得", body: "Nansen APIからリアルタイムのスマートマネー・取引所フローデータを取得。", color: "#a855f7" },
            { step: "04", title: "Claude AI解析", body: "claude-sonnet-4-20250514がデータを分析し、日本語サマリーを生成。", color: "#f59e0b" },
            { step: "05", title: "JSONで返却", body: "構造化データ + 日本語サマリーをJSONで返却。キャッシュ済みなら即座に応答。", color: "#00ff87" },
          ].map((item, i) => (
            <div key={item.step} style={{ display: "flex", gap: 20 }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#111", border: `2px solid ${item.color}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: item.color, flexShrink: 0 }}>
                  {item.step}
                </div>
                {i < 4 && <div style={{ width: 2, height: 40, background: "#1a1a1a" }} />}
              </div>
              <div style={{ paddingBottom: i < 4 ? 0 : 0, paddingTop: 8 }}>
                <div style={{ fontWeight: 700, marginBottom: 4 }}>{item.title}</div>
                <div style={{ color: "#555", fontSize: 14, lineHeight: 1.6, paddingBottom: 28 }}>{item.body}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ maxWidth: 900, margin: "0 auto", padding: "72px 24px 100px" }}>
        <div style={{ background: "linear-gradient(135deg, #0d1a2d 0%, #0d1a0d 100%)", border: "1px solid #1e2a3a", borderRadius: 20, padding: "56px 40px", textAlign: "center" }}>
          <h2 style={{ fontSize: 32, fontWeight: 800, marginBottom: 16, lineHeight: 1.2 }}>
            APACのオンチェーン動向を<br />
            <span style={{ color: "#00ff87" }}>今すぐ把握する</span>
          </h2>
          <p style={{ color: "#555", marginBottom: 36, fontSize: 16 }}>
            APIキー不要。1リクエスト $0.10 から。
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <a
              href="/api/discovery"
              style={{ background: "#3b82f6", color: "#fff", padding: "14px 32px", borderRadius: 10, fontWeight: 700, fontSize: 16, textDecoration: "none", display: "inline-block" }}
            >
              Discovery Document
            </a>
            <a
              href="/api/feed/apac-daily"
              style={{ background: "#111", color: "#ededed", padding: "14px 32px", borderRadius: 10, fontWeight: 700, fontSize: 16, textDecoration: "none", border: "1px solid #2a2a2a", display: "inline-block" }}
            >
              /api/feed/apac-daily →
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid #1a1a1a", padding: "32px 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <div style={{ color: "#333", fontSize: 14 }}>
            Onchain Intelligence Feed — Nansen × Claude × x402
          </div>
          <div style={{ display: "flex", gap: 24, fontSize: 14 }}>
            <a href="/api/discovery" style={{ color: "#444", textDecoration: "none" }}>Discovery</a>
            <a href="/api/feed/apac-daily" style={{ color: "#444", textDecoration: "none" }}>APAC Daily</a>
            <a href="/api/feed/whale-alert" style={{ color: "#444", textDecoration: "none" }}>Whale Alert</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
