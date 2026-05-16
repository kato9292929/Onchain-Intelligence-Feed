import { NextResponse } from "next/server";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://onchain-intelligence-feed.vercel.app";

export async function GET() {
  const discovery = {
    name: "Onchain Intelligence Feed",
    description: "APACオンチェーンインテリジェンス API - Nansen × Claude AI による日本語マーケット分析",
    version: "1.0.0",
    base_url: BASE_URL,
    payment: {
      network: "base",
      token: "USDC",
      description: "Base上のUSDCで決済",
    },
    endpoints: [
      {
        path: "/api/feed/apac-daily",
        method: "GET",
        description: "日次APACオンチェーンサマリー（Nansen + Claude AI生成）",
        price_usd: 0.10,
        cache_ttl_seconds: 3600,
        response_language: "ja",
      },
      {
        path: "/api/feed/smart-money-jp",
        method: "GET",
        description: "日本関連スマートマネー動向（bitFlyer・Coincheck・bitbank）",
        price_usd: 0.15,
        cache_ttl_seconds: 1800,
        response_language: "ja",
      },
      {
        path: "/api/feed/whale-alert",
        method: "GET",
        description: "クジラアラート - $100K以上の大口移動をリアルタイム検知",
        price_usd: 0.20,
        cache_ttl_seconds: 0,
        response_language: "en",
      },
      {
        path: "/api/feed/weekly-report",
        method: "GET",
        description: "週次詳細レポート（マークダウン形式、Claude AI生成）",
        price_usd: 0.50,
        cache_ttl_seconds: 86400,
        response_language: "ja",
      },
    ],
    data_sources: ["nansen", "dune"],
    generated_at: new Date().toISOString(),
  };

  return NextResponse.json(discovery, {
    headers: { "Cache-Control": "public, max-age=3600" },
  });
}
